"""Assessment domain models"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Quiz models
class QuizSubmission(BaseModel):
    user_id: str
    answers: List[str]  # ['a', 'b', 'c', ...]
    time_taken: int

# Coding models
class RunCodeRequest(BaseModel):
    code: str
    language: str
    problem_id: str

class SubmitCodeRequest(BaseModel):
    user_id: str
    code: str
    language: str
    problem_id: str
    anti_cheat_data: Optional[Dict[str, Any]] = None

# Anti-cheat models
class ViolationReport(BaseModel):
    user_id: str
    course_id: str
    assessment_type: str  # 'quiz' or 'coding'
    violation_type: str
    timestamp: str
