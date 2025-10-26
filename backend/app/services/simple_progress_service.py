from firebase_admin import firestore
from app.services.firebase_admin import initialize_firebase
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class UserProgressService:
    def __init__(self):
        initialize_firebase()
        self.db = firestore.client()
    
    # Simple progress sync from frontend
    async def sync_course_progress(self, user_id: str, course_id: str, modules_completed: List[str], completion_percentage: float, quiz_score: Optional[float] = None) -> Dict[str, Any]:
        """Sync course progress from frontend"""
        try:
            progress_doc_id = f"{user_id}_{course_id}"
            progress_ref = self.db.collection('course_progress').document(progress_doc_id)
            
            progress_data = {
                'user_id': user_id,
                'course_id': course_id,
                'modules_completed': modules_completed,
                'completion_percentage': completion_percentage,
                'quiz_score': quiz_score,
                'last_updated': datetime.now()
            }
            
            progress_ref.set(progress_data)
            
            return {
                'success': True,
                'completion_percentage': completion_percentage,
                'modules_completed': len(modules_completed)
            }
            
        except Exception as e:
            raise Exception(f"Error syncing course progress: {str(e)}")
    
    async def get_course_progress(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Get course progress for a user"""
        try:
            progress_doc_id = f"{user_id}_{course_id}"
            progress_ref = self.db.collection('course_progress').document(progress_doc_id)
            progress_doc = progress_ref.get()
            
            if progress_doc.exists:
                return progress_doc.to_dict()
            else:
                # Return default progress
                return {
                    'user_id': user_id,
                    'course_id': course_id,
                    'modules_completed': [],
                    'completion_percentage': 0.0,
                    'quiz_score': None,
                    'last_updated': datetime.now()
                }
                
        except Exception as e:
            raise Exception(f"Error fetching course progress: {str(e)}")
    
    # Simplified quiz result storage
    async def save_quiz_result(self, user_id: str, course_id: str, score: float, answers: List[Dict[str, Any]], violations: List[Dict[str, Any]] = []) -> Dict[str, Any]:
        """Save quiz result with answers and violations"""
        try:
            quiz_result_id = str(uuid.uuid4())
            
            quiz_result = {
                'id': quiz_result_id,
                'user_id': user_id,
                'course_id': course_id,
                'score': score,
                'passed': score >= 85,
                'answers': answers,
                'violations': violations,  # Anti-cheat data
                'completed_at': datetime.now()
            }
            
            self.db.collection('quiz_results').document(quiz_result_id).set(quiz_result)
            
            return {
                'id': quiz_result_id,
                'score': score,
                'passed': score >= 85
            }
            
        except Exception as e:
            raise Exception(f"Error saving quiz result: {str(e)}")
    
    async def get_quiz_results(self, user_id: str, course_id: str) -> List[Dict[str, Any]]:
        """Get all quiz results for a user in a course"""
        try:
            results_ref = self.db.collection('quiz_results')
            query = results_ref.where('user_id', '==', user_id).where('course_id', '==', course_id)
            docs = query.stream()
            
            results = []
            for doc in docs:
                result_data = doc.to_dict()
                results.append(result_data)
            
            return sorted(results, key=lambda x: x['completed_at'], reverse=True)
            
        except Exception as e:
            raise Exception(f"Error fetching quiz results: {str(e)}")
    
    # Simplified certification status
    async def get_certification_status(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Get certification eligibility status - matches frontend calculation"""
        try:
            # Get course progress
            progress = await self.get_course_progress(user_id, course_id)
            
            # Get best quiz score
            quiz_results = await self.get_quiz_results(user_id, course_id)
            best_quiz_score = max([r['score'] for r in quiz_results], default=0)
            
            # Get coding challenge score
            coding_score = await self.get_coding_challenge_score(user_id, course_id)
            
            # Check if coding challenge is completed (in modules_completed array)
            coding_completed = 'coding-challenge' in progress.get('modules_completed', [])
            
            # Calculate final exam score (0-100)
            quiz_passed = best_quiz_score >= 85
            final_exam_score = 0
            if quiz_passed:
                final_exam_score += 50  # Quiz contributes 50%
            if coding_completed:
                final_exam_score += 50  # Coding contributes 50%
            
            # Overall completion: 70% learning + 30% final exam
            learning_progress = progress['completion_percentage'] or 0
            overall_completion = (learning_progress * 0.7) + (final_exam_score * 0.3)
            
            # Eligibility: Must have 100% overall (all learning + quiz passed + coding complete)
            course_completed = learning_progress == 100
            eligible = overall_completion == 100 and quiz_passed and coding_completed
            
            return {
                'user_id': user_id,
                'course_id': course_id,
                'quiz_score': best_quiz_score if quiz_results else None,
                'coding_score': coding_score,
                'coding_completed': coding_completed,
                'final_exam_score': round(final_exam_score, 2),
                'course_completion': progress['completion_percentage'],
                'overall_completion': round(overall_completion, 2),
                'quiz_passed': quiz_passed,
                'course_completed': course_completed,
                'eligible': eligible,
                'status': 'eligible' if eligible else 'not_eligible',
                'requirements': {
                    'learning_modules': f"{learning_progress}% (need 100%)",
                    'quiz': f"{best_quiz_score}% (need 85%+)",
                    'coding': 'Complete' if coding_completed else 'Not complete'
                }
            }
            
        except Exception as e:
            raise Exception(f"Error getting certification status: {str(e)}")
    
    async def get_coding_challenge_score(self, user_id: str, course_id: str) -> Optional[float]:
        """Get the best coding challenge score for a user in a course"""
        try:
            # Use 'course_progress' collection (same as other progress tracking)
            progress_ref = self.db.collection('course_progress').document(f"{user_id}_{course_id}")
            progress_doc = progress_ref.get()
            
            if progress_doc.exists:
                progress_data = progress_doc.to_dict()
                coding_challenge = progress_data.get('coding_challenge', {})
                return coding_challenge.get('score')
            
            return None
            
        except Exception as e:
            raise Exception(f"Error fetching coding challenge score: {str(e)}")
    
    async def save_violation(self, user_id: str, course_id: str, violation_type: str, timestamp: str) -> Dict[str, Any]:
        """Save anti-cheat violation"""
        try:
            violation_id = str(uuid.uuid4())
            
            violation_data = {
                'id': violation_id,
                'user_id': user_id,
                'course_id': course_id,
                'violation_type': violation_type,
                'timestamp': timestamp,
                'created_at': datetime.now()
            }
            
            self.db.collection('quiz_violations').document(violation_id).set(violation_data)
            
            return {
                'id': violation_id,
                'success': True
            }
            
        except Exception as e:
            raise Exception(f"Error saving violation: {str(e)}")
    
    async def get_violations(self, user_id: str, course_id: str) -> List[Dict[str, Any]]:
        """Get all violations for a user in a course"""
        try:
            violations_ref = self.db.collection('quiz_violations')
            query = violations_ref.where('user_id', '==', user_id).where('course_id', '==', course_id)
            docs = query.stream()
            
            violations = []
            for doc in docs:
                violation_data = doc.to_dict()
                violations.append({
                    'id': violation_data.get('id'),
                    'type': violation_data.get('violation_type'),
                    'timestamp': violation_data.get('timestamp')
                })
            
            return sorted(violations, key=lambda x: x['timestamp'])
            
        except Exception as e:
            raise Exception(f"Error fetching violations: {str(e)}")
    
    async def block_quiz_access(self, user_id: str, course_id: str, block_duration_minutes: int, violation_count: int) -> Dict[str, Any]:
        """Block quiz access for a user"""
        try:
            from datetime import timedelta
            
            block_doc_id = f"{user_id}_{course_id}_block"
            block_ref = self.db.collection('quiz_blocks').document(block_doc_id)
            
            block_end_time = datetime.now() + timedelta(minutes=block_duration_minutes)
            
            block_data = {
                'user_id': user_id,
                'course_id': course_id,
                'violation_count': violation_count,
                'block_end_time': block_end_time,
                'blocked_at': datetime.now(),
                'is_active': True
            }
            
            block_ref.set(block_data)
            
            return {
                'success': True,
                'block_end_time': block_end_time.isoformat(),
                'block_duration_minutes': block_duration_minutes
            }
            
        except Exception as e:
            raise Exception(f"Error blocking quiz access: {str(e)}")
    
    async def get_quiz_block_status(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Get quiz block status for a user"""
        try:
            block_doc_id = f"{user_id}_{course_id}_block"
            block_ref = self.db.collection('quiz_blocks').document(block_doc_id)
            block_doc = block_ref.get()
            
            if block_doc.exists:
                block_data = block_doc.to_dict()
                block_end_time = block_data.get('block_end_time')
                
                # Check if block is still active
                if block_end_time and block_end_time > datetime.now():
                    time_remaining = (block_end_time - datetime.now()).total_seconds() * 1000  # milliseconds
                    
                    return {
                        'is_blocked': True,
                        'block_end_time': block_end_time.isoformat(),
                        'time_remaining_ms': int(time_remaining),
                        'violation_count': block_data.get('violation_count', 0)
                    }
                else:
                    # Block expired, update status
                    block_ref.update({'is_active': False})
                    
                    return {
                        'is_blocked': False,
                        'block_end_time': None,
                        'time_remaining_ms': 0
                    }
            else:
                return {
                    'is_blocked': False,
                    'block_end_time': None,
                    'time_remaining_ms': 0
                }
                
        except Exception as e:
            raise Exception(f"Error fetching block status: {str(e)}")
    
    # Wallet management
    async def save_user_wallet(self, user_id: str, wallet_address: str, wallet_type: str = 'phantom') -> Dict[str, Any]:
        """Save user's Solana wallet address"""
        try:
            wallet_ref = self.db.collection('user_wallets').document(user_id)
            
            wallet_data = {
                'user_id': user_id,
                'wallet_address': wallet_address,
                'wallet_type': wallet_type,
                'connected_at': datetime.now(),
                'last_updated': datetime.now()
            }
            
            wallet_ref.set(wallet_data)
            
            return {
                'success': True,
                'wallet_address': wallet_address
            }
            
        except Exception as e:
            raise Exception(f"Error saving wallet: {str(e)}")
    
    async def get_user_wallet(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's saved wallet address"""
        try:
            wallet_ref = self.db.collection('user_wallets').document(user_id)
            wallet_doc = wallet_ref.get()
            
            if wallet_doc.exists:
                return wallet_doc.to_dict()
            else:
                return None
                
        except Exception as e:
            raise Exception(f"Error fetching wallet: {str(e)}")
    
    # NFT Certificate management
    async def save_nft_certificate(
        self, 
        user_id: str, 
        course_id: str, 
        certificate_image_url: str,
        transaction_signature: str,
        mint_address: str,
        minted_at: str
    ) -> Dict[str, Any]:
        """Save NFT certificate minting status to Firebase"""
        try:
            cert_doc_id = f"{user_id}_{course_id}_nft"
            cert_ref = self.db.collection('nft_certificates').document(cert_doc_id)
            
            cert_data = {
                'user_id': user_id,
                'course_id': course_id,
                'certificate_image_url': certificate_image_url,
                'transaction_signature': transaction_signature,
                'mint_address': mint_address,
                'minted_at': minted_at,
                'saved_at': datetime.now()
            }
            
            cert_ref.set(cert_data)
            
            return {
                'success': True,
                'message': 'NFT certificate status saved'
            }
            
        except Exception as e:
            raise Exception(f"Error saving NFT certificate: {str(e)}")
    
    async def get_nft_certificate(self, user_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """Get NFT certificate minting status from Firebase"""
        try:
            cert_doc_id = f"{user_id}_{course_id}_nft"
            cert_ref = self.db.collection('nft_certificates').document(cert_doc_id)
            cert_doc = cert_ref.get()
            
            if cert_doc.exists:
                return cert_doc.to_dict()
            else:
                return None
                
        except Exception as e:
            raise Exception(f"Error fetching NFT certificate: {str(e)}")
    
    async def delete_nft_certificate(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Delete NFT certificate status (for testing mode)"""
        try:
            cert_doc_id = f"{user_id}_{course_id}_nft"
            cert_ref = self.db.collection('nft_certificates').document(cert_doc_id)
            cert_ref.delete()
            
            return {
                'success': True,
                'message': 'NFT certificate status deleted'
            }
            
        except Exception as e:
            raise Exception(f"Error deleting NFT certificate: {str(e)}")