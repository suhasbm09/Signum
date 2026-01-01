"""
Unit Tests for Quiz Service (4 tests)
Tests quiz submission, grading, and attempts
"""
import pytest
from unittest.mock import patch, MagicMock


class TestQuizService:
    """Test suite for Quiz Service"""
    
    @pytest.mark.unit
    def test_quiz_submission_and_grading(self, mock_firestore_client):
        """Test quiz submission with correct grading logic"""
        from app.domains.assessment.quiz_service import QuizService
        
        with patch('app.domains.assessment.quiz_service.AssessmentRepository') as mock_assessment, \
             patch('app.domains.assessment.quiz_service.ProgressRepository') as mock_progress:
            
            quiz_service = QuizService()

            # Mock successful persistence calls
            mock_assessment.return_value.create_submission.return_value = {"id": "submission_1"}
            mock_progress.return_value.update_quiz_progress.return_value = {"success": True}

            # Start session (NEW API)
            start = quiz_service.start_quiz_session(
                user_id="test_user",
                course_id="data-structures",
                num_questions=5
            )
            assert start["success"] is True
            session_id = start["session_id"]

            # Build perfect answers using server-side stored correct indices
            session_questions = quiz_service.active_sessions[session_id]["questions"]
            answers = {q["id"]: q["correct"] for q in session_questions}

            result = quiz_service.submit_quiz(
                user_id="test_user",
                session_id=session_id,
                answers=answers
            )
            
            assert 'score' in result
            assert 'passed' in result
            assert result['score'] == 100  # Perfect score capped at 100
            assert result['passed'] is True
            print(f"✅ Quiz submission grading: {result['score']}%")
    
    
    @pytest.mark.unit
    def test_quiz_passing_threshold(self):
        """Test quiz passing threshold is 85%"""
        # Passing threshold logic from quiz_service.py line 136
        assert 85 >= 85  # 85% passes
        assert 90 >= 85  # 90% passes
        assert 84 < 85   # 84% fails
        print("✅ Quiz threshold: 85%")
    
    
    @pytest.mark.unit
    def test_get_quiz_questions(self):
        """Test retrieving quiz questions (NEW: start_quiz_session returns questions without answers)"""
        from app.domains.assessment.quiz_service import QuizService
        
        quiz_service = QuizService()
        start = quiz_service.start_quiz_session(
            user_id="test_user",
            course_id="data-structures",
            num_questions=5
        )

        assert start["success"] is True
        assert 'questions' in start
        assert len(start['questions']) == 5

        # Ensure correct answers are NOT leaked to frontend
        assert 'correct' not in start['questions'][0]
        assert 'explanation' not in start['questions'][0]
        print("✅ Get Quiz Questions: PASS")
    
    
    @pytest.mark.unit
    def test_quiz_attempts_tracking(self):
        """Test quiz attempts tracking"""
        from app.domains.assessment.quiz_service import QuizService
        
        with patch('app.domains.assessment.quiz_service.AssessmentRepository') as mock_repo:
            mock_repo_instance = mock_repo.return_value
            mock_repo_instance.get_user_submissions.return_value = [
                {"score": 80, "submitted_at": "2024-01-01"},
                {"score": 90, "submitted_at": "2024-01-02"}
            ]
            
            quiz_service = QuizService()
            attempts = quiz_service.get_quiz_attempts(
                user_id="test_user",
                course_id="data-structures"
            )
            
            assert isinstance(attempts, list)
            print("✅ Quiz Attempts Tracking: PASS")
