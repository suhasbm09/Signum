"""
Coding service - handles code execution and evaluation with session tracking
"""
from typing import Dict, Any
from datetime import datetime, timezone, timedelta
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.ai.coding_evaluation_service import coding_evaluation_service
from app.services.ai.code_analysis_service import code_analysis_service
import uuid

class CodingService:
    """Service for coding challenge management with server-side timer"""
    
    def __init__(self):
        self.assessment_repo = AssessmentRepository()
        self.progress_repo = ProgressRepository()
        
        # Active coding sessions (in production, use Redis or database)
        self.active_sessions = {}
        
        # Coding challenge time limit (30 minutes)
        self.CODING_TIME_LIMIT = 1800  # 30 minutes in seconds
    
    def start_coding_session(self, user_id: str, course_id: str, problem_id: str) -> Dict[str, Any]:
        """
        Start a new coding session - returns problem details and session info
        """
        # Create session
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=self.CODING_TIME_LIMIT)
        
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "course_id": course_id,
            "problem_id": problem_id,
            "start_time": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "time_limit": self.CODING_TIME_LIMIT
        }
        
        return {
            "success": True,
            "session_id": session_id,
            "problem_id": problem_id,
            "time_limit": self.CODING_TIME_LIMIT,
            "start_time": now.isoformat(),
            "expires_at": expires_at.isoformat()
        }
    
    def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Check if a session is still valid and get time remaining"""
        if session_id not in self.active_sessions:
            return {"valid": False, "error": "Session not found or expired"}
        
        session = self.active_sessions[session_id]
        now = datetime.now(timezone.utc)
        expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
        
        if now > expires_at:
            del self.active_sessions[session_id]
            return {"valid": False, "error": "Session expired"}
        
        time_remaining = (expires_at - now).total_seconds()
        
        return {
            "valid": True,
            "time_remaining": int(time_remaining),
            "start_time": session["start_time"],
            "expires_at": session["expires_at"]
        }
    
    def run_code(self, code: str, language: str, problem_id: str) -> Dict[str, Any]:
        """Run code with first test case only"""
        return coding_evaluation_service.run_code_only(
            code=code,
            language=language,
            problem_id=problem_id
        )
    
    def submit_code(self, user_id: str, course_id: str, code: str,
                   language: str, problem_id: str,
                   anti_cheat_data: Dict = None,
                   session_id: str = None) -> Dict[str, Any]:
        """Submit code for full evaluation with AI analysis"""
        
        # If session_id provided, validate it
        time_taken = None
        if session_id and session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            
            # Validate user
            if session["user_id"] != user_id:
                return {"success": False, "error": "Session does not belong to this user"}
            
            # Check if expired (allow 30 second grace period)
            now = datetime.now(timezone.utc)
            expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
            grace_period = timedelta(seconds=30)
            
            if now > expires_at + grace_period:
                del self.active_sessions[session_id]
                return {"success": False, "error": "Coding session expired"}
            
            # Calculate time taken
            start_time = datetime.fromisoformat(session["start_time"].replace('Z', '+00:00'))
            time_taken = int((now - start_time).total_seconds())
            
            # Clean up session
            del self.active_sessions[session_id]
        
        # Evaluate code (run test cases)
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
        
        # Get problem title for AI analysis
        problem = coding_evaluation_service.PROBLEMS.get(problem_id, {})
        problem_title = problem.get('title', problem_id)
        
        # Generate AI Analysis Report
        ai_analysis = code_analysis_service.analyze_code(
            code=code,
            language=language,
            problem_id=problem_id,
            problem_title=problem_title,
            test_results=evaluation['test_results'],
            score=score
        )
        
        ai_report = ai_analysis.get('report') if ai_analysis.get('success') else ai_analysis.get('report', {})
        
        # Save submission with AI report
        submission = self.assessment_repo.create_submission(
            user_id=user_id,
            course_id=course_id,
            assessment_type='coding',
            score=score,
            code=code,
            problem_id=problem_id,
            language=language,
            metadata={
                'test_results': evaluation['test_results'],
                'time_complexity': evaluation['time_complexity_analysis'],
                'time_taken': time_taken,
                'ai_report': ai_report
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
        
        # Add time_taken and AI report to evaluation result
        evaluation['time_taken'] = time_taken
        evaluation['ai_report'] = ai_report
        evaluation['submission_id'] = submission['id']
        
        return evaluation
    
    def get_submissions(self, user_id: str, course_id: str) -> list:
        """Get coding submissions for a user"""
        return self.assessment_repo.get_user_submissions(
            user_id=user_id,
            course_id=course_id,
            assessment_type='coding',
            limit=10
        )
