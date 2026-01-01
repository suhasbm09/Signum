"""
Certification routes - NFT certificate minting
"""
from fastapi import APIRouter, HTTPException
from app.domains.certification.models import MintRequest, NFTCertificate
from app.repositories.certification_repository import CertificationRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.metadata_service import MetadataService

router = APIRouter()
cert_repo = CertificationRepository()
progress_repo = ProgressRepository()
metadata_service = MetadataService()

@router.post("/{course_id}/mint")
async def mint_certificate(course_id: str, data: MintRequest):
    """Generate metadata for NFT certificate (frontend handles minting)"""
    try:
        # Check eligibility
        eligibility = progress_repo.get_certification_eligibility(
            user_id=data.user_id,
            course_id=course_id
        )
        
        if not eligibility.get('eligible'):
            raise HTTPException(
                status_code=400,
                detail={
                    'error': 'Not eligible for certificate',
                    **eligibility
                }
            )
        
        # Generate metadata
        quiz_score = int(eligibility.get('quiz_score', 0))
        learning_progress = int(eligibility.get('learning_progress', 0))
        final_score = int((quiz_score * 70 + learning_progress * 30) / 100)
        
        metadata_result = metadata_service.generate_metadata(
            course_id=course_id,
            user_id=data.user_id,
            quiz_score=quiz_score,
            completion_percentage=learning_progress,
            final_score=final_score,
            wallet_address=data.wallet_address,
            user_name=data.user_name,
            mint_address=data.mint_address  # Pass mint address for QR code
        )
        
        image_url = metadata_result.get('image_uri') or metadata_result['metadata'].get('image', '')
        
        return {
            "success": True,
            "data": {
                "eligible": True,
                "quiz_score": quiz_score,
                "completion_percentage": learning_progress,
                "final_score": final_score,
                "metadata": metadata_result['metadata'],
                "metadata_uri": metadata_result['uri'],
                "image_uri": image_url
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{course_id}/save")
async def save_certificate(course_id: str, data: NFTCertificate):
    """Save NFT certificate minting status"""
    try:
        result = cert_repo.save_certificate(
            user_id=data.user_id,
            course_id=course_id,
            certificate_image_url=data.certificate_image_url,
            transaction_signature=data.transaction_signature,
            mint_address=data.mint_address,
            minted_at=data.minted_at
        )
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}/status")
async def get_certificate_status(course_id: str, user_id: str):
    """Get certificate status"""
    try:
        cert = cert_repo.get_certificate(user_id, course_id)
        
        if cert:
            return {"success": True, "minted": True, **cert}
        else:
            return {"success": True, "minted": False}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{course_id}/delete")
async def delete_certificate(course_id: str, user_id: str):
    """Delete certificate (for testing)"""
    try:
        result = cert_repo.delete_certificate(user_id, course_id)
        return {"success": True, "deleted": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
