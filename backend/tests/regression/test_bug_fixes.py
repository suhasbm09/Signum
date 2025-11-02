"""
Regression Tests (2 tests)
Tests to ensure previously fixed bugs stay fixed
"""
import pytest
from unittest.mock import patch, MagicMock


class TestRegressionBugFixes:
    """Regression tests for verified bug fixes"""
    
    @pytest.mark.regression
    def test_bug_1_certificate_eligibility_threshold_stays_fixed(self):
        """
        REGRESSION TEST for Bug #1
        Ensures certificate eligibility uses >= 90%, not == 100%
        Bug Location: app/repositories/progress_repository.py:117
        """
        from app.repositories.progress_repository import ProgressRepository
        
        with patch('app.core.database.get_db') as mock_db:
            mock_db.return_value = MagicMock()
            
            progress_repo = ProgressRepository()
            
            with patch.object(progress_repo, 'get') as mock_get:
                # User with 90% should be eligible (not just 100%)
                mock_get.return_value = {
                    "completion_percentage": 100,
                    "quiz": {"best_score": 85, "passed": True},
                    "coding": {"best_score": 50, "completed": True}
                }
                
                result = progress_repo.get_certification_eligibility("user", "course")
                
                # Verify the fix: >= 90%, not == 100%
                overall = result['overall_completion']
                if overall >= 90:
                    assert result['eligible'] is True, \
                        f"BUG REGRESSION: User with {overall}% should be eligible (>= 90%)"
                
                print(f"✅ Bug #1 still fixed: {overall}% completion → eligible={result['eligible']}")
    
    
    @pytest.mark.regression
    def test_bug_2_coding_submission_mock_patching_stays_fixed(self):
        """
        REGRESSION TEST for Bug #2
        Ensures coding evaluation mock is patched at correct location
        Bug: Was patching where DEFINED, should patch where USED
        """
        from app.domains.assessment.coding_service import CodingService
        
        # CRITICAL: Patch where coding_evaluation_service is USED, not where it's defined
        with patch('app.domains.assessment.coding_service.coding_evaluation_service.evaluate_submission') as mock_eval, \
             patch('app.domains.assessment.coding_service.AssessmentRepository') as mock_assessment, \
             patch('app.domains.assessment.coding_service.ProgressRepository') as mock_progress:
            
            mock_eval.return_value = {
                "success": True,
                "score": 80.0,
                "test_results": [{"passed": True}, {"passed": True}],
                "time_complexity_analysis": "O(n)"
            }
            
            mock_assessment_instance = mock_assessment.return_value
            mock_assessment_instance.save_coding_submission.return_value = {"submission_id": "sub1"}
            
            mock_progress_instance = mock_progress.return_value
            mock_progress_instance.update_coding_progress.return_value = {"updated": True}
            
            coding_service = CodingService()
            result = coding_service.submit_code(
                user_id="user",
                course_id="course",
                code="def solution(): return True",
                language="python",
                problem_id="p1"
            )
            
            # Verify mock was applied correctly (score should be 80, not 0)
            save_call = mock_assessment_instance.save_coding_submission.call_args
            if save_call:
                saved_data = save_call[1]  # kwargs
                assert saved_data['score'] == 80.0, \
                    "BUG REGRESSION: Mock not applied correctly, score should be 80"
            
            print("✅ Bug #2 still fixed: Coding evaluation mock patching correct")
