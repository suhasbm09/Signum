"""Certification domain models"""
from pydantic import BaseModel

class MintRequest(BaseModel):
    user_id: str
    wallet_address: str
    user_name: str = "Student"
    mint_address: str = None  # Optional: NFT mint address for QR code

class NFTCertificate(BaseModel):
    user_id: str
    course_id: str
    certificate_image_url: str
    transaction_signature: str
    mint_address: str
    minted_at: str
