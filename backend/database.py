import json
import os

SESSION_FILE = "session_data.json"

def save_session(data: dict):
    with open(SESSION_FILE, "w") as f:
        json.dump(data, f)

def load_session() -> dict:
    if not os.path.exists(SESSION_FILE):
        return {}
    with open(SESSION_FILE, "r") as f:
        return json.load(f)

def clear_session():
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)
