from fastapi import APIRouter, HTTPException
from models.schemas import SimulationConfig
from database import load_session
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.model_selection import train_test_split

router = APIRouter()

@router.post("/predict")
def predict(config: SimulationConfig):
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")

    df = pd.read_json(session["current_data"])
    df = df.dropna()

    target = config.target_column
    X = df.drop(columns=[target])
    y = df[target]
    X = pd.get_dummies(X)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    task = session.get("task_type", "regression")
    model_map = {
        "linear_regression": LinearRegression(),
        "logistic_regression": LogisticRegression(max_iter=1000),
        "decision_tree": DecisionTreeRegressor() if task == "regression" else DecisionTreeClassifier()
    }

    model = model_map.get(config.model_type)
    if not model:
        raise HTTPException(status_code=400, detail="Invalid model type")

    model.fit(X_train, y_train)

    input_df = pd.DataFrame([config.input_values])
    input_df = pd.get_dummies(input_df).reindex(columns=X.columns, fill_value=0)

    prediction = model.predict(input_df)[0]

    return {
        "prediction": float(prediction),
        "model_used": config.model_type,
        "target_column": target,
        "input_values": config.input_values
    }
