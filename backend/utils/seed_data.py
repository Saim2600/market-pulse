"""
Seeds the database with 30 realistic marketing campaigns across
Google / Meta / Facebook / LinkedIn and Retail / Finance / Healthcare / Education / SaaS.

Run:  python -m utils.seed_data
"""
import random
from datetime import datetime, timedelta

from database.db import SessionLocal, engine, Base
from models.models import Campaign, IndustryBenchmark, Platform, Industry

random.seed(42)

PLATFORMS = list(Platform)
INDUSTRIES = list(Industry)
AUDIENCES = ["18-24", "25-34", "35-44", "45-54", "55+", "B2B Decision Makers", "SMB Owners"]
CAMPAIGN_TYPES = ["awareness", "conversion", "retargeting", "lead-gen", "app-install"]
NAME_TEMPLATES = [
    "{industry} {platform} {ctype} Push",
    "{platform} {ctype} Sprint - {industry}",
    "{industry} Growth Campaign ({platform})",
    "{ctype} Blitz - {platform}",
]

PLATFORM_CTR_BONUS = {
    Platform.GOOGLE: 0.01,
    Platform.META: 0.005,
    Platform.FACEBOOK: 0.004,
    Platform.LINKEDIN: 0.008,
}

INDUSTRY_REVENUE_MULTIPLIER = {
    Industry.RETAIL: 1.0,
    Industry.FINANCE: 1.3,
    Industry.HEALTHCARE: 1.1,
    Industry.EDUCATION: 0.9,
    Industry.SAAS: 1.2,
}

CAMPAIGN_TYPE_CONV_ADJUSTMENT = {
    "awareness": -0.01,
    "conversion": 0.02,
    "retargeting": 0.01,
    "lead-gen": 0.015,
    "app-install": 0.01,
}


def _generate_campaign(i: int) -> dict:
    platform = random.choice(PLATFORMS)
    industry = random.choice(INDUSTRIES)
    audience = random.choice(AUDIENCES)
    ctype = random.choice(CAMPAIGN_TYPES)

    budget = round(random.uniform(2000, 50000), 2)
    duration_days = random.choice([7, 14, 21, 30, 45, 60])

    platform_ctr_bonus = PLATFORM_CTR_BONUS.get(platform, 0.0)
    industry_revenue = INDUSTRY_REVENUE_MULTIPLIER.get(industry, 1.0)
    campaign_conv_bonus = CAMPAIGN_TYPE_CONV_ADJUSTMENT.get(ctype, 0.0)

    base_ctr = random.uniform(0.01, 0.05) + platform_ctr_bonus
    impressions = int(budget * random.uniform(90, 220))
    clicks = max(1, int(impressions * base_ctr))

    conv_rate = round(max(0.01, min(0.22, random.uniform(0.01, 0.12) + campaign_conv_bonus)), 4)
    conversions = max(1, int(clicks * conv_rate))

    spend = round(budget * random.uniform(0.75, 0.95), 2)
    revenue_per_conv = random.uniform(30, 280) * industry_revenue
    revenue = round(conversions * revenue_per_conv, 2)

    roi = round(((revenue - spend) / spend) * 100, 2) if spend else 0
    roas = round(revenue / spend, 2) if spend else 0
    cac = round(spend / conversions, 2) if conversions else spend
    success = roi > 18 and conv_rate > 0.025

    name_template = random.choice(NAME_TEMPLATES)
    name = name_template.format(industry=industry.value.title(), platform=platform.value.title(), ctype=ctype.title())

    start_date = datetime.utcnow() - timedelta(days=random.randint(10, 300))

    return dict(
        name=name,
        platform=platform,
        industry=industry,
        audience=audience,
        campaign_type=ctype,
        budget=budget,
        duration_days=duration_days,
        spend=spend,
        revenue=revenue,
        roi=roi,
        roas=roas,
        cac=cac,
        conversion_rate=round(conv_rate * 100, 2),
        impressions=impressions,
        clicks=clicks,
        conversions=conversions,
        success=success,
        start_date=start_date,
    )


def seed(n: int = 100):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Campaign).count()
        if existing >= n:
            print(f"Database already has {existing} campaigns. Skipping seed.")
            return

        campaigns = [Campaign(**_generate_campaign(i)) for i in range(n)]
        db.add_all(campaigns)
        db.commit()
        print(f"Seeded {n} campaigns.")

        # Seed industry benchmarks (simple aggregate averages per industry)
        for industry in INDUSTRIES:
            rows = db.query(Campaign).filter(Campaign.industry == industry).all()
            if not rows:
                continue
            avg_roi = sum(r.roi for r in rows) / len(rows)
            avg_cac = sum(r.cac for r in rows) / len(rows)
            avg_conv = sum(r.conversion_rate for r in rows) / len(rows)
            avg_roas = sum(r.roas for r in rows) / len(rows)
            db.add(IndustryBenchmark(
                industry=industry,
                avg_roi=round(avg_roi, 2),
                avg_cac=round(avg_cac, 2),
                avg_conversion_rate=round(avg_conv, 2),
                avg_roas=round(avg_roas, 2),
            ))
        db.commit()
        print("Seeded industry benchmarks.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
