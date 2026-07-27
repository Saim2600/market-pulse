"""
Pydantic request/response schemas.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


# ---------- Campaign ----------
class CampaignBase(BaseModel):
    name: str
    platform: str
    industry: str
    audience: str
    campaign_type: str
    budget: float
    duration_days: int


class CampaignCreate(CampaignBase):
    spend: Optional[float] = 0
    revenue: Optional[float] = 0
    impressions: Optional[int] = 0
    clicks: Optional[int] = 0
    conversions: Optional[int] = 0


class CampaignOut(CampaignBase):
    id: str
    spend: float
    revenue: float
    roi: float
    roas: float
    cac: float
    conversion_rate: float
    impressions: int
    clicks: int
    conversions: int
    success: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Prediction ----------
class PredictionRequest(BaseModel):
    budget: float = Field(..., gt=0)
    platform: str
    industry: str
    audience: str
    campaign_type: str
    duration_days: int = Field(..., gt=0)
    campaign_id: Optional[str] = None


class PredictionResponse(BaseModel):
    predicted_roi: float
    predicted_cac: float
    predicted_revenue: float
    predicted_conversion_rate: float
    predicted_success_probability: float
    confidence_score: float
    model_accuracy: Dict[str, float]
    feature_importance: Dict[str, float]
    explanation: str

    model_config = ConfigDict(protected_namespaces=())


# ---------- Upload ----------
class UploadStatus(BaseModel):
    dataset_id: str
    filename: str
    row_count: int
    status: str
    error_log: Optional[str] = None


# ---------- Chat ----------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# ---------- Reports ----------
class ReportRequest(BaseModel):
    report_type: str  # weekly | monthly | executive | investor | campaign
    campaign_id: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    report_type: str
    file_path: Optional[str]
    summary: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Budget optimizer ----------
class BudgetOptimizeRequest(BaseModel):
    total_budget: float
    industry: str


class BudgetOptimizeResponse(BaseModel):
    allocation: Dict[str, float]
    projected_roi: Dict[str, float]
    rationale: str
