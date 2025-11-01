"""
Progress routes - Course progress tracking
"""
from fastapi import APIRouter, HTTPException
from app.repositories.progress_repository import ProgressRepository
from app.domains.progress.models import ProgressSync

router = APIRouter()
progress_repo = ProgressRepository()

@router.get("/{course_id}")
async def get_course_progress(course_id: str, user_id: str):
    """Get course progress for a user"""
    try:
        progress = progress_repo.get_user_course_progress(user_id, course_id)
        
        if not progress:
            # Return default progress
            return {
                'success': True,
                'data': {
                    'user_id': user_id,
                    'course_id': course_id,
                    'modules_completed': [],
                    'completion_percentage': 0.0,
                    'quiz': {},
                    'coding': {}
                }
            }
        
        return {'success': True, 'data': progress}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/sync")
async def sync_course_progress(course_id: str, data: ProgressSync):
    """Sync course progress from frontend"""
    try:
        result = progress_repo.sync_progress(
            user_id=data.user_id,
            course_id=course_id,
            modules_completed=data.modules_completed,
            completion_percentage=data.completion_percentage
        )
        
        return {
            'success': True,
            'data': result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/certification-status")
async def get_certification_status(course_id: str, user_id: str):
    """Get certification eligibility status"""
    try:
        status = progress_repo.get_certification_eligibility(user_id, course_id)
        
        return {
            'success': True,
            'data': status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
