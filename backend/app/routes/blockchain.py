from fastapi import APIRouter, HTTPException
from app.services.simple_progress_service import UserProgressService
from app.services.metadata_service import MetadataService
from pydantic import BaseModel
from typing import Dict, Any
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class MintRequest(BaseModel):
    user_id: str
    course_id: str
    wallet_address: str
    user_name: str = "Student"

@router.post("/mint")
async def mint_certificate(data: MintRequest):
    """
    Generate metadata for NFT certificate
    Frontend will handle actual minting
    
    Steps:
    1. Verify user eligibility (quiz >= 85, completion >= 90)
    2. Generate metadata with certificate template
    3. Return metadata URI for frontend to mint
    """
    try:
        # Step 1: Verify eligibility
        progress_service = UserProgressService()
        cert_status = await progress_service.get_certification_status(
            user_id=data.user_id,
            course_id=data.course_id
        )
        
        if not cert_status.get('eligible'):
            raise HTTPException(
                status_code=400,
                detail={
                    'error': 'Not eligible for certificate',
                    'quiz_score': cert_status.get('quiz_score'),
                    'completion': cert_status.get('course_completion'),
                    'quiz_passed': cert_status.get('quiz_passed'),
                    'course_completed': cert_status.get('course_completed')
                }
            )
        
        # Step 2: Generate metadata
        metadata_service = MetadataService()
        quiz_score = int(cert_status.get('quiz_score', 0))
        completion = int(cert_status.get('course_completion', 0))
        final_score = int((quiz_score * 70 + completion * 30) / 100)
        
        metadata_result = metadata_service.generate_metadata(
            course_id=data.course_id,
            user_id=data.user_id,
            quiz_score=quiz_score,
            completion_percentage=completion,
            final_score=final_score,
            wallet_address=data.wallet_address,
            user_name=data.user_name
        )
        
        # Return metadata for frontend minting
        return {
            "success": True,
            "data": {
                "eligible": True,
                "quiz_score": quiz_score,
                "completion_percentage": completion,
                "final_score": final_score,
                "metadata": metadata_result['metadata'],
                "metadata_uri": metadata_result['uri'],
                "image_uri": metadata_result.get('image_uri', metadata_result['metadata']['image'])
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
