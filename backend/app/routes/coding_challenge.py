"""
Coding Challenge Routes
Handles code submission, execution, and evaluation
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from app.services.ai.coding_evaluation_service import coding_evaluation_service
from app.services.firebase_admin import get_firestore_client
import logging

# IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

router = APIRouter(prefix="/api/coding-challenge", tags=["coding-challenge"])
logger = logging.getLogger(__name__)

# Request models
class RunCodeRequest(BaseModel):
    code: str
    language: str
    problem_id: str

class SubmitCodeRequest(BaseModel):
    user_id: str
    course_id: str
    code: str
    language: str
    problem_id: str
    anti_cheat_data: Optional[Dict[str, Any]] = None

# Response models
class RunCodeResponse(BaseModel):
    success: bool
    output: Optional[str] = None
    execution_time: Optional[float] = None
    error: Optional[str] = None

class SubmitCodeResponse(BaseModel):
    success: bool
    score: float
    tests_passed: str
    test_results: List[Dict]
    time_complexity_analysis: Dict
    anti_cheat_penalty: float
    feedback: str


@router.post("/run", response_model=RunCodeResponse)
async def run_code(request: RunCodeRequest):
    """
    Run code with first test case only (for testing/debugging)
    """
    try:
        result = coding_evaluation_service.run_code_only(
            code=request.code,
            language=request.language,
            problem_id=request.problem_id
        )
        
        return RunCodeResponse(**result)
    
    except Exception as e:
        logger.error(f"Error running code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit", response_model=SubmitCodeResponse)
async def submit_code(request: SubmitCodeRequest):
    """
    Submit code for full evaluation with all test cases
    Saves results to Firebase
    """
    try:
        # Get user ID from request
        user_id = request.user_id
        # Evaluate the code
        evaluation_result = coding_evaluation_service.evaluate_submission(
            code=request.code,
            language=request.language,
            problem_id=request.problem_id,
            anti_cheat_data=request.anti_cheat_data
        )
        if not evaluation_result['success']:
            raise HTTPException(status_code=400, detail=evaluation_result.get('message', 'Evaluation failed'))
        db = get_firestore_client()
        now_ist = datetime.now(IST)
        submission_data = {
            'user_id': user_id,
            'course_id': request.course_id,
            'problem_id': request.problem_id,
            'language': request.language,
            'code': request.code,
            'score': evaluation_result['score'],
            'tests_passed': evaluation_result['tests_passed'],
            'test_results': evaluation_result['test_results'],
            'time_complexity_analysis': evaluation_result['time_complexity_analysis'],
            'anti_cheat_penalty': evaluation_result['anti_cheat_penalty'],
            'anti_cheat_data': request.anti_cheat_data or {},
            'feedback': evaluation_result['feedback'],
            'timestamp': now_ist.isoformat(),
            'submitted_at': now_ist
        }
        db.collection('coding_submissions').add(submission_data)
        progress_ref = db.collection('course_progress').document(f"{user_id}_{request.course_id}")
        progress_doc = progress_ref.get()
        current_modules = []
        if progress_doc.exists:
            progress_data = progress_doc.to_dict()
            current_modules = progress_data.get('modules_completed', [])
        if 'coding-challenge' not in current_modules:
            current_modules.append('coding-challenge')
            logger.info(f"Adding 'coding-challenge' to modules_completed for user {user_id}, course {request.course_id}")
        else:
            logger.info(f"'coding-challenge' already in modules_completed for user {user_id}, course {request.course_id}")
        progress_ref.set({
            'coding_challenge': {
                'completed': True,
                'score': evaluation_result['score'],
                'problem_id': request.problem_id,
                'language': request.language,
                'code': request.code,
                'completed_at': now_ist,
                'timestamp': now_ist.isoformat()
            },
            'modules_completed': current_modules
        }, merge=True)
        logger.info(f"✅ Code submission saved for user {user_id}, course {request.course_id}, score: {evaluation_result['score']}%, modules: {current_modules}")
        return SubmitCodeResponse(
            success=True,
            score=evaluation_result['score'],
            tests_passed=evaluation_result['tests_passed'],
            test_results=evaluation_result['test_results'],
            time_complexity_analysis=evaluation_result['time_complexity_analysis'],
            anti_cheat_penalty=evaluation_result['anti_cheat_penalty'],
            feedback=evaluation_result['feedback']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/submissions/{course_id}")
async def get_submissions(course_id: str):
    """
    Get all coding challenge submissions for a course
    """
    try:
        user_id = "user_123"  # TODO: Get from JWT token
        
        db = get_firestore_client()
        
        submissions = []
        docs = db.collection('coding_submissions')\
            .where('user_id', '==', user_id)\
            .where('course_id', '==', course_id)\
            .order_by('timestamp', direction='DESCENDING')\
            .limit(10)\
            .stream()
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            submissions.append(data)
        
        return {
            'success': True,
            'submissions': submissions
        }
    
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress/{course_id}")
async def get_coding_progress(course_id: str):
    """
    Get coding challenge progress for a specific course
    """
    try:
        user_id = "user_123"  # TODO: Get from JWT token
        
        db = get_firestore_client()
        
        # Use 'course_progress' collection (same as simple_progress_service.py)
        progress_doc = db.collection('course_progress').document(f"{user_id}_{course_id}").get()
        
        if not progress_doc.exists:
            return {
                'success': True,
                'completed': False,
                'score': 0
            }
        
        progress_data = progress_doc.to_dict()
        coding_challenge = progress_data.get('coding_challenge', {})
        
        return {
            'success': True,
            'completed': coding_challenge.get('completed', False),
            'score': coding_challenge.get('score', 0),
            'problem_id': coding_challenge.get('problem_id'),
            'language': coding_challenge.get('language'),
            'code': coding_challenge.get('code'),  # Return the saved code
            'completed_at': coding_challenge.get('completed_at')
        }
    
    except Exception as e:
        logger.error(f"Error fetching coding progress: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
