from fastapi import APIRouter, HTTPException
from database import load_session
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/descriptive")
def get_descriptive_stats():
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    stats = {}
    for col in numeric_cols:
        s = df[col].dropna()
        stats[col] = {
            "count": int(s.count()),
            "mean": round(float(s.mean()), 4),
            "median": round(float(s.median()), 4),
            "mode": round(float(s.mode()[0]), 4) if not s.mode().empty else None,
            "std": round(float(s.std()), 4),
            "variance": round(float(s.var()), 4),
            "sum": round(float(s.sum()), 4),
            "min": round(float(s.min()), 4),
            "max": round(float(s.max()), 4),
            "range": round(float(s.max() - s.min()), 4),
            "skewness": round(float(s.skew()), 4),
            "kurtosis": round(float(s.kurtosis()), 4),
            "q1": round(float(s.quantile(0.25)), 4),
            "q3": round(float(s.quantile(0.75)), 4),
        }

    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    freq_tables = {}
    for col in cat_cols:
        freq_tables[col] = df[col].value_counts().to_dict()

    return {
        "numeric_stats": stats,
        "frequency_tables": freq_tables,
        "numeric_columns": numeric_cols,
        "categorical_columns": cat_cols
    }
