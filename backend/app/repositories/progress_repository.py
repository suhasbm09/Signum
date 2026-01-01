"""
Course progress repository
"""
from typing import Dict, Any, List, Optional
from app.repositories.base import BaseRepository
from datetime import datetime

class ProgressRepository(BaseRepository):
    def __init__(self):
        super().__init__('course_progress')
    
    def get_user_course_progress(self, user_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """Get progress for a specific user and course"""
        doc_id = f"{user_id}_{course_id}"
        return self.get(doc_id)
    
    def sync_progress(self, user_id: str, course_id: str, 
                     modules_completed: List[str], 
                     completion_percentage: float) -> Dict[str, Any]:
        """Sync course progress - MERGE to preserve quiz/coding data"""
        doc_id = f"{user_id}_{course_id}"
        data = {
            'user_id': user_id,
            'course_id': course_id,
            'modules_completed': modules_completed,
            'completion_percentage': completion_percentage,
            'last_updated': datetime.now()
        }
        # Use merge=True to preserve quiz and coding data!
        return self.set(doc_id, data, merge=True)
    
    def update_quiz_progress(self, user_id: str, course_id: str, 
                            score: float, passed: bool) -> Dict[str, Any]:
        """Update quiz progress in course_progress"""
        doc_id = f"{user_id}_{course_id}"
        progress = self.get(doc_id) or {}
        
        quiz_data = progress.get('quiz', {})
        current_best = quiz_data.get('best_score', 0)
        
        # Update quiz data
        quiz_update = {
            'quiz': {
                'best_score': max(current_best, score),
                'last_score': score,
                'attempts': quiz_data.get('attempts', 0) + 1,
                'last_attempt': datetime.now(),
                'passed': passed or quiz_data.get('passed', False)
            }
        }
        
        return self.set(doc_id, quiz_update, merge=True)
    
    def update_coding_progress(self, user_id: str, course_id: str,
                               score: float, problem_id: str, 
                               language: str, code: str, 
                               passed: bool) -> Dict[str, Any]:
        """Update coding challenge progress"""
        doc_id = f"{user_id}_{course_id}"
        progress = self.get(doc_id) or {}
        
        coding_data = progress.get('coding', {})
        current_best = coding_data.get('best_score', 0)
        
        coding_update = {
            'coding': {
                'completed': passed or coding_data.get('completed', False),
                'best_score': max(current_best, score),
                'last_score': score,
                'problem_id': problem_id,
                'language': language,
                'code': code,
                'last_submission': datetime.now()
            }
        }
        
        # IMPORTANT: Also add to modules_completed if passed
        if passed:
            modules_completed = progress.get('modules_completed', [])
            if 'coding-challenge' not in modules_completed:
                modules_completed.append('coding-challenge')
                coding_update['modules_completed'] = modules_completed
        
        return self.set(doc_id, coding_update, merge=True)
    
    def get_certification_eligibility(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Calculate certification eligibility"""
        progress = self.get_user_course_progress(user_id, course_id)
        
        if not progress:
            return {
                'eligible': False,
                'learning_progress': 0,
                'quiz_score': 0,
                'coding_completed': False,
                'overall_completion': 0
            }
        
        learning_progress = progress.get('completion_percentage', 0)
        quiz_data = progress.get('quiz', {})
        coding_data = progress.get('coding', {})
        
        quiz_score = quiz_data.get('best_score', 0)
        quiz_passed = quiz_data.get('passed', False)
        coding_completed = coding_data.get('completed', False)
        coding_score = coding_data.get('best_score', 0)
        
        # Calculate final exam score (quiz 50% + coding 50%)
        final_exam_score = 0
        if quiz_passed:
            final_exam_score += 50
        if coding_completed:
            final_exam_score += 50
        
        # Overall: 70% learning + 30% final exam
        overall_completion = (learning_progress * 0.7) + (final_exam_score * 0.3)
        
        # Eligible if 90% or higher overall
        eligible = overall_completion >= 90 and quiz_passed and coding_completed
        
        return {
            'eligible': eligible,
            'learning_progress': learning_progress,
            'quiz_score': quiz_score,
            'quiz_passed': quiz_passed,
            'coding_score': coding_score,
            'coding_completed': coding_completed,
            'final_exam_score': final_exam_score,
            'overall_completion': round(overall_completion, 2),
            'requirements': {
                'learning_modules': f"{learning_progress}% (need 100%)",
                'quiz': f"{quiz_score}% (need 85%+)",
                'coding': 'Complete' if coding_completed else 'Not complete'
            }
        }
