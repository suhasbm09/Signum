"""Progress domain models"""
from pydantic import BaseModel
from typing import List, Optional

class ProgressSync(BaseModel):
    user_id: str
    course_id: str
    modules_completed: List[str]
    completion_percentage: float
