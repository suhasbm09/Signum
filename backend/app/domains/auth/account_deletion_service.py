"""
Account deletion service - Complete user data cleanup
"""
from firebase_admin import auth as firebase_auth, firestore
from app.repositories.user_repository import UserRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.assessment_repository import AssessmentRepository
from datetime import datetime

class AccountDeletionService:
    """Service to handle complete account deletion with data cleanup"""
    
    def __init__(self):
        self.db = firestore.client()
        self.user_repo = UserRepository()
        self.progress_repo = ProgressRepository()
        self.assessment_repo = AssessmentRepository()
    
    async def delete_user_account(self, user_id: str, email: str) -> dict:
        """
        Complete account deletion with full data cleanup
        
        Deletes:
        1. User progress (course_progress collection)
        2. Assessment submissions (assessment_submissions collection)
        3. Anti-cheat events (anti_cheat_events collection)
        4. NFT certificates (marks as invalidated)
        5. User record (users collection)
        6. Firebase Authentication account
        """
        
        deletion_summary = {
            'user_id': user_id,
            'email': email,
            'deleted_at': datetime.now().isoformat(),
            'data_deleted': {}
        }
        
        try:
            # 1. Delete Course Progress
            progress_count = await self._delete_course_progress(user_id)
            deletion_summary['data_deleted']['course_progress'] = progress_count
            
            # 2. Delete Assessment Submissions
            submissions_count = await self._delete_assessment_submissions(user_id)
            deletion_summary['data_deleted']['assessment_submissions'] = submissions_count
            
            # 3. Delete Anti-Cheat Events
            anti_cheat_count = await self._delete_anti_cheat_events(user_id)
            deletion_summary['data_deleted']['anti_cheat_events'] = anti_cheat_count
            
            # 4. Invalidate NFT Certificates (don't delete, just mark as invalidated)
            nft_count = await self._invalidate_nft_certificates(user_id, email)
            deletion_summary['data_deleted']['nft_certificates_invalidated'] = nft_count
            
            # 5. Delete User Record from users collection
            await self._delete_user_record(email)
            deletion_summary['data_deleted']['user_record'] = True
            
            # 6. Delete Firebase Auth Account (LAST STEP)
            await self._delete_firebase_auth(user_id)
            deletion_summary['data_deleted']['firebase_auth'] = True
            
            deletion_summary['success'] = True
            deletion_summary['message'] = 'Account and all associated data deleted successfully'
            
            return deletion_summary
            
        except Exception as e:
            deletion_summary['success'] = False
            deletion_summary['error'] = str(e)
            raise Exception(f"Account deletion failed: {str(e)}")
    
    async def _delete_course_progress(self, user_id: str) -> int:
        """Delete all course progress documents for user"""
        count = 0
        try:
            # Query all progress documents for this user
            docs = self.db.collection('course_progress') \
                .where('user_id', '==', user_id) \
                .stream()
            
            for doc in docs:
                doc.reference.delete()
                count += 1
            
            print(f"✅ Deleted {count} course progress documents")
            return count
        except Exception as e:
            print(f"⚠️ Error deleting course progress: {e}")
            return count
    
    async def _delete_assessment_submissions(self, user_id: str) -> int:
        """Delete all assessment submissions for user"""
        count = 0
        try:
            # Query all submissions for this user
            docs = self.db.collection('assessment_submissions') \
                .where('user_id', '==', user_id) \
                .stream()
            
            for doc in docs:
                doc.reference.delete()
                count += 1
            
            print(f"✅ Deleted {count} assessment submissions")
            return count
        except Exception as e:
            print(f"⚠️ Error deleting assessment submissions: {e}")
            return count
    
    async def _delete_anti_cheat_events(self, user_id: str) -> int:
        """Delete all anti-cheat events and blocks for user"""
        count = 0
        try:
            # Query all anti-cheat events for this user
            docs = self.db.collection('anti_cheat_events') \
                .where('user_id', '==', user_id) \
                .stream()
            
            for doc in docs:
                doc.reference.delete()
                count += 1
            
            print(f"✅ Deleted {count} anti-cheat events")
            return count
        except Exception as e:
            print(f"⚠️ Error deleting anti-cheat events: {e}")
            return count
    
    async def _invalidate_nft_certificates(self, user_id: str, email: str) -> int:
        """Mark NFT certificates as invalidated (don't delete for blockchain audit trail)"""
        count = 0
        try:
            # Query all NFT certificates for this user (by user_id or email)
            # Check by user_id first
            docs = self.db.collection('nft_certificates') \
                .where('user_id', '==', user_id) \
                .stream()
            
            for doc in docs:
                doc.reference.update({
                    'status': 'invalidated',
                    'invalidated_at': firestore.SERVER_TIMESTAMP,
                    'invalidation_reason': 'Account deleted by user'
                })
                count += 1
            
            # Also check by email (in case UID changed)
            email_docs = self.db.collection('nft_certificates') \
                .where('email', '==', email) \
                .stream()
            
            for doc in email_docs:
                # Avoid double-counting if already processed
                doc_data = doc.to_dict()
                if doc_data.get('status') != 'invalidated':
                    doc.reference.update({
                        'status': 'invalidated',
                        'invalidated_at': firestore.SERVER_TIMESTAMP,
                        'invalidation_reason': 'Account deleted by user'
                    })
                    count += 1
            
            print(f"✅ Invalidated {count} NFT certificates")
            return count
        except Exception as e:
            print(f"⚠️ Error invalidating NFT certificates: {e}")
            return count
    
    async def _delete_user_record(self, email: str) -> bool:
        """Delete user record from users collection"""
        try:
            self.db.collection('users').document(email).delete()
            print(f"✅ Deleted user record for {email}")
            return True
        except Exception as e:
            print(f"⚠️ Error deleting user record: {e}")
            return False
    
    async def _delete_firebase_auth(self, user_id: str) -> bool:
        """Delete user from Firebase Authentication"""
        try:
            firebase_auth.delete_user(user_id)
            print(f"✅ Deleted Firebase Auth account for UID: {user_id}")
            return True
        except Exception as e:
            print(f"⚠️ Error deleting Firebase Auth: {e}")
            raise Exception(f"Failed to delete Firebase Auth account: {str(e)}")
