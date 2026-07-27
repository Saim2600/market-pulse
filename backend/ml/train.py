"""
Trains the MarketPulse ML models directly from the `campaigns` table.

Regressors (RandomForestRegressor): ROI, CAC, Revenue, Conversion Rate
Classifier  (RandomForestClassifier): Campaign Success Probability

Run manually:  python -m ml.train
Also called automatically after CSV upload / manual campaign entry.
"""
import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from database.db import SessionLocal
from models.models import Campaign
from config.settings import get_settings

settings = get_settings()
ARTIFACT_DIR = settings.MODEL_ARTIFACT_DIR
CATEGORICAL = ["platform", "industry", "audience", "campaign_type"]
NUMERIC = ["budget", "duration_days"]
TARGETS = ["roi", "cac", "revenue", "conversion_rate"]


def _load_dataframe() -> pd.DataFrame:
    db = SessionLocal()
    try:
        rows = db.query(Campaign).all()
        data = [{
            "platform": c.platform.value if hasattr(c.platform, "value") else c.platform,
            "industry": c.industry.value if hasattr(c.industry, "value") else c.industry,
            "audience": c.audience,
            "campaign_type": c.campaign_type,
            "budget": c.budget,
            "duration_days": c.duration_days,
            "roi": c.roi,
            "cac": c.cac,
            "revenue": c.revenue,
            "conversion_rate": c.conversion_rate,
            "success": int(c.success),
        } for c in rows]
        return pd.DataFrame(data)
    finally:
        db.close()


def _build_preprocessor():
    return ColumnTransformer(transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ], remainder="passthrough")


def train_all_models(min_rows: int = 10) -> dict:
    """Trains all 5 models and persists them + metadata to ARTIFACT_DIR."""
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    df = _load_dataframe()

    if len(df) < min_rows:
        raise ValueError(f"Need at least {min_rows} campaigns to train, found {len(df)}.")

    X = df[CATEGORICAL + NUMERIC]
    metrics_report = {}

    # --- Regressors ---
    for target in TARGETS:
        y = df[target]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        pipeline = Pipeline([
            ("prep", _build_preprocessor()),
            ("model", RandomForestRegressor(n_estimators=200, random_state=42, max_depth=8)),
        ])
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        score = r2_score(y_test, preds) if len(y_test) > 1 else 0.0

        joblib.dump(pipeline, os.path.join(ARTIFACT_DIR, f"{target}_model.joblib"))
        metrics_report[target] = {"r2_score": round(float(score), 4), "n_samples": len(df)}

    # --- Classifier ---
    y_cls = df["success"]
    X_train, X_test, y_train, y_test = train_test_split(X, y_cls, test_size=0.2, random_state=42, stratify=y_cls if y_cls.nunique() > 1 else None)

    clf_pipeline = Pipeline([
        ("prep", _build_preprocessor()),
        ("model", RandomForestClassifier(n_estimators=200, random_state=42, max_depth=8)),
    ])
    clf_pipeline.fit(X_train, y_train)
    preds = clf_pipeline.predict(X_test)
    acc = accuracy_score(y_test, preds) if len(y_test) > 1 else 0.0

    joblib.dump(clf_pipeline, os.path.join(ARTIFACT_DIR, "success_model.joblib"))
    metrics_report["success"] = {"accuracy": round(float(acc), 4), "n_samples": len(df)}

    joblib.dump(metrics_report, os.path.join(ARTIFACT_DIR, "metrics.joblib"))
    return metrics_report


if __name__ == "__main__":
    report = train_all_models()
    print("Training complete:", report)
