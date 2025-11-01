"""
Shared Pydantic models across domains
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Common response models
class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None

# User models
class UserProfile(BaseModel):
    bio: str = ""
    interests: List[str] = []
    preferredLanguage: str = "en"
    timezone: str = "UTC"

# Assessment models
class AssessmentType(str):
    QUIZ = "quiz"
    CODING = "coding"

class ViolationType(str):
    TAB_SWITCH = "tab_switch"
    COPY_PASTE = "copy_paste"
    RIGHT_CLICK = "right_click"
    EXTERNAL_RESOURCE = "external_resource"
    SUSPICIOUS_PATTERN = "suspicious_pattern"

class EventType(str):
    VIOLATION = "violation"
    BLOCK = "block"
