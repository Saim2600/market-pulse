from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from auth.clerk_auth import get_current_user
from models.models import User, ChatHistory, Campaign
from schemas.schemas import ChatRequest, ChatResponse
from ai.gemini_service import copilot_reply

router = APIRouter(prefix="/chat", tags=["chat"])


def _build_campaign_context(db: Session) -> str:
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).limit(30).all()
    if not campaigns:
        return "No campaign data available yet."
    lines = [
        f"{c.name} | {c.platform.value if hasattr(c.platform,'value') else c.platform} | "
        f"{c.industry.value if hasattr(c.industry,'value') else c.industry} | ROI {c.roi}% | "
        f"CAC ${c.cac} | Revenue ${c.revenue} | ConvRate {c.conversion_rate}%"
        for c in campaigns
    ]
    return "\n".join(lines)


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    history = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.created_at.desc()).limit(10).all()
    history_dicts = [{"role": h.role, "message": h.message} for h in reversed(history)]

    context = _build_campaign_context(db)

    try:
        reply = copilot_reply(payload.message, context, history_dicts)
    except RuntimeError as exc:
        reply = f"AI Copilot is not configured yet: {exc}"

    db.add(ChatHistory(user_id=user.id, role="user", message=payload.message))
    db.add(ChatHistory(user_id=user.id, role="assistant", message=reply))
    db.commit()

    return ChatResponse(reply=reply)
