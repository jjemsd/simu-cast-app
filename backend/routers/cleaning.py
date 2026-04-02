from fastapi import APIRouter, HTTPException
from models.schemas import CleaningAction
from database import load_session, save_session
import pandas as pd
from fastapi.responses import StreamingResponse
import io

router = APIRouter()

@router.get("/summary")
def get_cleaning_summary():
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])

    summary = {}
    for col in df.columns:
        missing = int(df[col].isnull().sum())
        summary[col] = {
            "missing_count": missing,
            "missing_pct": round(missing / len(df) * 100, 2),
            "dtype": str(df[col].dtype),
            "unique": int(df[col].nunique())
        }

    duplicates = int(df.duplicated().sum())
    return {
        "columns": summary,
        "total_rows": len(df),
        "duplicate_rows": duplicates,
        "cleaning_log": session.get("cleaning_log", [])
    }

@router.post("/action")
def perform_cleaning_action(action: CleaningAction):
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])
    log = session.get("cleaning_log", [])

    if action.action == "drop_missing_column":
        before = len(df)
        df = df.dropna(subset=[action.column])
        after = len(df)
        log.append(f"Dropped {before - after} rows with missing values in column '{action.column}'")

    elif action.action == "impute_mean":
        val = round(df[action.column].mean(), 2)
        df[action.column] = df[action.column].fillna(val)
        log.append(f"Imputed missing values in '{action.column}' with mean ({val})")

    elif action.action == "impute_median":
        val = round(df[action.column].median(), 2)
        df[action.column] = df[action.column].fillna(val)
        log.append(f"Imputed missing values in '{action.column}' with median ({val})")

    elif action.action == "impute_mode":
        mode_val = df[action.column].mode()[0]
        df[action.column] = df[action.column].fillna(mode_val)
        log.append(f"Imputed missing values in '{action.column}' with mode ({mode_val})")

    elif action.action == "drop_column":
        df = df.drop(columns=[action.column])
        log.append(f"Dropped column '{action.column}'")

    elif action.action == "drop_duplicates":
        before = len(df)
        df = df.drop_duplicates()
        after = len(df)
        log.append(f"Removed {before - after} duplicate rows")

    elif action.action == "drop_outliers":
        col = action.column
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        before = len(df)
        df = df[~((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR)))]
        after = len(df)
        log.append(f"Removed {before - after} outlier rows from '{col}' using IQR method")

    session["current_data"] = df.to_json()
    session["cleaning_log"] = log
    save_session(session)

    return {
        "message": "Action performed successfully",
        "rows_remaining": len(df),
        "cleaning_log": log
    }

@router.get("/export")
def export_cleaned_data():
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cleaned_data.csv"}
    )
