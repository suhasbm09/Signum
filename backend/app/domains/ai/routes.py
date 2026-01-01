"""
AI routes - AI Assistant and Chat
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.services.ai.ai_service import ai_service
from app.core.database import get_db
from datetime import datetime, timezone

router = APIRouter()

# Daily AI request limit (250 total, keep 25 as buffer)
DAILY_AI_LIMIT = 225

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's message")
    context: Optional[str] = Field(default="General Learning", description="Current page/topic")
    screen_content: Optional[str] = Field(default="", description="Content visible on screen")
    conversation_history: Optional[List[Dict]] = Field(default=None, description="Previous messages")

async def check_and_increment_ai_usage() -> bool:
    """
    Check if AI daily limit is reached and increment counter.
    Returns True if request can proceed, False if limit reached.
    """
    try:
        db = get_db()
        usage_ref = db.collection('ai_usage').document('daily_count')
        usage_doc = usage_ref.get()
        
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        if usage_doc.exists:
            data = usage_doc.to_dict()
            last_date = data.get('date', '')
            count = data.get('count', 0)
            
            # Reset counter if it's a new day
            if last_date != today:
                usage_ref.set({
                    'date': today,
                    'count': 1,
                    'last_updated': datetime.now(timezone.utc)
                })
                return True
            
            # Check if limit reached
            if count >= DAILY_AI_LIMIT:
                return False
            
            # Increment counter
            usage_ref.update({
                'count': count + 1,
                'last_updated': datetime.now(timezone.utc)
            })
            return True
        else:
            # First request today
            usage_ref.set({
                'date': today,
                'count': 1,
                'last_updated': datetime.now(timezone.utc)
            })
            return True
            
    except Exception as e:
        # On error, allow request (fail open)
        return True

@router.post("/chat")
async def chat(request: ChatRequest):
    """AI chatbot endpoint - context-aware Q&A with rate limiting"""

    # Scope guard first: if out-of-scope, return a fixed response without consuming quota/usage.
    if not ai_service.is_in_scope(
        message=request.message,
        context=request.context or "",
        screen_content=request.screen_content or "",
    ):
        return ai_service.out_of_scope_response()
    
    # Check daily limit
    can_proceed = await check_and_increment_ai_usage()
    if not can_proceed:
        return {
            "success": False,
            "error": "daily_limit_reached",
            "response": "AI tutor is temporarily unavailable due to high demand. Please try again tomorrow or use the interactive visualizations and coding environments to continue learning!",
            "message": "Daily AI limit reached. Try again tomorrow!"
        }
    
    # Process AI request
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
