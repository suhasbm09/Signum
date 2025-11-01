"""
AI routes - AI Assistant and Chat
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.services.ai.ai_service import ai_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's message")
    context: Optional[str] = Field(default="General Learning", description="Current page/topic")
    screen_content: Optional[str] = Field(default="", description="Content visible on screen")
    conversation_history: Optional[List[Dict]] = Field(default=None, description="Previous messages")

@router.post("/chat")
async def chat(request: ChatRequest):
    """AI chatbot endpoint - context-aware Q&A"""
    result = await ai_service.chat(
        message=request.message,
        context=request.context,
        screen_content=request.screen_content,
        conversation_history=request.conversation_history
    )
    return result

@router.get("/status")
async def status():
    """Check AI service status"""
    return {
        "status": "operational",
        "model": "gemini-2.5-flash",
        "features": ["chat", "code-evaluation", "anti-cheat"]
    }
