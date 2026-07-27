from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from auth.clerk_auth import get_current_user
from models.models import User
from schemas.schemas import BudgetOptimizeRequest, BudgetOptimizeResponse
from ml.predict import predict, ModelNotTrainedError

router = APIRouter(prefix="/optimizer", tags=["optimizer"])
PLATFORMS = ["google", "meta", "facebook", "linkedin"]


@router.post("/budget", response_model=BudgetOptimizeResponse)
def optimize_budget(payload: BudgetOptimizeRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Simple allocation strategy: run the ROI model per platform at an equal test budget,
    then allocate the total budget proportionally to predicted ROI (min-floor to avoid zeroing out a channel).
    """
    per_platform_roi = {}
    test_budget = payload.total_budget / len(PLATFORMS)

    for platform in PLATFORMS:
        try:
            result = predict({
                "budget": test_budget, "platform": platform, "industry": payload.industry,
                "audience": "25-34", "campaign_type": "conversion", "duration_days": 30,
            })
            per_platform_roi[platform] = max(result["predicted_roi"], 1)
        except ModelNotTrainedError:
            per_platform_roi[platform] = 1  # fallback equal split

    total_score = sum(per_platform_roi.values())
    allocation = {p: round(payload.total_budget * (score / total_score), 2) for p, score in per_platform_roi.items()}

    rationale = (
        "Allocation is weighted by each platform's model-predicted ROI at an equal test budget. "
        "Higher-ROI channels receive a larger share of total spend, with a floor to keep all channels active."
    )

    return BudgetOptimizeResponse(allocation=allocation, projected_roi=per_platform_roi, rationale=rationale)
