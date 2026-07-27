from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from auth.clerk_auth import get_current_user
from models.models import User, PredictionHistory
from schemas.schemas import PredictionRequest, PredictionResponse
from ml.predict import predict, ModelNotTrainedError
from ai.gemini_service import explain_prediction

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("", response_model=PredictionResponse)
def create_prediction(payload: PredictionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inputs = payload.model_dump(exclude={"campaign_id"})
    try:
        result = predict(inputs)
    except ModelNotTrainedError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    # Explainable AI is mandatory — never return numbers without an explanation.
    try:
        explanation = explain_prediction(result, inputs)
    except Exception as exc:
        explanation = f"[Explanation unavailable: {exc}]"

    record = PredictionHistory(
        campaign_id=payload.campaign_id,
        user_id=user.id,
        input_payload=inputs,
        predicted_roi=result["predicted_roi"],
        predicted_cac=result["predicted_cac"],
        predicted_revenue=result["predicted_revenue"],
        predicted_conversion_rate=result["predicted_conversion_rate"],
        predicted_success_probability=result["predicted_success_probability"],
        confidence_score=result["confidence_score"],
        feature_importance=result["feature_importance"],
        explanation=explanation,
    )
    db.add(record)
    db.commit()

    return {**result, "explanation": explanation}
