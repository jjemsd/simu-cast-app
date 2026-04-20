from fastapi import APIRouter, UploadFile, File, HTTPException
from services.data_service import load_dataframe, get_column_info
from database import save_session, load_session
import os, shutil

router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    allowed = [".csv", ".xlsx", ".xls"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only CSV and Excel files allowed")

    path = f"uploads/{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = load_dataframe(path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    col_info = get_column_info(df)

    session = {
        "filename": file.filename,
        "filepath": path,
        "original_data": df.to_json(),
        "current_data": df.to_json(),
        "cleaning_log": [],
        "column_info": col_info
    }
    save_session(session)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "rows": len(df),
        "columns": len(df.columns),
        "column_info": col_info,
        "preview": df.head(5).to_dict(orient="records")
    }

@router.get("/data")
def get_full_data():
    import pandas as pd
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No dataset loaded")
    df = pd.read_json(session["current_data"])
    return {
        "data": df.to_dict(orient="records"),
        "columns": list(df.columns),
        "rows": len(df)
    }
