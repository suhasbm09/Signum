"""
Integration Tests - Quiz and Coding Submission Flows (2 tests)
Tests complete submission workflows from start to finish
"""
import pytest
from unittest.mock import patch, MagicMock


class TestSubmissionFlows:
    """Integration tests for complete submission workflows"""
    
    @pytest.mark.integration
    def test_complete_quiz_submission_flow(self):
        """Test complete quiz submission: start session → submit → verify score → update progress"""
        from app.domains.assessment.quiz_service import QuizService
        
        with patch('app.domains.assessment.quiz_service.AssessmentRepository') as mock_assessment, \
             patch('app.domains.assessment.quiz_service.ProgressRepository') as mock_progress:
            
            mock_assessment_instance = mock_assessment.return_value
            mock_progress_instance = mock_progress.return_value
            
            mock_assessment_instance.create_submission.return_value = {"id": "sub_123"}
            mock_progress_instance.update_quiz_progress.return_value = {"success": True}
            
            quiz_service = QuizService()

            # Step 1: Start quiz session (NEW)
            start = quiz_service.start_quiz_session(
                user_id="student_123",
                course_id="data-structures",
                num_questions=5
            )
            assert start["success"] is True
            assert 'questions' in start
            assert len(start['questions']) == 5
            session_id = start["session_id"]

            # Step 2: Submit answers (perfect)
            session_questions = quiz_service.active_sessions[session_id]["questions"]
            answers = {q["id"]: q["correct"] for q in session_questions}

            result = quiz_service.submit_quiz(
                user_id="student_123",
                session_id=session_id,
                answers=answers
            )
            
            # Step 3: Verify result
            assert 'score' in result
            assert 'passed' in result
            assert result['score'] == 100
            assert result['passed'] is True
            
            # Step 4: Verify assessment saved
            assert mock_assessment_instance.create_submission.called
            
            # Step 5: Verify progress updated
            assert mock_progress_instance.update_quiz_progress.called
            call_args = mock_progress_instance.update_quiz_progress.call_args[1]
            assert call_args['score'] == 100
            assert call_args['passed'] is True
            
            print("✅ Complete quiz submission flow working")
    
    
    @pytest.mark.integration
    def test_complete_coding_submission_flow(self):
        """Test complete coding submission: run → evaluate → save → update progress"""
        from app.domains.assessment.coding_service import CodingService
        
        # CRITICAL: Patch where coding_evaluation_service is USED, not where it's defined
        with patch('app.domains.assessment.coding_service.coding_evaluation_service') as mock_eval_service, \
             patch('app.domains.assessment.coding_service.AssessmentRepository') as mock_assessment, \
             patch('app.domains.assessment.coding_service.ProgressRepository') as mock_progress:
            
            mock_assessment_instance = mock_assessment.return_value
            mock_progress_instance = mock_progress.return_value
            
            # Mock evaluation results
            mock_eval_service.run_code_only.return_value = {
                "success": True,
                "output": "120",
                "execution_time": 0.05
            }
            
            mock_eval_service.evaluate_submission.return_value = {
                "success": True,
                "score": 80,
                "test_results": [
                    {"test": "factorial(5)", "passed": True, "expected": "120", "got": "120"}
                ],
                "time_complexity_analysis": "O(n)"
            }
            
            mock_assessment_instance.create_submission.return_value = {"id": "code_sub_456"}
            mock_progress_instance.update_coding_progress.return_value = {"success": True}
            
            coding_service = CodingService()
            
            # Step 1: Run code (preview with first test case)
            run_result = coding_service.run_code(
                code="def factorial(n): return 1 if n <= 1 else n * factorial(n-1)",
                language="python",
                problem_id="factorial"
            )
            
            assert run_result['success'] is True
            assert 'output' in run_result
            
            # Step 2: Submit for full evaluation
            submit_result = coding_service.submit_code(
                user_id="student_456",
                course_id="data-structures",
                code="def factorial(n): return 1 if n <= 1 else n * factorial(n-1)",
                language="python",
                problem_id="factorial"
            )
            
            # Step 3: Verify evaluation returns the mocked result
            assert submit_result['success'] is True
            assert submit_result['score'] == 80  # This should now work!
            
            # Step 4: Verify submission saved with correct score
            assert mock_assessment_instance.create_submission.called
            save_call = mock_assessment_instance.create_submission.call_args[1]
            assert save_call['assessment_type'] == 'coding'
            assert save_call['score'] == 80  # From mocked evaluation
            
            # Step 5: Verify progress updated correctly
            assert mock_progress_instance.update_coding_progress.called
            progress_call = mock_progress_instance.update_coding_progress.call_args[1]
            assert progress_call['score'] == 80
            assert progress_call['passed'] is True  # 80 >= 50
            
            print("✅ Complete coding submission flow working")
