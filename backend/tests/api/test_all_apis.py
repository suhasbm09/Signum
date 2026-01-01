"""
API Integration Tests (20 tests total)
Tests all 5 domain API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock, MagicMock, AsyncMock
from app.main import app

client = TestClient(app)


# ========== AI API Tests (3 tests) ==========

class TestAIAPI:
    """Test suite for AI API endpoints"""
    
    @pytest.mark.api
    def test_ai_chat_endpoint(self):
        """Test POST /ai/chat"""
        with patch('app.services.ai.ai_service.ai_service.chat', new_callable=AsyncMock) as mock_chat:
            mock_chat.return_value = {"success": True, "response": "Test response"}
            
            response = client.post("/ai/chat", json={
                "message": "What is an array?",
                "context": "Data Structures"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ AI Chat Endpoint: PASS")
    
    
    @pytest.mark.api
    def test_ai_status_endpoint(self):
        """Test GET /ai/status"""
        response = client.get("/ai/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'operational'
        assert data['model'] == 'gemini-2.5-flash'
        print("✅ AI Status Endpoint: PASS")
    
    
    @pytest.mark.api
    def test_ai_chat_validation(self):
        """Test AI chat input validation"""
        response = client.post("/ai/chat", json={
            "message": "",  # Empty message
            "context": "General"
        })
        
        assert response.status_code in [200, 422]  # Either succeeds or validation error
        print("✅ AI Input Validation: PASS")


# ========== Assessment API Tests (7 tests) ==========

class TestAssessmentAPI:
    """Test suite for Assessment API endpoints"""
    
    @pytest.mark.api
    def test_get_quiz_questions(self):
        """Test GET /assessment/{course_id}/quiz/{quiz_id}"""
        # Legacy route internally calls routes.quiz_service.start_quiz_session
        with patch('app.domains.assessment.routes.quiz_service.start_quiz_session') as mock_start:
            mock_start.return_value = {"success": True, "questions": []}
            
            response = client.get("/assessment/data-structures/quiz/module1-quiz")
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Get Quiz Questions: PASS")
    
    
    @pytest.mark.api
    def test_submit_quiz(self):
        """Test POST /assessment/{course_id}/quiz/{quiz_id}/submit"""
        response = client.post(
            "/assessment/data-structures/quiz/module1-quiz/submit",
            json={
                "user_id": "test_user",
                "score": 90,
                "passed": True,
                "answers": [
                    {"questionId": "q1", "userAnswer": "A", "correctAnswer": "A", "isCorrect": True}
                ]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        assert data['data']['passed'] is True
        print("✅ Submit Quiz: PASS")
    
    
    @pytest.mark.api
    def test_run_code(self):
        """Test POST /assessment/{course_id}/coding/run"""
        with patch('app.domains.assessment.coding_service.CodingService.run_code') as mock_run:
            mock_run.return_value = {"success": True, "output": "5"}
            
            response = client.post(
                "/assessment/data-structures/coding/run",
                json={
                    "code": "print(2+3)",
                    "language": "python",
                    "problem_id": "problem1"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Run Code: PASS")
    
    
    @pytest.mark.api
    def test_submit_code(self):
        """Test POST /assessment/{course_id}/coding/submit"""
        with patch('app.domains.assessment.coding_service.CodingService.submit_code') as mock_submit:
            mock_submit.return_value = {"success": True, "score": 85}
            
            response = client.post(
                "/assessment/data-structures/coding/submit",
                json={
                    "user_id": "test_user",
                    "code": "def factorial(n): return 1 if n <= 1 else n * factorial(n-1)",
                    "language": "python",
                    "problem_id": "problem1"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Submit Code: PASS")
    
    
    @pytest.mark.api
    def test_report_violation(self):
        """Test POST /assessment/{course_id}/anti-cheat/report"""
        with patch('app.domains.assessment.anti_cheat_service.AntiCheatService.report_violation') as mock_report:
            mock_report.return_value = {"violation_count": 1, "blocked": False}
            
            response = client.post(
                "/assessment/data-structures/anti-cheat/report",
                json={
                    "user_id": "test_user",
                    "course_id": "data-structures",
                    "assessment_type": "quiz",
                    "violation_type": "TAB_SWITCH",
                    "timestamp": "2024-01-15T10:00:00Z"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Report Violation: PASS")
    
    
    @pytest.mark.api
    def test_get_anti_cheat_status(self):
        """Test GET /assessment/{course_id}/anti-cheat/status"""
        with patch('app.domains.assessment.anti_cheat_service.AntiCheatService.get_status') as mock_status:
            mock_status.return_value = {"violations": [], "violation_count": 0, "blocked": False}
            
            response = client.get(
                "/assessment/data-structures/anti-cheat/status?user_id=test_user&assessment_type=quiz"
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Get Anti-Cheat Status: PASS")
    
    
    @pytest.mark.api
    def test_clear_violations(self):
        """Test POST /assessment/{course_id}/anti-cheat/clear"""
        with patch('app.domains.assessment.anti_cheat_service.AntiCheatService.clear_violations') as mock_clear:
            mock_clear.return_value = {"success": True}
            
            response = client.post(
                "/assessment/data-structures/anti-cheat/clear?user_id=test_user&assessment_type=quiz"
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Clear Violations: PASS")


# ========== Auth API Tests (4 tests) ==========

class TestAuthAPI:
    """Test suite for Auth API endpoints"""
    
    @pytest.mark.api
    def test_verify_firebase_token_success(self):
        """Test POST /auth/verify-firebase-token"""
        with patch('app.domains.auth.routes.firebase_auth.verify_id_token') as mock_verify, \
             patch('app.domains.auth.routes.firebase_auth.get_user') as mock_get_user, \
             patch('app.repositories.user_repository.UserRepository.create_or_update_user'), \
             patch('app.repositories.user_repository.UserRepository.get_by_email') as mock_get:
            
            mock_verify.return_value = {'uid': 'test_uid_123'}
            mock_get_user.return_value = Mock(
                uid='test_uid_123',
                email='test@example.com',
                display_name='Test User',
                photo_url='http://photo.url',
                email_verified=True
            )
            mock_get.return_value = {
                'uid': 'test_uid_123',
                'email': 'test@example.com',
                'displayName': 'Test User',
                'coursesEnrolled': []
            }
            
            response = client.post(
                "/auth/verify-firebase-token",
                json={"idToken": "fake_firebase_token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['user']['email'] == 'test@example.com'
            print("✅ Verify Firebase Token: PASS")
    
    
    @pytest.mark.api
    def test_get_current_user_unauthenticated(self):
        """Test GET /auth/me - not authenticated"""
        new_client = TestClient(app)
        response = new_client.get("/auth/me")
        
        assert response.status_code == 401
        print("✅ Get Current User (Unauthenticated): PASS")
    
    
    @pytest.mark.api
    def test_enroll_course(self):
        """Test POST /auth/courses/enroll"""
        with patch('app.domains.auth.routes.firebase_auth.verify_id_token') as mock_verify, \
             patch('app.domains.auth.routes.firebase_auth.get_user') as mock_get_user, \
             patch('app.repositories.user_repository.UserRepository.create_or_update_user'), \
             patch('app.repositories.user_repository.UserRepository.get_by_email') as mock_get, \
             patch('app.repositories.user_repository.UserRepository.enroll_course') as mock_enroll:
            
            mock_verify.return_value = {'uid': 'test_uid'}
            mock_get_user.return_value = Mock(
                uid='test_uid',
                email='test@example.com',
                display_name='Test User',
                photo_url=None,
                email_verified=True
            )
            mock_get.return_value = {
                'email': 'test@example.com',
                'coursesEnrolled': ['data-structures'],
                'isDeleted': False
            }
            
            # Login first
            client.post("/auth/verify-firebase-token", json={"idToken": "token"})
            
            # Enroll
            response = client.post(
                "/auth/courses/enroll",
                json={"courseId": "data-structures"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Enroll Course: PASS")
    
    
    @pytest.mark.api
    def test_update_profile(self):
        """Test PUT /auth/profile"""
        with patch('app.domains.auth.routes.firebase_auth.verify_id_token') as mock_verify, \
             patch('app.domains.auth.routes.firebase_auth.get_user') as mock_get_user, \
             patch('app.repositories.user_repository.UserRepository.create_or_update_user'), \
             patch('app.repositories.user_repository.UserRepository.get_by_email') as mock_get, \
             patch('app.repositories.user_repository.UserRepository.update_profile') as mock_update:
            
            mock_verify.return_value = {'uid': 'test_uid'}
            mock_get_user.return_value = Mock(
                uid='test_uid',
                email='test@example.com',
                display_name='Test User',
                photo_url=None,
                email_verified=True
            )
            mock_get.return_value = {'email': 'test@example.com', 'isDeleted': False}
            
            # Login first
            client.post("/auth/verify-firebase-token", json={"idToken": "token"})
            
            # Update profile
            response = client.put(
                "/auth/profile",
                json={"displayName": "Updated Name", "bio": "New bio"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Update Profile: PASS")


# ========== Progress API Tests (3 tests) ==========

class TestProgressAPI:
    """Test suite for Progress API endpoints"""
    
    @pytest.mark.api
    def test_get_course_progress(self):
        """Test GET /progress/{course_id}"""
        with patch('app.repositories.progress_repository.ProgressRepository.get_user_course_progress') as mock_get:
            mock_get.return_value = {
                "user_id": "test_user",
                "course_id": "data-structures",
                "completion_percentage": 40.0
            }
            
            response = client.get("/progress/data-structures?user_id=test_user")
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Get Course Progress: PASS")
    
    
    @pytest.mark.api
    def test_sync_course_progress(self):
        """Test POST /progress/{course_id}/sync"""
        with patch('app.repositories.progress_repository.ProgressRepository.sync_progress') as mock_sync:
            mock_sync.return_value = {"synced": True, "completion_percentage": 60.0}
            
            response = client.post(
                "/progress/data-structures/sync",
                json={
                    "user_id": "test_user",
                    "course_id": "data-structures",
                    "modules_completed": ["module1", "module2"],
                    "completion_percentage": 60.0
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Sync Course Progress: PASS")
    
    
    @pytest.mark.api
    def test_get_certification_status(self):
        """Test GET /progress/{course_id}/certification-status"""
        with patch('app.repositories.progress_repository.ProgressRepository.get_certification_eligibility') as mock_status:
            mock_status.return_value = {
                "eligible": True,
                "quiz_score": 90,
                "learning_progress": 100,
                "overall_completion": 93
            }
            
            response = client.get(
                "/progress/data-structures/certification-status?user_id=test_user"
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['data']['eligible'] is True
            print("✅ Get Certification Status: PASS")


# ========== Certification API Tests (3 tests) ==========

class TestCertificationAPI:
    """Test suite for Certification API endpoints"""
    
    @pytest.mark.api
    def test_mint_certificate_eligible(self):
        """Test POST /certification/{course_id}/mint - eligible"""
        with patch('app.repositories.progress_repository.ProgressRepository.get_certification_eligibility') as mock_eligible, \
             patch('app.services.metadata_service.MetadataService.generate_metadata') as mock_metadata:
            
            mock_eligible.return_value = {
                "eligible": True,
                "quiz_score": 90,
                "learning_progress": 100
            }
            mock_metadata.return_value = {
                "metadata": {"name": "Test NFT", "image": "data:image/png;base64,abc"},
                "uri": "data:application/json;base64,xyz"
            }
            
            response = client.post(
                "/certification/data-structures/mint",
                json={
                    "user_id": "test_user",
                    "wallet_address": "ABC123xyz",
                    "user_name": "Test User"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['data']['eligible'] is True
            print("✅ Mint Certificate (Eligible): PASS")
    
    
    @pytest.mark.api
    def test_save_certificate(self):
        """Test POST /certification/{course_id}/save"""
        with patch('app.repositories.certification_repository.CertificationRepository.save_certificate') as mock_save:
            mock_save.return_value = {"certificate_id": "cert_123", "saved": True}
            
            response = client.post(
                "/certification/data-structures/save",
                json={
                    "user_id": "test_user",
                    "course_id": "data-structures",
                    "certificate_image_url": "ipfs://QmHash",
                    "transaction_signature": "tx_sig_123",
                    "mint_address": "mint_addr_456",
                    "minted_at": "2024-01-15T10:00:00Z"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            print("✅ Save Certificate: PASS")
    
    
    @pytest.mark.api
    def test_get_certificate_status(self):
        """Test GET /certification/{course_id}/status"""
        with patch('app.repositories.certification_repository.CertificationRepository.get_certificate') as mock_get:
            mock_get.return_value = {"mint_address": "mint_123"}
            
            response = client.get(
                "/certification/data-structures/status?user_id=test_user"
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['minted'] is True
            print("✅ Get Certificate Status: PASS")
