import io
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from auth.clerk_auth import get_current_user
from models.models import User, UploadedDataset, Platform, Industry
from repositories.campaign_repository import CampaignRepository
from ml.train import train_all_models
from schemas.schemas import UploadStatus

router = APIRouter(prefix="/upload", tags=["upload"])

REQUIRED_COLUMNS = {"name", "platform", "industry", "audience", "campaign_type", "budget", "duration_days",
                     "spend", "revenue", "impressions", "clicks", "conversions"}


@router.post("/csv", response_model=UploadStatus)
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    dataset = UploadedDataset(user_id=user.id, filename=file.filename, status="uploaded")
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    try:
        raw = file.file.read()
        df = pd.read_csv(io.BytesIO(raw))

        # --- Validate ---
        missing = REQUIRED_COLUMNS - set(df.columns.str.lower())
        if missing:
            dataset.status = "failed"
            dataset.error_log = f"Missing required columns: {sorted(missing)}"
            db.commit()
            raise HTTPException(status_code=422, detail=dataset.error_log)

        df.columns = df.columns.str.lower()
        valid_platforms = {p.value for p in Platform}
        valid_industries = {i.value for i in Industry}
        df = df[df["platform"].str.lower().isin(valid_platforms)]
        df = df[df["industry"].str.lower().isin(valid_industries)]

        dataset.status = "validated"
        db.commit()

        # --- Store ---
        rows = []
        for _, r in df.iterrows():
            spend, revenue, conversions, clicks = float(r["spend"]), float(r["revenue"]), int(r["conversions"]), int(r["clicks"])
            roi = round(((revenue - spend) / spend) * 100, 2) if spend else 0
            rows.append(dict(
                name=str(r["name"]), platform=r["platform"].lower(), industry=r["industry"].lower(),
                audience=str(r["audience"]), campaign_type=str(r["campaign_type"]),
                budget=float(r["budget"]), duration_days=int(r["duration_days"]),
                spend=spend, revenue=revenue,
                roi=roi, roas=round(revenue / spend, 2) if spend else 0,
                cac=round(spend / conversions, 2) if conversions else 0,
                conversion_rate=round((conversions / clicks) * 100, 2) if clicks else 0,
                impressions=int(r["impressions"]), clicks=clicks, conversions=conversions,
                success=roi > 15,
            ))
        repo = CampaignRepository(db)
        inserted = repo.bulk_create(rows)

        dataset.row_count = inserted
        dataset.status = "stored"
        db.commit()

        # --- Retrain ---
        try:
            train_all_models()
            dataset.status = "ready"
        except ValueError as exc:
            dataset.status = "stored"
            dataset.error_log = f"Retrain skipped: {exc}"
        db.commit()

    except HTTPException:
        raise
    except Exception as exc:
        dataset.status = "failed"
        dataset.error_log = str(exc)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Upload pipeline failed: {exc}")

    return UploadStatus(
        dataset_id=dataset.id, filename=dataset.filename, row_count=dataset.row_count,
        status=dataset.status, error_log=dataset.error_log,
    )
