"""
Unit Tests for Coding Service (4 tests)
Tests code execution, submission, and evaluation
"""
import pytest
from unittest.mock import patch, MagicMock


class TestCodingService:
    """Test suite for Coding Service"""
    
    @pytest.mark.unit
    def test_run_code_success(self):
        """Test running code with first test case"""
        from app.domains.assessment.coding_service import CodingService
        
        with patch('app.services.ai.coding_evaluation_service.coding_evaluation_service.run_code_only') as mock_run:
            mock_run.return_value = {
                "success": True,
                "output": "5",
                "test_passed": True
            }
            
            coding_service = CodingService()
            result = coding_service.run_code(
                code="def add(a, b): return a + b",
                language="python",
                problem_id="problem1"
            )
            
            assert result['success'] is True
            assert 'output' in result
            print("✅ Run Code Success: PASS")
    
    
    @pytest.mark.unit
    def test_submit_code_evaluation(self):
        """Test code submission with full evaluation"""
        from app.domains.assessment.coding_service import CodingService
        
        with patch('app.services.ai.coding_evaluation_service.coding_evaluation_service.evaluate_submission') as mock_eval, \
             patch('app.domains.assessment.coding_service.AssessmentRepository') as mock_repo, \
             patch('app.domains.assessment.coding_service.ProgressRepository') as mock_progress:
            
            mock_eval.return_value = {
                "success": True,
                "score": 85,
                "test_results": [{"passed": True}],
                "time_complexity_analysis": "O(n)"
            }
            
            mock_repo_instance = mock_repo.return_value
            mock_progress_instance = mock_progress.return_value
            mock_repo_instance.create_submission.return_value = {"id": "sub_123"}
            mock_progress_instance.update_coding_progress.return_value = {"success": True}
            
            coding_service = CodingService()
            result = coding_service.submit_code(
                user_id="test_user",
                course_id="data-structures",
                code="def factorial(n): return 1 if n <= 1 else n * factorial(n-1)",
                language="python",
                problem_id="problem1"
            )
            
            assert result['success'] is True
            assert result['score'] == 85
            print("✅ Submit Code Evaluation: PASS")
    
    
    @pytest.mark.unit
    def test_coding_passing_threshold(self):
        """Test coding challenge passing threshold (50%)"""
        from app.domains.assessment.coding_service import CodingService
        
        with patch('app.services.ai.coding_evaluation_service.coding_evaluation_service.evaluate_submission') as mock_eval, \
             patch('app.domains.assessment.coding_service.AssessmentRepository') as mock_repo, \
             patch('app.domains.assessment.coding_service.ProgressRepository') as mock_progress:
            
            mock_repo_instance = mock_repo.return_value
            mock_progress_instance = mock_progress.return_value
            
            # Test passing (50%)
            mock_eval.return_value = {"success": True, "score": 50, "test_results": [], "time_complexity_analysis": "O(1)"}
            coding_service = CodingService()
            result = coding_service.submit_code("user", "course", "code", "python", "p1")
            
            # Verify update_coding_progress called with passed=True
            assert mock_progress_instance.update_coding_progress.called
            call_args = mock_progress_instance.update_coding_progress.call_args[1]
            assert call_args['passed'] is True
            
            # Test failing (49%)
            mock_eval.return_value = {"success": True, "score": 49, "test_results": [], "time_complexity_analysis": "O(1)"}
            result = coding_service.submit_code("user", "course", "code", "python", "p2")
            call_args = mock_progress_instance.update_coding_progress.call_args[1]
            assert call_args['passed'] is False
            
            print("✅ Coding Passing Threshold: PASS")
    
    
    @pytest.mark.unit
    def test_get_coding_submissions(self):
        """Test retrieving coding submissions"""
        from app.domains.assessment.coding_service import CodingService
        
        with patch('app.domains.assessment.coding_service.AssessmentRepository') as mock_repo:
            mock_repo_instance = mock_repo.return_value
            mock_repo_instance.get_user_submissions.return_value = [
                {"code": "test", "score": 75, "problem_id": "p1"}
            ]
            
            coding_service = CodingService()
            submissions = coding_service.get_submissions(
                user_id="test_user",
                course_id="data-structures"
            )
            
            assert isinstance(submissions, list)
            print("✅ Get Coding Submissions: PASS")
