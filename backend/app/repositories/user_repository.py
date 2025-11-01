"""
User repository
"""
from typing import Dict, Any, Optional
from app.repositories.base import BaseRepository
from firebase_admin import firestore

class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__('users')
    
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        return self.get(email)
    
    def create_or_update_user(self, email: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update user"""
        existing = self.get(email)
        if existing:
            # Update only specific fields
            update_data = {
                'lastLoginAt': firestore.SERVER_TIMESTAMP,
                'photoURL': user_data.get('photoURL', '')
            }
            if 'displayName' in user_data and user_data['displayName']:
                update_data['displayName'] = user_data['displayName']
            
            return self.update(email, update_data)
        else:
            user_data['createdAt'] = firestore.SERVER_TIMESTAMP
            user_data['lastLoginAt'] = firestore.SERVER_TIMESTAMP
            return self.create(email, user_data)
    
    def update_profile(self, email: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        return self.update(email, profile_data)
    
    def update_wallet(self, email: str, wallet_address: str) -> Dict[str, Any]:
        """Update phantom wallet address"""
        return self.update(email, {
            'phantomWalletAddress': wallet_address
        })
    
    def enroll_course(self, email: str, course_id: str) -> Dict[str, Any]:
        """Enroll user in a course"""
        user = self.get(email)
        courses = user.get('coursesEnrolled', []) if user else []
        if course_id not in courses:
            courses.append(course_id)
        
        return self.update(email, {
            'coursesEnrolled': courses
        })
    
    def soft_delete(self, email: str) -> Dict[str, Any]:
        """Soft delete user account"""
        return self.update(email, {
            'isDeleted': True,
            'deletedAt': firestore.SERVER_TIMESTAMP
        })
