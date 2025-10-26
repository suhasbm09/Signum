from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class QuizAttemptStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class CertificationStatus(str, Enum):
    NOT_ELIGIBLE = "not_eligible"
    ELIGIBLE = "eligible"
    MINTED = "minted"

class QuizAnswer(BaseModel):
    question_id: str
    selected_answer: str
    is_correct: bool
    time_spent: Optional[int] = None  # in seconds

class QuizAttempt(BaseModel):
    attempt_id: str
    course_id: str
    quiz_id: str
    user_id: str
    answers: List[QuizAnswer]
    score: float
    total_questions: int
    correct_answers: int
    status: QuizAttemptStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    time_taken: Optional[int] = None  # in seconds

class CourseProgress(BaseModel):
    user_id: str
    course_id: str
    modules_completed: List[str] = []
    total_modules: int
    completion_percentage: float = 0.0
    last_accessed_module: Optional[str] = None
    started_at: datetime
    last_updated: datetime

class UserCertification(BaseModel):
    user_id: str
    course_id: str
    quiz_score: Optional[float] = None
    course_completion: float = 0.0
    quiz_passed: bool = False
    course_completed: bool = False
    status: CertificationStatus = CertificationStatus.NOT_ELIGIBLE
    nft_token_id: Optional[str] = None
    nft_transaction_hash: Optional[str] = None
    minted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class QuizSubmission(BaseModel):
    course_id: str
    quiz_id: str
    answers: List[Dict[str, Any]]

class ModuleCompletion(BaseModel):
    course_id: str
    module_id: str