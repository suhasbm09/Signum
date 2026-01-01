"""Assessment domain models"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Quiz models
class QuizStartRequest(BaseModel):
    """Request to start a new quiz session"""
    user_id: str
    num_questions: int = 10

class QuizSubmitRequest(BaseModel):
    """Request to submit quiz for server-side scoring"""
    user_id: str
    session_id: str
    answers: Dict[int, int]  # {question_id: selected_option_index (0-3)}
    anti_cheat_data: Optional[Dict[str, Any]] = None

class QuizSessionStatusRequest(BaseModel):
    """Request to check quiz session status"""
    session_id: str

# Legacy model for backwards compatibility
class QuizSubmission(BaseModel):
    user_id: str
    answers: Optional[List[Any]] = []  # Can be ['a', 'b', 'c'] or detailed answer objects
    time_taken: Optional[int] = 0
    score: Optional[float] = None  # For frontend-calculated quizzes
    passed: Optional[bool] = False  # For frontend-calculated quizzes

# Coding models
class CodingStartRequest(BaseModel):
    """Request to start a new coding session"""
    user_id: str
    problem_id: str = "factorial"

class RunCodeRequest(BaseModel):
    code: str
    language: str
    problem_id: str

class SubmitCodeRequest(BaseModel):
    user_id: str
    code: str
    language: str
    problem_id: str
    session_id: Optional[str] = None  # Optional session for timer tracking
    anti_cheat_data: Optional[Dict[str, Any]] = None

# Anti-cheat models
class ViolationReport(BaseModel):
    user_id: str
    course_id: str
    assessment_type: str  # 'quiz' or 'coding'
    violation_type: str
    timestamp: str
