from fastapi import APIRouter, HTTPException
from database import load_session
from scipy import stats as scipy_stats
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/{column}")
def test_normality(column: str):
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])

    if column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")

    s = df[column].dropna()
    n = len(s)

    if n < 3:
        raise HTTPException(status_code=400, detail="Not enough data for normality test")

    if n <= 50:
        stat, p_value = scipy_stats.shapiro(s)
        test_used = "Shapiro-Wilk"
    else:
        stat, p_value = scipy_stats.kstest(s, 'norm', args=(s.mean(), s.std()))
        test_used = "Kolmogorov-Smirnov"

    is_normal = p_value > 0.05

    (osm, osr), (slope, intercept, r) = scipy_stats.probplot(s, dist="norm")

    return {
        "column": column,
        "test_used": test_used,
        "statistic": round(float(stat), 6),
        "p_value": round(float(p_value), 6),
        "is_normal": is_normal,
        "n": n,
        "qq_data": {
            "theoretical_quantiles": list(osm),
            "sample_quantiles": list(osr),
            "slope": float(slope),
            "intercept": float(intercept)
        }
    }
