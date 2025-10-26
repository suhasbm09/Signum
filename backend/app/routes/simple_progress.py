from fastapi import APIRouter, HTTPException
from app.services.simple_progress_service import UserProgressService
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Simple request models
class CourseProgressSync(BaseModel):
    user_id: str
    course_id: str
    modules_completed: List[str]
    completion_percentage: float
    quiz_score: float = None

class QuizResult(BaseModel):
    user_id: str
    course_id: str
    score: float
    answers: List[Dict[str, Any]]
    violations: List[Dict[str, Any]] = []

class Violation(BaseModel):
    user_id: str
    course_id: str
    violation_type: str
    timestamp: str

class QuizBlock(BaseModel):
    user_id: str
    course_id: str
    block_duration_minutes: int
    violation_count: int

class WalletData(BaseModel):
    user_id: str
    wallet_address: str
    wallet_type: str = 'phantom'

class NFTCertificate(BaseModel):
    user_id: str
    course_id: str
    certificate_image_url: str
    transaction_signature: str
    mint_address: str
    minted_at: str

@router.post("/course/sync")
async def sync_course_progress(data: CourseProgressSync):
    """Sync course progress from frontend"""
    try:
        service = UserProgressService()
        result = await service.sync_course_progress(
            user_id=data.user_id,
            course_id=data.course_id,
            modules_completed=data.modules_completed,
            completion_percentage=data.completion_percentage,
            quiz_score=data.quiz_score
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error syncing progress: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/course/progress/{course_id}")
async def get_course_progress(course_id: str, user_id: str):
    """Get course progress for a user"""
    try:
        service = UserProgressService()
        progress = await service.get_course_progress(user_id=user_id, course_id=course_id)
        return {"success": True, "data": progress}
    except Exception as e:
        logger.error(f"Error fetching progress: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz/result")
async def save_quiz_result(data: QuizResult):
    """Save quiz result with answers and violations"""
    try:
        service = UserProgressService()
        result = await service.save_quiz_result(
            user_id=data.user_id,
            course_id=data.course_id,
            score=data.score,
            answers=data.answers,
            violations=data.violations
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error saving quiz result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quiz/results/{course_id}")
async def get_quiz_results(course_id: str, user_id: str):
    """Get all quiz results for a user in a course"""
    try:
        service = UserProgressService()
        results = await service.get_quiz_results(user_id=user_id, course_id=course_id)
        return {"success": True, "data": results}
    except Exception as e:
        logger.error(f"Error fetching quiz results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/certification/status/{course_id}")
async def get_certification_status(course_id: str, user_id: str):
    """Get certification status for a user"""
    try:
        service = UserProgressService()
        status = await service.get_certification_status(user_id=user_id, course_id=course_id)
        return {"success": True, "data": status}
    except Exception as e:
        logger.error(f"Error fetching certification status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz/violation")
async def save_violation(data: Violation):
    """Save anti-cheat violation"""
    try:
        service = UserProgressService()
        result = await service.save_violation(
            user_id=data.user_id,
            course_id=data.course_id,
            violation_type=data.violation_type,
            timestamp=data.timestamp
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error saving violation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quiz/violations/{course_id}")
async def get_violations(course_id: str, user_id: str):
    """Get all violations for a user in a course"""
    try:
        service = UserProgressService()
        violations = await service.get_violations(user_id=user_id, course_id=course_id)
        return {"success": True, "data": violations}
    except Exception as e:
        logger.error(f"Error fetching violations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz/block")
async def block_quiz_access(data: QuizBlock):
    """Block quiz access for a user"""
    try:
        service = UserProgressService()
        result = await service.block_quiz_access(
            user_id=data.user_id,
            course_id=data.course_id,
            block_duration_minutes=data.block_duration_minutes,
            violation_count=data.violation_count
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error blocking quiz access: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quiz/block-status/{course_id}")
async def get_quiz_block_status(course_id: str, user_id: str):
    """Get quiz block status for a user"""
    try:
        service = UserProgressService()
        status = await service.get_quiz_block_status(user_id=user_id, course_id=course_id)
        return {"success": True, "data": status}
    except Exception as e:
        logger.error(f"Error fetching block status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/wallet/save")
async def save_user_wallet(data: WalletData):
    """Save user's Solana wallet address"""
    try:
        service = UserProgressService()
        result = await service.save_user_wallet(
            user_id=data.user_id,
            wallet_address=data.wallet_address,
            wallet_type=data.wallet_type
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error saving wallet: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wallet/{user_id}")
async def get_user_wallet(user_id: str):
    """Get user's saved wallet address"""
    try:
        service = UserProgressService()
        wallet = await service.get_user_wallet(user_id=user_id)
        return {"success": True, "data": wallet}
    except Exception as e:
        logger.error(f"Error fetching wallet: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nft-certificate")
async def save_nft_certificate(data: NFTCertificate):
    """Save NFT certificate minting status"""
    try:
        service = UserProgressService()
        result = await service.save_nft_certificate(
            user_id=data.user_id,
            course_id=data.course_id,
            certificate_image_url=data.certificate_image_url,
            transaction_signature=data.transaction_signature,
            mint_address=data.mint_address,
            minted_at=data.minted_at
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error saving NFT certificate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nft-certificate/{user_id}/{course_id}")
async def get_nft_certificate(user_id: str, course_id: str):
    """Get NFT certificate minting status"""
    try:
        service = UserProgressService()
        cert = await service.get_nft_certificate(user_id=user_id, course_id=course_id)
        if cert:
            return {"success": True, "minted": True, **cert}
        else:
            return {"success": True, "minted": False}
    except Exception as e:
        logger.error(f"Error fetching NFT certificate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/nft-certificate/{user_id}/{course_id}")
async def delete_nft_certificate(user_id: str, course_id: str):
    """Delete NFT certificate status (for testing mode)"""
    try:
        service = UserProgressService()
        result = await service.delete_nft_certificate(user_id=user_id, course_id=course_id)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error deleting NFT certificate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))