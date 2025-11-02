"""
Pytest fixtures and configuration
Shared test utilities for all test modules
"""
import pytest
from unittest.mock import Mock, MagicMock
from datetime import datetime


@pytest.fixture
def mock_firestore_client():
    """Mock Firestore client for repository tests"""
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_db.collection.return_value = mock_collection
    return mock_db


@pytest.fixture
def mock_gemini_model():
    """Mock Gemini AI model for AI service tests"""
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is a test AI response"
    mock_model.generate_content.return_value = mock_response
    return mock_model


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        'uid': 'test_user_123',
        'email': 'test@example.com',
        'displayName': 'Test User',
        'photoURL': 'http://photo.url',
        'coursesEnrolled': ['data-structures'],
        'phantomWalletAddress': 'ABC123xyz',
        'isDeleted': False
    }


@pytest.fixture
def sample_quiz_data():
    """Sample quiz data for testing"""
    return {
        'quiz_id': 'module1-quiz',
        'questions': [
            {
                'id': 'q1',
                'text': 'What is an array?',
                'options': ['A', 'B', 'C', 'D'],
                'correct': 'A'
            },
            {
                'id': 'q2',
                'text': 'What is a linked list?',
                'options': ['A', 'B', 'C', 'D'],
                'correct': 'B'
            }
        ]
    }


@pytest.fixture
def sample_progress_data():
    """Sample progress data for testing"""
    return {
        'user_id': 'test_user_123',
        'course_id': 'data-structures',
        'modules_completed': ['module1', 'module2'],
        'completion_percentage': 40.0,
        'quiz': {
            'best_score': 85,
            'last_score': 85,
            'attempts': 1,
            'passed': True
        },
        'coding': {
            'completed': False,
            'best_score': 0,
            'last_score': 0
        }
    }


@pytest.fixture
def sample_certificate_data():
    """Sample certificate data for testing"""
    return {
        'course_id': 'data-structures',
        'wallet_address': 'ABC123xyz',
        'final_score': 95,
        'timestamp': datetime.now().isoformat() + 'Z',
        'user_name': 'Test User'
    }
