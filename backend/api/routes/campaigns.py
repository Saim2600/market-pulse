from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.db import get_db
from auth.clerk_auth import get_current_user
from models.models import User, IndustryBenchmark
from repositories.campaign_repository import CampaignRepository
from schemas.schemas import CampaignCreate, CampaignOut

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("", response_model=List[CampaignOut])
def list_campaigns(
    search: Optional[str] = None,
    platform: Optional[str] = None,
    industry: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    skip: int = 0,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = CampaignRepository(db)
    return repo.list(search, platform, industry, sort_by, sort_dir, skip, limit)


@router.get("/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = CampaignRepository(db)
    campaign = repo.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("/{campaign_id}/benchmark")
def get_campaign_benchmark(campaign_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = CampaignRepository(db)
    campaign = repo.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    benchmark = db.query(IndustryBenchmark).filter(IndustryBenchmark.industry == campaign.industry).first()
    if not benchmark:
        raise HTTPException(status_code=404, detail="No benchmark available for this industry yet")
    return {
        "campaign": {"roi": campaign.roi, "cac": campaign.cac, "conversion_rate": campaign.conversion_rate, "roas": campaign.roas},
        "industry_avg": {"roi": benchmark.avg_roi, "cac": benchmark.avg_cac, "conversion_rate": benchmark.avg_conversion_rate, "roas": benchmark.avg_roas},
    }


@router.post("", response_model=CampaignOut, status_code=201)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    repo = CampaignRepository(db)
    data = payload.model_dump()
    spend = data.get("spend") or 0
    revenue = data.get("revenue") or 0
    conversions = data.get("conversions") or 0
    clicks = data.get("clicks") or 0

    data["roi"] = round(((revenue - spend) / spend) * 100, 2) if spend else 0
    data["roas"] = round(revenue / spend, 2) if spend else 0
    data["cac"] = round(spend / conversions, 2) if conversions else 0
    data["conversion_rate"] = round((conversions / clicks) * 100, 2) if clicks else 0
    data["success"] = data["roi"] > 15
    data["owner_id"] = user.id

    return repo.create(**data)
