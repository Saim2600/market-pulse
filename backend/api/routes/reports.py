import os
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

from database.db import get_db
from auth.clerk_auth import get_current_user
from models.models import User, Report, Campaign
from schemas.schemas import ReportRequest, ReportOut
from ai.gemini_service import summarize_for_report

router = APIRouter(prefix="/reports", tags=["reports"])
REPORTS_DIR = "reports_output"


@router.post("", response_model=ReportOut)
def generate_report(payload: ReportRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    os.makedirs(REPORTS_DIR, exist_ok=True)

    query = db.query(Campaign)
    if payload.campaign_id:
        query = query.filter(Campaign.id == payload.campaign_id)
    campaigns = query.order_by(Campaign.created_at.desc()).limit(50).all()

    total_revenue = sum(c.revenue for c in campaigns)
    total_spend = sum(c.spend for c in campaigns)
    avg_roi = round(sum(c.roi for c in campaigns) / len(campaigns), 2) if campaigns else 0
    data_summary = f"{len(campaigns)} campaigns, total revenue ${total_revenue:.0f}, total spend ${total_spend:.0f}, avg ROI {avg_roi}%"

    try:
        summary = summarize_for_report(payload.report_type, data_summary)
    except RuntimeError as exc:
        summary = f"AI summary unavailable: {exc}"

    filename = f"{payload.report_type}_report_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    c.setFont("Helvetica-Bold", 18)
    c.drawString(1 * inch, height - 1 * inch, f"MarketPulse AI — {payload.report_type.title()} Report")
    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, height - 1.3 * inch, datetime.utcnow().strftime("Generated %Y-%m-%d %H:%M UTC"))

    c.setFont("Helvetica-Bold", 12)
    c.drawString(1 * inch, height - 1.8 * inch, "Key Metrics")
    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, height - 2.05 * inch, f"Campaigns analyzed: {len(campaigns)}")
    c.drawString(1 * inch, height - 2.25 * inch, f"Total revenue: ${total_revenue:,.2f}")
    c.drawString(1 * inch, height - 2.45 * inch, f"Total spend: ${total_spend:,.2f}")
    c.drawString(1 * inch, height - 2.65 * inch, f"Average ROI: {avg_roi}%")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(1 * inch, height - 3.1 * inch, "Executive Summary (AI-generated)")
    c.setFont("Helvetica", 9)
    text_obj = c.beginText(1 * inch, height - 3.35 * inch)
    text_obj.setLeading(13)
    for line in _wrap_text(summary, 95):
        text_obj.textLine(line)
    c.drawText(text_obj)
    c.showPage()
    c.save()

    report = Report(user_id=user.id, report_type=payload.report_type, file_path=filepath, summary=summary)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    return FileResponse(report.file_path, media_type="application/pdf", filename=os.path.basename(report.file_path))


def _wrap_text(text: str, width: int):
    words = text.split()
    lines, current = [], ""
    for w in words:
        if len(current) + len(w) + 1 <= width:
            current += (" " if current else "") + w
        else:
            lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines
