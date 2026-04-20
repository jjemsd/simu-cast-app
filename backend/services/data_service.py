import pandas as pd
import numpy as np

def load_dataframe(filepath: str) -> pd.DataFrame:
    if filepath.endswith(".csv"):
        for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
            try:
                return pd.read_csv(filepath, encoding=encoding)
            except UnicodeDecodeError:
                continue
        raise ValueError("Unable to decode CSV file with supported encodings")
    elif filepath.endswith((".xlsx", ".xls")):
        return pd.read_excel(filepath)
    raise ValueError("Unsupported file format")

def get_column_info(df: pd.DataFrame) -> list:
    info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if dtype in ["int64", "float64"]:
            col_type = "numeric"
        elif dtype == "object":
            col_type = "categorical"
        elif "datetime" in dtype:
            col_type = "datetime"
        else:
            col_type = "other"

        info.append({
            "name": col,
            "type": col_type,
            "dtype": dtype,
            "missing": int(df[col].isnull().sum()),
            "missing_pct": round(df[col].isnull().sum() / len(df) * 100, 2),
            "unique": int(df[col].nunique())
        })
    return info
