"""
Coding service - handles code execution and evaluation
"""
from typing import Dict, Any
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.ai.coding_evaluation_service import coding_evaluation_service

class CodingService:
    """Service for coding challenge management"""
    
    def __init__(self):
        self.assessment_repo = AssessmentRepository()
        self.progress_repo = ProgressRepository()
    
    def run_code(self, code: str, language: str, problem_id: str) -> Dict[str, Any]:
        """Run code with first test case only"""
        return coding_evaluation_service.run_code_only(
            code=code,
            language=language,
            problem_id=problem_id
        )
    
    def submit_code(self, user_id: str, course_id: str, code: str,
                   language: str, problem_id: str,
                   anti_cheat_data: Dict = None) -> Dict[str, Any]:
        """Submit code for full evaluation"""
        # Evaluate code
        evaluation = coding_evaluation_service.evaluate_submission(
            code=code,
            language=language,
            problem_id=problem_id,
            anti_cheat_data=anti_cheat_data
        )
        
        if not evaluation['success']:
            return evaluation
        
        score = evaluation['score']
        passed = score >= 50  # Passing threshold
        
        # Save submission
        self.assessment_repo.create_submission(
            user_id=user_id,
            course_id=course_id,
            assessment_type='coding',
            score=score,
            code=code,
            problem_id=problem_id,
            language=language,
            metadata={
                'test_results': evaluation['test_results'],
                'time_complexity': evaluation['time_complexity_analysis']
            }
        )
        
        # Update progress
        self.progress_repo.update_coding_progress(
            user_id=user_id,
            course_id=course_id,
            score=score,
            problem_id=problem_id,
            language=language,
            code=code,
            passed=passed
        )
        
        return evaluation
    
    def get_submissions(self, user_id: str, course_id: str) -> list:
        """Get coding submissions for a user"""
        return self.assessment_repo.get_user_submissions(
            user_id=user_id,
            course_id=course_id,
            assessment_type='coding',
            limit=10
        )
