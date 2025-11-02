"""
Assessment repository (quiz + coding submissions + anti-cheat)
"""
from typing import Dict, Any, List, Optional
from app.repositories.base import BaseRepository
from datetime import datetime, timedelta
import uuid

class AssessmentRepository(BaseRepository):
    def __init__(self):
        super().__init__('assessment_submissions')
        self.anti_cheat_collection = self.db.collection('anti_cheat_events')
    
    # Assessment Submissions
    def create_submission(self, user_id: str, course_id: str, 
                         assessment_type: str, score: float,
                         answers: List[Dict] = None, 
                         code: str = None,
                         problem_id: str = None,
                         language: str = None,
                         metadata: Dict = None) -> Dict[str, Any]:
        """Create a quiz or coding submission - SIMPLE VERSION"""
        
        submission_id = str(uuid.uuid4())
        data = {
            'id': submission_id,
            'user_id': user_id,
            'course_id': course_id,
            'type': assessment_type,  # 'quiz' or 'coding'
            'score': score,
            'submitted_at': datetime.now()
        }
        
        if assessment_type == 'quiz':
            data['answers'] = answers or []
        elif assessment_type == 'coding':
            data['code'] = code
            data['problem_id'] = problem_id
            data['language'] = language
            data['test_results'] = metadata.get('test_results', []) if metadata else []
            data['time_complexity'] = metadata.get('time_complexity', {}) if metadata else {}
        
        self.collection.document(submission_id).set(data)
        return data
    
    def get_user_submissions(self, user_id: str, course_id: str, 
                            assessment_type: str = None,
                            limit: int = 10) -> List[Dict[str, Any]]:
        """Get user submissions"""
        filters = [
            ('user_id', '==', user_id),
            ('course_id', '==', course_id)
        ]
        if assessment_type:
            filters.append(('type', '==', assessment_type))
        
        # Don't use order_by to avoid Firestore index requirement
        # We'll sort in Python instead
        results = self.query(filters, limit=limit)
        
        # Sort by submitted_at in Python (most recent first)
        results.sort(key=lambda x: x.get('submitted_at', datetime.min), reverse=True)
        
        return results
    
    def get_best_score(self, user_id: str, course_id: str, 
                      assessment_type: str) -> Optional[float]:
        """Get best score for an assessment type"""
        submissions = self.get_user_submissions(user_id, course_id, assessment_type)
        if not submissions:
            return None
        return max(s['score'] for s in submissions)
    
    # Anti-Cheat Events
    def record_violation(self, user_id: str, course_id: str,
                        assessment_type: str, violation_type: str,
                        timestamp: str = None) -> Dict[str, Any]:
        """Record an anti-cheat violation"""
        event_id = str(uuid.uuid4())
        data = {
            'id': event_id,
            'user_id': user_id,
            'course_id': course_id,
            'assessment_type': assessment_type,
            'event_type': 'violation',
            'violation_type': violation_type,
            'timestamp': timestamp or datetime.now().isoformat(),
            'created_at': datetime.now()
        }
        self.anti_cheat_collection.document(event_id).set(data)
        return data
    
    def get_violations(self, user_id: str, course_id: str,
                      assessment_type: str) -> List[Dict[str, Any]]:
        """Get all violations for a user"""
        query = self.anti_cheat_collection \
            .where('user_id', '==', user_id) \
            .where('course_id', '==', course_id) \
            .where('assessment_type', '==', assessment_type) \
            .where('event_type', '==', 'violation')
        
        docs = query.stream()
        return [{'id': doc.id, **doc.to_dict()} for doc in docs]
    
    def create_block(self, user_id: str, course_id: str,
                    assessment_type: str, block_duration_minutes: int,
                    violation_count: int) -> Dict[str, Any]:
        """Create a block event"""
        block_id = f"{user_id}_{course_id}_{assessment_type}_block"
        block_end_time = datetime.now() + timedelta(minutes=block_duration_minutes)
        
        data = {
            'id': block_id,
            'user_id': user_id,
            'course_id': course_id,
            'assessment_type': assessment_type,
            'event_type': 'block',
            'violation_count': violation_count,
            'block_end_time': block_end_time,
            'blocked_at': datetime.now(),
            'is_active': True
        }
        
        self.anti_cheat_collection.document(block_id).set(data)
        return {
            'success': True,
            'block_end_time': block_end_time.isoformat(),
            'block_duration_minutes': block_duration_minutes
        }
    
    def get_block_status(self, user_id: str, course_id: str,
                        assessment_type: str) -> Dict[str, Any]:
        """Get block status for a user"""
        block_id = f"{user_id}_{course_id}_{assessment_type}_block"
        block_doc = self.anti_cheat_collection.document(block_id).get()
        
        if not block_doc.exists:
            return {
                'is_blocked': False,
                'block_end_time': None,
                'time_remaining_ms': 0
            }
        
        block_data = block_doc.to_dict()
        block_end_time = block_data.get('block_end_time')
        
        if block_end_time and block_end_time > datetime.now():
            time_remaining = (block_end_time - datetime.now()).total_seconds() * 1000
            return {
                'is_blocked': True,
                'block_end_time': block_end_time.isoformat(),
                'time_remaining_ms': int(time_remaining),
                'violation_count': block_data.get('violation_count', 0)
            }
        else:
            # Block expired
            self.anti_cheat_collection.document(block_id).update({'is_active': False})
            return {
                'is_blocked': False,
                'block_end_time': None,
                'time_remaining_ms': 0
            }
    
    def clear_violations_and_block(self, user_id: str, course_id: str,
                                  assessment_type: str) -> Dict[str, Any]:
        """Clear all violations and block for a user"""
        # Delete violations
        query = self.anti_cheat_collection \
            .where('user_id', '==', user_id) \
            .where('course_id', '==', course_id) \
            .where('assessment_type', '==', assessment_type) \
            .where('event_type', '==', 'violation')
        
        deleted_count = 0
        for doc in query.stream():
            doc.reference.delete()
            deleted_count += 1
        
        # Delete block
        block_id = f"{user_id}_{course_id}_{assessment_type}_block"
        self.anti_cheat_collection.document(block_id).delete()
        
        return {
            'violations_cleared': deleted_count,
            'block_cleared': True,
            'timestamp': datetime.now().isoformat()
        }
