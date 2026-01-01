"""
Assessment routes - Quiz, Coding, and Anti-cheat
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.domains.assessment.models import (
    QuizSubmission, QuizStartRequest, QuizSubmitRequest, QuizSessionStatusRequest,
    RunCodeRequest, SubmitCodeRequest, ViolationReport
)
from app.domains.assessment.quiz_service import QuizService
from app.domains.assessment.coding_service import CodingService
from app.domains.assessment.anti_cheat_service import AntiCheatService

router = APIRouter()
quiz_service = QuizService()
coding_service = CodingService()
anti_cheat_service = AntiCheatService()

def serialize_for_json(obj):
    """Convert Firestore objects to JSON-serializable format"""
    if isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif hasattr(obj, 'isoformat'):  # Handle Firestore timestamps
        return obj.isoformat()
    elif hasattr(obj, '_seconds'):  # Firestore Timestamp object
        return datetime.fromtimestamp(obj._seconds).isoformat()
    return obj

# ========== QUIZ ENDPOINTS (NEW - Server-side scoring) ==========

@router.post("/{course_id}/quiz/start")
async def start_quiz(course_id: str, request: QuizStartRequest):
    """
    Start a new quiz session - returns questions WITHOUT answers
    Frontend must use the returned session_id for submission
    """
    try:
        result = quiz_service.start_quiz_session(
            user_id=request.user_id,
            course_id=course_id,
            num_questions=request.num_questions
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Failed to start quiz"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/quiz/submit")
async def submit_quiz_new(course_id: str, request: QuizSubmitRequest):
    """
    Submit quiz for SERVER-SIDE scoring
    Answers are validated against server-stored correct answers
    """
    try:
        result = quiz_service.submit_quiz(
            user_id=request.user_id,
            session_id=request.session_id,
            answers=request.answers,
            anti_cheat_data=request.anti_cheat_data
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to submit quiz"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/quiz/session/{session_id}/status")
async def get_quiz_session_status(course_id: str, session_id: str):
    """Check if a quiz session is still valid and get time remaining"""
    try:
        result = quiz_service.get_session_status(session_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# IMPORTANT: This route must come BEFORE /{quiz_id} to avoid "attempts" being captured as quiz_id
@router.get("/{course_id}/quiz/attempts")
async def get_quiz_attempts(course_id: str, user_id: str):
    """Get quiz attempts for a user"""
    try:
        attempts = quiz_service.get_quiz_attempts(user_id, course_id)
        
        # Serialize timestamps for JSON response
        serialized_attempts = serialize_for_json(attempts)
        return {"success": True, "data": serialized_attempts}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========== QUIZ ENDPOINTS (LEGACY - for backwards compatibility) ==========

@router.get("/{course_id}/quiz/{quiz_id}")
async def get_quiz_questions(course_id: str, quiz_id: str):
    """Get quiz questions (LEGACY - use /quiz/start instead)"""
    try:
        # For backwards compatibility, start a session and return questions
        # This won't have proper session tracking
        result = quiz_service.start_quiz_session(
            user_id="legacy_user",
            course_id=course_id,
            num_questions=10
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Quiz not found"))
        
        return {"success": True, "data": {"questions": result["questions"]}}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/quiz/{quiz_id}/submit")
async def submit_quiz_legacy(course_id: str, quiz_id: str, submission: QuizSubmission):
    """Submit quiz (LEGACY - uses frontend-calculated score)"""
    try:
        from app.repositories.assessment_repository import AssessmentRepository
        from app.repositories.progress_repository import ProgressRepository
        
        assessment_repo = AssessmentRepository()
        progress_repo = ProgressRepository()
        
        # Validate
        if submission.score is None:
            raise HTTPException(status_code=400, detail="Score is required")
        
        # Save to assessment_submissions (with both score and answers)
        assessment_repo.create_submission(
            user_id=submission.user_id,
            course_id=course_id,
            assessment_type='quiz',
            score=submission.score,
            answers=submission.answers if submission.answers else []
        )
        
        # Update course_progress
        progress_repo.update_quiz_progress(
            user_id=submission.user_id,
            course_id=course_id,
            score=submission.score,
            passed=submission.passed
        )
        
        return {
            "success": True,
            "data": {
                "score": submission.score,
                "passed": submission.passed
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== CODING CHALLENGE ENDPOINTS ==========

@router.post("/{course_id}/coding/start")
async def start_coding_session(course_id: str, user_id: str, problem_id: str = "factorial"):
    """
    Start a new coding session - returns session info with timer
    """
    try:
        result = coding_service.start_coding_session(
            user_id=user_id,
            course_id=course_id,
            problem_id=problem_id
        )
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/coding/session/{session_id}/status")
async def get_coding_session_status(course_id: str, session_id: str):
    """Check if a coding session is still valid and get time remaining"""
    try:
        result = coding_service.get_session_status(session_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/coding/run")
async def run_code(course_id: str, request: RunCodeRequest):
    """Run code with first test case only (for testing)"""
    try:
        result = coding_service.run_code(
            code=request.code,
            language=request.language,
            problem_id=request.problem_id
        )
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/coding/submit")
async def submit_code(course_id: str, request: SubmitCodeRequest):
    """Submit code for full evaluation"""
    try:
        result = coding_service.submit_code(
            user_id=request.user_id,
            course_id=course_id,
            code=request.code,
            language=request.language,
            problem_id=request.problem_id,
            anti_cheat_data=request.anti_cheat_data,
            session_id=request.session_id
        )
        
        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result.get('message', 'Evaluation failed'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# IMPORTANT: This route must come BEFORE /{problem_id} to avoid conflicts
@router.get("/{course_id}/coding/attempts")
async def get_coding_attempts(course_id: str, user_id: str):
    """Get coding attempts for a user (with AI reports)"""
    try:
        attempts = coding_service.get_submissions(user_id, course_id)
        
        # Serialize timestamps
        serialized_attempts = serialize_for_json(attempts)
        return {"success": True, "data": serialized_attempts}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/coding/submissions")
async def get_coding_submissions(course_id: str, user_id: str):
    """Get coding submissions for a user"""
    try:
        submissions = coding_service.get_submissions(user_id, course_id)
        serialized_submissions = serialize_for_json(submissions)
        return {"success": True, "data": serialized_submissions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== ANTI-CHEAT ENDPOINTS ==========

@router.post("/{course_id}/anti-cheat/report")
async def report_violation(course_id: str, report: ViolationReport):
    """Report an anti-cheat violation"""
    try:
        result = anti_cheat_service.report_violation(
            user_id=report.user_id,
            course_id=course_id,
            assessment_type=report.assessment_type,
            violation_type=report.violation_type,
            timestamp=report.timestamp
        )
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/anti-cheat/status")
async def get_anti_cheat_status(course_id: str, user_id: str, assessment_type: str):
    """Get anti-cheat status (violations and block status)"""
    try:
        status = anti_cheat_service.get_status(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type
        )
        return {"success": True, "data": status}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/anti-cheat/clear")
async def clear_violations(course_id: str, user_id: str, assessment_type: str):
    """Clear violations and block after cooldown"""
    try:
        result = anti_cheat_service.clear_violations(
            user_id=user_id,
            course_id=course_id,
            assessment_type=assessment_type
        )
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
