"""
Assessment routes - Quiz, Coding, and Anti-cheat
"""
from fastapi import APIRouter, HTTPException
from app.domains.assessment.models import (
    QuizSubmission, RunCodeRequest, SubmitCodeRequest, ViolationReport
)
from app.domains.assessment.quiz_service import QuizService
from app.domains.assessment.coding_service import CodingService
from app.domains.assessment.anti_cheat_service import AntiCheatService

router = APIRouter()
quiz_service = QuizService()
coding_service = CodingService()
anti_cheat_service = AntiCheatService()

# ========== QUIZ ENDPOINTS ==========

@router.get("/{course_id}/quiz/{quiz_id}")
async def get_quiz_questions(course_id: str, quiz_id: str):
    """Get quiz questions"""
    try:
        quiz_data = quiz_service.get_quiz_questions(course_id, quiz_id)
        
        if "error" in quiz_data:
            raise HTTPException(status_code=404, detail=quiz_data["error"])
        
        return {"success": True, "data": quiz_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/quiz/{quiz_id}/submit")
async def submit_quiz(course_id: str, quiz_id: str, submission: QuizSubmission):
    """Submit quiz answers"""
    try:
        result = quiz_service.submit_quiz(
            user_id=submission.user_id,
            course_id=course_id,
            quiz_id=quiz_id,
            answers=submission.answers,
            time_taken=submission.time_taken
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {"success": True, "data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/quiz/submit")
async def submit_quiz_simple(course_id: str, submission: QuizSubmission):
    """Submit quiz score directly (for frontend-based quizzes)"""
    try:
        from app.repositories.progress_repository import ProgressRepository
        progress_repo = ProgressRepository()
        
        # Update quiz progress in course_progress collection
        result = progress_repo.update_quiz_progress(
            user_id=submission.user_id,
            course_id=course_id,
            score=submission.score,
            passed=submission.passed
        )
        
        return {"success": True, "data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/quiz/attempts")
async def get_quiz_attempts(course_id: str, user_id: str, quiz_id: str = None):
    """Get quiz attempts for a user"""
    try:
        attempts = quiz_service.get_quiz_attempts(user_id, course_id, quiz_id)
        return {"success": True, "data": attempts}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== CODING CHALLENGE ENDPOINTS ==========

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
            anti_cheat_data=request.anti_cheat_data
        )
        
        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result.get('message', 'Evaluation failed'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/coding/submissions")
async def get_coding_submissions(course_id: str, user_id: str):
    """Get coding submissions for a user"""
    try:
        submissions = coding_service.get_submissions(user_id, course_id)
        return {"success": True, "data": submissions}
        
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
