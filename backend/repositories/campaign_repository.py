"""
Data access layer for Campaign entities. Keeps raw SQLAlchemy queries out of the service layer.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.models import Campaign


class CampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, search: Optional[str] = None, platform: Optional[str] = None,
              industry: Optional[str] = None, sort_by: str = "created_at",
              sort_dir: str = "desc", skip: int = 0, limit: int = 50) -> List[Campaign]:
        query = self.db.query(Campaign)

        if search:
            query = query.filter(or_(Campaign.name.ilike(f"%{search}%")))
        if platform:
            query = query.filter(Campaign.platform == platform)
        if industry:
            query = query.filter(Campaign.industry == industry)

        column = getattr(Campaign, sort_by, Campaign.created_at)
        query = query.order_by(column.desc() if sort_dir == "desc" else column.asc())

        return query.offset(skip).limit(limit).all()

    def count(self) -> int:
        return self.db.query(Campaign).count()

    def get(self, campaign_id: str) -> Optional[Campaign]:
        return self.db.query(Campaign).filter(Campaign.id == campaign_id).first()

    def create(self, **kwargs) -> Campaign:
        campaign = Campaign(**kwargs)
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def bulk_create(self, rows: List[dict]) -> int:
        objs = [Campaign(**row) for row in rows]
        self.db.add_all(objs)
        self.db.commit()
        return len(objs)

    def all_for_training(self) -> List[Campaign]:
        return self.db.query(Campaign).all()
