from fastapi import APIRouter, HTTPException
from models.schemas import ModelConfig
from database import load_session, save_session
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.metrics import (mean_absolute_error, mean_squared_error, r2_score,
                              accuracy_score, precision_score, recall_score, f1_score)

router = APIRouter()

@router.post("/train")
def train_model(config: ModelConfig):
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")

    df = pd.read_json(session["current_data"])

    if config.target_column not in df.columns:
        raise HTTPException(status_code=400, detail="Target column not found")

    df = df.dropna()
    X = df.drop(columns=[config.target_column])
    y = df[config.target_column]
    X = pd.get_dummies(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.test_size, random_state=42
    )

    task = "regression" if y.dtype in [np.float64, np.int64] and y.nunique() > 10 else "classification"

    models = {
        "linear_regression": LinearRegression() if task == "regression" else None,
        "logistic_regression": LogisticRegression(max_iter=1000) if task == "classification" else None,
        "decision_tree": DecisionTreeRegressor() if task == "regression" else DecisionTreeClassifier(),
    }

    results = {}
    for name, model in models.items():
        if model is None:
            continue
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if task == "regression":
            results[name] = {
                "mae": round(mean_absolute_error(y_test, preds), 4),
                "rmse": round(float(np.sqrt(mean_squared_error(y_test, preds))), 4),
                "r2": round(r2_score(y_test, preds), 4)
            }
        else:
            results[name] = {
                "accuracy": round(accuracy_score(y_test, preds), 4),
                "precision": round(precision_score(y_test, preds, average="weighted", zero_division=0), 4),
                "recall": round(recall_score(y_test, preds, average="weighted", zero_division=0), 4),
                "f1": round(f1_score(y_test, preds, average="weighted", zero_division=0), 4)
            }

    session["model_results"] = results
    session["task_type"] = task
    session["target_column"] = config.target_column
    session["feature_columns"] = list(X.columns)
    save_session(session)

    return {
        "task_type": task,
        "target_column": config.target_column,
        "results": results,
        "recommendation": get_recommendation(results, task)
    }

def get_recommendation(results: dict, task: str) -> str:
    if task == "regression":
        best = max(results, key=lambda k: results[k].get("r2", -999))
        score = results[best]["r2"]
        return f"{best.replace('_', ' ').title()} is recommended with R² of {score}. Higher R² means better fit."
    else:
        best = max(results, key=lambda k: results[k].get("f1", 0))
        score = results[best]["f1"]
        return f"{best.replace('_', ' ').title()} is recommended with F1-score of {score}."
