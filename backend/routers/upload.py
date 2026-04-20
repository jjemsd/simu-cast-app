import os
import shutil

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from database import load_session, save_session
from services.data_service import df_to_records, get_column_info, load_dataframe

router = APIRouter()

ALLOWED_EXTS = {".csv", ".xlsx", ".xls"}
UPLOAD_DIR = "uploads"


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    # Strip any path components from the client-supplied filename to prevent
    # path traversal (e.g. "../../etc/passwd").
    safe_name = os.path.basename(file.filename or "")
    ext = os.path.splitext(safe_name)[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Only CSV and Excel files allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = os.path.join(UPLOAD_DIR, safe_name)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = load_dataframe(path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    col_info = get_column_info(df)

    session = {
        "filename": safe_name,
        "filepath": path,
        "original_data": df.to_json(),
        "current_data": df.to_json(),
        "cleaning_log": [],
        "column_info": col_info,
    }
    save_session(session)

    return {
        "message": "File uploaded successfully",
        "filename": safe_name,
        "rows": len(df),
        "columns": len(df.columns),
        "column_info": col_info,
        "preview": df_to_records(df.head(5)),
    }


@router.get("/data")
def get_full_data():
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])
    return {
        "data": df_to_records(df),
        "columns": list(df.columns),
        "rows": len(df),
    }
