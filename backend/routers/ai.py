from fastapi import APIRouter, HTTPException
from models.schemas import AIRequest
from services.ai_service import get_ai_response, get_contextual_hint
from database import load_session

router = APIRouter()

@router.post("/chat")
async def chat(request: AIRequest):
    session = load_session()
    context = ""
    if session:
        context = f"Dataset: {session.get('filename', 'unknown')}"
    response = await get_ai_response(request.message, context, request.step)
    return {"response": response}

@router.get("/hint/{step}")
async def get_hint(step: str):
    session = load_session()
    if not session:
        return {"hint": "Upload a dataset to get started."}
    hint = await get_contextual_hint(step, session)
    return {"hint": hint}
