"""
Integration Tests - Anti-Cheat Flow (2 tests)
Tests complete anti-cheat workflow
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta


class TestAntiCheatFlow:
    """Integration tests for anti-cheat system workflow"""
    
    @pytest.mark.integration
    def test_violation_triggers_block_at_threshold(self):
        """Test that 3rd violation triggers 15-min block"""
        from app.domains.assessment.anti_cheat_service import AntiCheatService
        
        with patch('app.domains.assessment.anti_cheat_service.AssessmentRepository') as mock_repo:
            mock_instance = mock_repo.return_value
            
            # Anti-cheat checks violations AFTER recording the new one
            # So when we report 3rd violation, get_violations returns all 3
            mock_instance.record_violation.return_value = {"violation_id": "v3"}
            
            # After recording, get_violations returns 3 total
            mock_instance.get_violations.return_value = [
                {"violation_id": "v1"},
                {"violation_id": "v2"},
                {"violation_id": "v3"}
            ]
            
            mock_instance.create_block.return_value = {"block_id": "b1"}
            
            anti_cheat = AntiCheatService()
            
            # Report 3rd violation
            result = anti_cheat.report_violation(
                user_id="repeat_offender",
                course_id="ds",
                assessment_type="quiz",
                violation_type="external_help"
            )
            
            # Should have triggered block creation
            assert mock_instance.create_block.called
            call_args = mock_instance.create_block.call_args[1]
            assert call_args['block_duration_minutes'] == 15
            print("✅ 3 violations = 15 min block triggered")
    
    
    @pytest.mark.integration
    def test_clear_violations_workflow(self):
        """Test clearing violations after cooldown period"""
        from app.domains.assessment.anti_cheat_service import AntiCheatService
        
        with patch('app.domains.assessment.anti_cheat_service.AssessmentRepository') as mock_repo:
            mock_instance = mock_repo.return_value
            mock_instance.clear_violations_and_block.return_value = {"cleared": True}
            
            anti_cheat = AntiCheatService()
            
            result = anti_cheat.clear_violations(
                user_id="reformed_user",
                course_id="ds",
                assessment_type="quiz"
            )
            
            assert result['cleared'] is True
            assert mock_instance.clear_violations_and_block.called
            print("✅ Clear violations workflow complete")
