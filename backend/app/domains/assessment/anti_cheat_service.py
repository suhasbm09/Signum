"""
Anti-cheat service - handles violations and blocks for both quiz and coding
"""
from typing import Dict, Any, List
from app.repositories.assessment_repository import AssessmentRepository

class AntiCheatService:
    """Service for anti-cheat management"""
    
    def __init__(self):
        self.assessment_repo = AssessmentRepository()
    
    def report_violation(self, user_id: str, course_id: str,
                        assessment_type: str, violation_type: str,
                        timestamp: str = None) -> Dict[str, Any]:
        """Report an anti-cheat violation"""
        result = self.assessment_repo.record_violation(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type,
            violation_type=violation_type,
            timestamp=timestamp
        )
        
        # Check if user should be blocked
        violations = self.assessment_repo.get_violations(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type
        )
        
        violation_count = len(violations)
        
        # Progressive blocking: 3 violations = 15 min, 5 = 30 min, 7+ = 60 min
        if violation_count >= 7:
            self.create_block(user_id, course_id, assessment_type, 60, violation_count)
        elif violation_count >= 5:
            self.create_block(user_id, course_id, assessment_type, 30, violation_count)
        elif violation_count >= 3:
            self.create_block(user_id, course_id, assessment_type, 15, violation_count)
        
        return result
    
    def create_block(self, user_id: str, course_id: str,
                    assessment_type: str, block_duration_minutes: int,
                    violation_count: int) -> Dict[str, Any]:
        """Create a block for excessive violations"""
        return self.assessment_repo.create_block(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type,
            block_duration_minutes=block_duration_minutes,
            violation_count=violation_count
        )
    
    def get_status(self, user_id: str, course_id: str,
                  assessment_type: str) -> Dict[str, Any]:
        """Get anti-cheat status (violations and block status)"""
        violations = self.assessment_repo.get_violations(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type
        )
        
        block_status = self.assessment_repo.get_block_status(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type
        )
        
        return {
            'violations': violations,
            'violation_count': len(violations),
            **block_status
        }
    
    def clear_violations(self, user_id: str, course_id: str,
                        assessment_type: str) -> Dict[str, Any]:
        """Clear all violations and block after cooldown"""
        return self.assessment_repo.clear_violations_and_block(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type
        )
