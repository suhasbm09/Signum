"""
Unit Tests for Anti-Cheat Service (4 tests)
Tests violation reporting, blocking, and status tracking
"""
import pytest
from unittest.mock import patch, MagicMock


class TestAntiCheatService:
    """Test suite for Anti-Cheat Service"""
    
    @pytest.mark.unit
    def test_violation_reporting(self):
        """Test reporting a violation"""
        from app.domains.assessment.anti_cheat_service import AntiCheatService
        
        with patch('app.domains.assessment.anti_cheat_service.AssessmentRepository') as mock_repo:
            mock_repo_instance = mock_repo.return_value
            mock_repo_instance.record_violation.return_value = {"success": True}
            mock_repo_instance.get_violations.return_value = [{"type": "TAB_SWITCH"}]
            
            anti_cheat = AntiCheatService()
            result = anti_cheat.report_violation(
                user_id="test_user",
                course_id="data-structures",
                assessment_type="quiz",
                violation_type="TAB_SWITCH"
            )
            
            assert result is not None
            assert 'violation_count' in result or 'success' in result
            print("✅ Violation Reporting: PASS")
    
    
    @pytest.mark.unit
    def test_progressive_blocking(self):
        """Test progressive blocking based on violation count"""
        from app.domains.assessment.anti_cheat_service import AntiCheatService
        
        with patch('app.domains.assessment.anti_cheat_service.AssessmentRepository') as mock_repo:
            anti_cheat = AntiCheatService()
            mock_repo_instance = mock_repo.return_value
            
            # Test: 3 violations = 15 min block
            mock_repo_instance.get_violations.return_value = [{}] * 3
            mock_repo_instance.create_block.return_value = {"blocked": True, "block_duration_minutes": 15}
            
            block_result = anti_cheat.create_block(
                user_id="test_user",
                course_id="data-structures",
                assessment_type="quiz",
                block_duration_minutes=15,
                violation_count=3
            )
            
            assert 'block_duration_minutes' in block_result or 'success' in block_result
            print("✅ Progressive Blocking: PASS")
    
    
    @pytest.mark.unit
    def test_get_anti_cheat_status(self):
        """Test getting anti-cheat status"""
        from app.domains.assessment.anti_cheat_service import AntiCheatService
        
        with patch('app.domains.assessment.anti_cheat_service.AssessmentRepository') as mock_repo:
            mock_repo_instance = mock_repo.return_value
            mock_repo_instance.get_violations.return_value = [{"type": "TAB_SWITCH"}]
            mock_repo_instance.get_block_status.return_value = {"is_blocked": False}
            
            anti_cheat = AntiCheatService()
            status = anti_cheat.get_status(
                user_id="test_user",
                course_id="data-structures",
                assessment_type="quiz"
            )
            
            assert 'violations' in status
            assert 'violation_count' in status
            print("✅ Get Anti-Cheat Status: PASS")
    
    
    @pytest.mark.unit
    def test_clear_violations(self):
        """Test clearing violations"""
        from app.domains.assessment.anti_cheat_service import AntiCheatService
        
        with patch('app.domains.assessment.anti_cheat_service.AssessmentRepository') as mock_repo:
            mock_repo_instance = mock_repo.return_value
            mock_repo_instance.clear_violations_and_block.return_value = {"success": True}
            
            anti_cheat = AntiCheatService()
            result = anti_cheat.clear_violations(
                user_id="test_user",
                course_id="data-structures",
                assessment_type="quiz"
            )
            
            assert result['success'] is True
            print("✅ Clear Violations: PASS")
