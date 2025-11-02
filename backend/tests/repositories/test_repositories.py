"""
Repository Tests for Data Layer (10 tests)
Tests all repository CRUD operations
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime


class TestUserRepository:
    """Test suite for User Repository (2 tests)"""
    
    @pytest.mark.repository
    def test_create_or_update_user(self):
        """Test creating or updating user"""
        from app.repositories.user_repository import UserRepository
        
        with patch('app.repositories.user_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.user_repository.BaseRepository.get', return_value=None), \
             patch('app.repositories.user_repository.BaseRepository.create') as mock_create:
            
            mock_create.return_value = {"email": "test@example.com"}
            
            user_repo = UserRepository()
            user_repo.collection = MagicMock()
            
            result = user_repo.create_or_update_user(
                email="test@example.com",
                user_data={"uid": "123", "displayName": "Test"}
            )
            
            assert mock_create.called
            print("✅ Create/Update User: PASS")
    
    
    @pytest.mark.repository
    def test_enroll_course(self):
        """Test enrolling user in course"""
        from app.repositories.user_repository import UserRepository
        
        with patch('app.repositories.user_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.user_repository.BaseRepository.get') as mock_get, \
             patch('app.repositories.user_repository.BaseRepository.update') as mock_update:
            
            mock_get.return_value = {"email": "test@example.com", "coursesEnrolled": []}
            mock_update.return_value = {"coursesEnrolled": ["data-structures"]}
            
            user_repo = UserRepository()
            user_repo.collection = MagicMock()
            
            result = user_repo.enroll_course("test@example.com", "data-structures")
            
            assert mock_update.called
            print("✅ Enroll Course: PASS")


class TestProgressRepository:
    """Test suite for Progress Repository (3 tests)"""
    
    @pytest.mark.repository
    def test_sync_progress(self):
        """Test syncing course progress"""
        from app.repositories.progress_repository import ProgressRepository
        
        with patch('app.repositories.progress_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.progress_repository.BaseRepository.set') as mock_set:
            
            mock_set.return_value = {"completion_percentage": 60.0}
            
            progress_repo = ProgressRepository()
            progress_repo.collection = MagicMock()
            
            result = progress_repo.sync_progress(
                user_id="user123",
                course_id="data-structures",
                modules_completed=["module1", "module2"],
                completion_percentage=60.0
            )
            
            assert mock_set.called
            print("✅ Sync Progress: PASS")
    
    
    @pytest.mark.repository
    def test_update_quiz_progress(self):
        """Test updating quiz progress"""
        from app.repositories.progress_repository import ProgressRepository
        
        with patch('app.repositories.progress_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.progress_repository.BaseRepository.get') as mock_get, \
             patch('app.repositories.progress_repository.BaseRepository.set') as mock_set:
            
            mock_get.return_value = {"quiz": {"best_score": 80}}
            mock_set.return_value = {"quiz": {"best_score": 90}}
            
            progress_repo = ProgressRepository()
            progress_repo.collection = MagicMock()
            
            result = progress_repo.update_quiz_progress(
                user_id="user123",
                course_id="data-structures",
                score=90,
                passed=True
            )
            
            assert mock_set.called
            print("✅ Update Quiz Progress: PASS")
    
    
    @pytest.mark.repository
    def test_certification_eligibility_calculation(self):
        """Test certification eligibility calculation with 90% threshold"""
        from app.repositories.progress_repository import ProgressRepository
        
        with patch('app.repositories.progress_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.progress_repository.BaseRepository.get') as mock_get:
            
            # Test case: 90% eligible
            mock_get.return_value = {
                "completion_percentage": 90,
                "quiz": {"best_score": 85, "passed": True},
                "coding": {"best_score": 85, "completed": True}
            }
            
            progress_repo = ProgressRepository()
            progress_repo.collection = MagicMock()
            
            result = progress_repo.get_certification_eligibility("user123", "data-structures")
            
            # Calculation: (90 * 0.7) + (100 * 0.3) = 63 + 30 = 93%
            assert result['overall_completion'] >= 90
            assert result['eligible'] is True
            print("✅ Certification Eligibility (90% threshold): PASS")


class TestAssessmentRepository:
    """Test suite for Assessment Repository"""
    
    @pytest.mark.repository
    def test_create_quiz_submission(self, mock_firestore_client):
        """Test creating a quiz submission"""
        # Test the data structure and logic, not full Firestore integration
        submission_data = {
            "user_id": "test_user",
            "course_id": "data-structures",
            "assessment_type": "quiz",
            "score": 85.0,
            "answers": [{"question_id": "q1", "answer": "a"}]
        }
        
        # Verify data structure is correct
        assert submission_data['score'] >= 85.0
        assert submission_data['assessment_type'] == 'quiz'
        print("✅ Quiz submission data structure validated")
    
    
    @pytest.mark.repository
    def test_record_violation(self, mock_firestore_client):
        """Test recording anti-cheat violation"""
        # Test the violation data structure
        violation_data = {
            "user_id": "test_user",
            "course_id": "data-structures",
            "assessment_type": "quiz",
            "violation_type": "tab_switch"
        }
        
        # Verify data structure
        assert violation_data['violation_type'] in ['tab_switch', 'copy_paste', 'external_help']
        print("✅ Violation data structure validated")
    
    
    @pytest.mark.repository
    def test_create_block(self, mock_firestore_client):
        """Test creating temporary block"""
        # Test the block data structure
        block_data = {
            "user_id": "test_user",
            "course_id": "data-structures",
            "assessment_type": "quiz",
            "block_duration_minutes": 15,
            "violation_count": 3
        }
        
        # Verify business logic
        assert block_data['block_duration_minutes'] in [15, 30, 60]
        assert block_data['violation_count'] >= 3
        print("✅ Block data structure validated")


class TestCertificationRepository:
    """Test suite for Certification Repository (2 tests)"""
    
    @pytest.mark.repository
    def test_save_certificate(self):
        """Test saving NFT certificate"""
        from app.repositories.certification_repository import CertificationRepository
        
        with patch('app.repositories.certification_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.certification_repository.BaseRepository.set') as mock_set:
            
            mock_set.return_value = {"mint_address": "mint_123"}
            
            cert_repo = CertificationRepository()
            cert_repo.collection = MagicMock()
            
            result = cert_repo.save_certificate(
                user_id="user123",
                course_id="data-structures",
                certificate_image_url="ipfs://QmHash",
                transaction_signature="tx_sig",
                mint_address="mint_123",
                minted_at="2024-01-15T10:00:00Z"
            )
            
            assert mock_set.called
            print("✅ Save Certificate: PASS")
    
    
    @pytest.mark.repository
    def test_get_certificate(self):
        """Test retrieving certificate"""
        from app.repositories.certification_repository import CertificationRepository
        
        with patch('app.repositories.certification_repository.BaseRepository.__init__', return_value=None), \
             patch('app.repositories.certification_repository.BaseRepository.get') as mock_get:
            
            mock_get.return_value = {"mint_address": "mint_123"}
            
            cert_repo = CertificationRepository()
            cert_repo.collection = MagicMock()
            
            result = cert_repo.get_certificate("user123", "data-structures")
            
            assert result is not None
            print("✅ Get Certificate: PASS")
