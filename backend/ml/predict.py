"""
Loads trained model artifacts and serves predictions + feature importance.
"""
import os
import joblib
import numpy as np
import pandas as pd

from config.settings import get_settings
from ml.train import CATEGORICAL, NUMERIC, TARGETS

settings = get_settings()
ARTIFACT_DIR = settings.MODEL_ARTIFACT_DIR


class ModelNotTrainedError(Exception):
    pass


def _load(name: str):
    path = os.path.join(ARTIFACT_DIR, name)
    if not os.path.exists(path):
        raise ModelNotTrainedError(
            f"Model artifact '{name}' not found. Run `python -m ml.train` or upload data first."
        )
    return joblib.load(path)


def _get_feature_importance(pipeline, top_n: int = 8) -> dict:
    model = pipeline.named_steps["model"]
    prep = pipeline.named_steps["prep"]
    try:
        cat_names = list(prep.named_transformers_["cat"].get_feature_names_out(CATEGORICAL))
    except Exception:
        cat_names = []
    feature_names = cat_names + NUMERIC
    importances = model.feature_importances_
    pairs = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)[:top_n]
    return {name: round(float(val), 4) for name, val in pairs}


def predict(payload: dict) -> dict:
    """
    payload keys: budget, platform, industry, audience, campaign_type, duration_days
    """
    row = pd.DataFrame([{
        "platform": payload["platform"],
        "industry": payload["industry"],
        "audience": payload["audience"],
        "campaign_type": payload["campaign_type"],
        "budget": payload["budget"],
        "duration_days": payload["duration_days"],
    }])

    results = {}
    accuracy = {}
    importance_agg = {}

    for target in TARGETS:
        pipeline = _load(f"{target}_model.joblib")
        pred = float(pipeline.predict(row)[0])
        results[target] = round(pred, 2)
        importance_agg[target] = _get_feature_importance(pipeline)

    clf_pipeline = _load("success_model.joblib")
    proba = clf_pipeline.predict_proba(row)[0]
    success_idx = list(clf_pipeline.named_steps["model"].classes_).index(1) if 1 in clf_pipeline.named_steps["model"].classes_ else -1
    success_probability = float(proba[success_idx]) if success_idx != -1 else float(max(proba))

    metrics = _load("metrics.joblib") if os.path.exists(os.path.join(ARTIFACT_DIR, "metrics.joblib")) else {}
    for k, v in metrics.items():
        accuracy[k] = v.get("r2_score", v.get("accuracy", 0.0))

    # Confidence: blend of classifier certainty and average regressor R2
    reg_scores = [metrics.get(t, {}).get("r2_score", 0.5) for t in TARGETS]
    avg_r2 = max(0.0, min(1.0, float(np.mean(reg_scores)))) if reg_scores else 0.5
    confidence_score = round(float((success_probability + avg_r2) / 2 * 100), 1)

    # Merge feature importance across regressors (use ROI model as primary driver display)
    primary_importance = importance_agg.get("roi", {})

    return {
        "predicted_roi": results.get("roi", 0.0),
        "predicted_cac": results.get("cac", 0.0),
        "predicted_revenue": results.get("revenue", 0.0),
        "predicted_conversion_rate": results.get("conversion_rate", 0.0),
        "predicted_success_probability": round(success_probability * 100, 1),
        "confidence_score": confidence_score,
        "model_accuracy": accuracy,
        "feature_importance": primary_importance,
    }
