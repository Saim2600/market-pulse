"""
All ORM models for MarketPulse AI.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, DateTime, ForeignKey, Text, Enum, Boolean, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.db import Base


def gen_uuid():
    return str(uuid.uuid4())


def enum_values(enum_cls):
    return [e.value for e in enum_cls]


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MARKETING_MANAGER = "marketing_manager"
    ANALYST = "analyst"


class Platform(str, enum.Enum):
    GOOGLE = "google"
    META = "meta"
    FACEBOOK = "facebook"
    LINKEDIN = "linkedin"


class Industry(str, enum.Enum):
    RETAIL = "retail"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    SAAS = "saas"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(
    Enum(
        UserRole,
        values_callable=enum_values,
    ),
    nullable=False,
    default=UserRole.ANALYST,
)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaigns = relationship("Campaign", back_populates="owner")
    chat_history = relationship("ChatHistory", back_populates="user")
    reports = relationship("Report", back_populates="user")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    owner_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)

    name = Column(String, nullable=False)
    platform = Column(
        Enum(
            Platform,
            values_callable=enum_values,
        ),
        nullable=False,
    )

    industry = Column(
        Enum(
            Industry,
            values_callable=enum_values,
        ),
        nullable=False,
    )
    audience = Column(String, nullable=False)
    campaign_type = Column(String, nullable=False)  # e.g. awareness, conversion, retargeting

    budget = Column(Float, nullable=False)
    duration_days = Column(Integer, nullable=False)

    spend = Column(Float, default=0)
    revenue = Column(Float, default=0)
    roi = Column(Float, default=0)
    roas = Column(Float, default=0)
    cac = Column(Float, default=0)
    conversion_rate = Column(Float, default=0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    success = Column(Boolean, default=False)  # ground truth label for classifier

    start_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="campaigns")
    metrics = relationship("CampaignMetrics", back_populates="campaign", cascade="all, delete-orphan")
    predictions = relationship("PredictionHistory", back_populates="campaign")


class CampaignMetrics(Base):
    """Daily/periodic time-series metrics for a campaign, used for trend charts."""
    __tablename__ = "campaign_metrics"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    campaign_id = Column(UUID(as_uuid=False), ForeignKey("campaigns.id"), nullable=False)

    date = Column(DateTime, nullable=False)
    spend = Column(Float, default=0)
    revenue = Column(Float, default=0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)

    campaign = relationship("Campaign", back_populates="metrics")


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    campaign_id = Column(UUID(as_uuid=False), ForeignKey("campaigns.id"), nullable=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)

    input_payload = Column(JSON, nullable=False)
    predicted_roi = Column(Float)
    predicted_cac = Column(Float)
    predicted_revenue = Column(Float)
    predicted_conversion_rate = Column(Float)
    predicted_success_probability = Column(Float)
    confidence_score = Column(Float)
    feature_importance = Column(JSON)
    explanation = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="predictions")


class UploadedDataset(Base):
    __tablename__ = "uploaded_datasets"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    filename = Column(String, nullable=False)
    row_count = Column(Integer, default=0)
    status = Column(String, default="uploaded")  # uploaded -> validated -> stored -> retrained -> ready
    error_log = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    report_type = Column(String, nullable=False)  # weekly, monthly, executive, investor, campaign
    file_path = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=False)  # user | assistant
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_history")


class IndustryBenchmark(Base):
    __tablename__ = "industry_benchmarks"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    industry = Column(
    Enum(
        Industry,
        values_callable=enum_values,
    ),
    nullable=False,
    )
    avg_roi = Column(Float)
    avg_cac = Column(Float)
    avg_conversion_rate = Column(Float)
    avg_roas = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)
