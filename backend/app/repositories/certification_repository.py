"""
Certification repository
"""
from typing import Dict, Any, Optional
from app.repositories.base import BaseRepository
from datetime import datetime

class CertificationRepository(BaseRepository):
    def __init__(self):
        super().__init__('nft_certificates')
    
    def save_certificate(self, user_id: str, course_id: str,
                        certificate_image_url: str,
                        transaction_signature: str,
                        mint_address: str,
                        minted_at: str) -> Dict[str, Any]:
        """Save NFT certificate minting status"""
        cert_id = f"{user_id}_{course_id}_nft"
        data = {
            'user_id': user_id,
            'course_id': course_id,
            'certificate_image_url': certificate_image_url,
            'transaction_signature': transaction_signature,
            'mint_address': mint_address,
            'minted_at': minted_at,
            'saved_at': datetime.now()
        }
        return self.set(cert_id, data)
    
    def get_certificate(self, user_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """Get certificate status"""
        cert_id = f"{user_id}_{course_id}_nft"
        return self.get(cert_id)
    
    def delete_certificate(self, user_id: str, course_id: str) -> bool:
        """Delete certificate (for testing)"""
        cert_id = f"{user_id}_{course_id}_nft"
        return self.delete(cert_id)
