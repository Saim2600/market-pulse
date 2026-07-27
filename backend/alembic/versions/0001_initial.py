"""Initial database schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-07-25 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
def upgrade():
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("clerk_user_id", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("role", sa.Enum("admin", "marketing_manager", "analyst", name="userrole"), nullable=False, server_default="analyst"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("platform", sa.Enum("google", "meta", "facebook", "linkedin", name="platform"), nullable=False),
        sa.Column("industry", sa.Enum("retail", "finance", "healthcare", "education", "saas", name="industry"), nullable=False),
        sa.Column("audience", sa.String(), nullable=False),
        sa.Column("campaign_type", sa.String(), nullable=False),
        sa.Column("budget", sa.Float(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("spend", sa.Float(), nullable=True, server_default="0"),
        sa.Column("revenue", sa.Float(), nullable=True, server_default="0"),
        sa.Column("roi", sa.Float(), nullable=True, server_default="0"),
        sa.Column("roas", sa.Float(), nullable=True, server_default="0"),
        sa.Column("cac", sa.Float(), nullable=True, server_default="0"),
        sa.Column("conversion_rate", sa.Float(), nullable=True, server_default="0"),
        sa.Column("impressions", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("clicks", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("conversions", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("success", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("start_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "campaign_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("spend", sa.Float(), nullable=True, server_default="0"),
        sa.Column("revenue", sa.Float(), nullable=True, server_default="0"),
        sa.Column("impressions", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("clicks", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("conversions", sa.Integer(), nullable=True, server_default="0"),
    )

    op.create_table(
        "prediction_history",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("campaigns.id"), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("input_payload", sa.JSON(), nullable=False),
        sa.Column("predicted_roi", sa.Float(), nullable=True),
        sa.Column("predicted_cac", sa.Float(), nullable=True),
        sa.Column("predicted_revenue", sa.Float(), nullable=True),
        sa.Column("predicted_conversion_rate", sa.Float(), nullable=True),
        sa.Column("predicted_success_probability", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("feature_importance", sa.JSON(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "uploaded_datasets",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("row_count", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("status", sa.String(), nullable=True, server_default="uploaded"),
        sa.Column("error_log", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("report_type", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "chat_history",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "industry_benchmarks",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("industry", sa.Enum("retail", "finance", "healthcare", "education", "saas", name="industry"), nullable=False),
        sa.Column("avg_roi", sa.Float(), nullable=True),
        sa.Column("avg_cac", sa.Float(), nullable=True),
        sa.Column("avg_conversion_rate", sa.Float(), nullable=True),
        sa.Column("avg_roas", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade():
    op.drop_table("industry_benchmarks")
    op.drop_table("chat_history")
    op.drop_table("reports")
    op.drop_table("uploaded_datasets")
    op.drop_table("prediction_history")
    op.drop_table("campaign_metrics")
    op.drop_table("campaigns")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS platform")
    op.execute("DROP TYPE IF EXISTS industry")
