"""
Quiz service - handles quiz questions and submissions
"""
from typing import Dict, List, Any
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.progress_repository import ProgressRepository

class QuizService:
    """Service for quiz management"""
    
    def __init__(self):
        self.assessment_repo = AssessmentRepository()
        self.progress_repo = ProgressRepository()
        
        # Quiz questions data (in-memory for now)
        self.quiz_questions = {
            "data-structures": {
                "quiz-1": {
                    "title": "Data Structures Fundamentals",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the time complexity of accessing an element in an array by index?",
                            "options": [
                                {"id": "a", "text": "O(1)"},
                                {"id": "b", "text": "O(n)"},
                                {"id": "c", "text": "O(log n)"},
                                {"id": "d", "text": "O(n²)"}
                            ],
                            "correct_answer": "a"
                        },
                        {
                            "id": "q2",
                            "question": "Which data structure follows LIFO (Last In, First Out) principle?",
                            "options": [
                                {"id": "a", "text": "Queue"},
                                {"id": "b", "text": "Stack"},
                                {"id": "c", "text": "Array"},
                                {"id": "d", "text": "Linked List"}
                            ],
                            "correct_answer": "b"
                        },
                        {
                            "id": "q3",
                            "question": "What is the worst-case time complexity for searching in a binary search tree?",
                            "options": [
                                {"id": "a", "text": "O(1)"},
                                {"id": "b", "text": "O(log n)"},
                                {"id": "c", "text": "O(n)"},
                                {"id": "d", "text": "O(n log n)"}
                            ],
                            "correct_answer": "c"
                        },
                        {
                            "id": "q4",
                            "question": "Which operation is NOT typically supported by a queue?",
                            "options": [
                                {"id": "a", "text": "Enqueue"},
                                {"id": "b", "text": "Dequeue"},
                                {"id": "c", "text": "Peek/Front"},
                                {"id": "d", "text": "Pop from middle"}
                            ],
                            "correct_answer": "d"
                        },
                        {
                            "id": "q5",
                            "question": "What is the space complexity of a recursive function that makes n recursive calls?",
                            "options": [
                                {"id": "a", "text": "O(1)"},
                                {"id": "b", "text": "O(log n)"},
                                {"id": "c", "text": "O(n)"},
                                {"id": "d", "text": "O(n²)"}
                            ],
                            "correct_answer": "c"
                        }
                    ]
                }
            }
        }
    
    def get_quiz_questions(self, course_id: str, quiz_id: str) -> Dict[str, Any]:
        """Get quiz questions (without correct answers)"""
        if course_id not in self.quiz_questions:
            return {"error": "Course not found"}
        
        if quiz_id not in self.quiz_questions[course_id]:
            return {"error": "Quiz not found"}
        
        quiz_data = self.quiz_questions[course_id][quiz_id]
        
        # Remove correct answers before sending to frontend
        questions_for_frontend = []
        for question in quiz_data["questions"]:
            question_copy = question.copy()
            question_copy.pop("correct_answer", None)
            questions_for_frontend.append(question_copy)
        
        return {
            "title": quiz_data["title"],
            "questions": questions_for_frontend
        }
    
    def submit_quiz(self, user_id: str, course_id: str, quiz_id: str,
                   answers: List[str], time_taken: int) -> Dict[str, Any]:
        """Submit quiz and calculate score"""
        # Get quiz questions
        if course_id not in self.quiz_questions or quiz_id not in self.quiz_questions[course_id]:
            return {"error": "Quiz not found"}
        
        quiz_data = self.quiz_questions[course_id][quiz_id]
        questions = quiz_data["questions"]
        
        # Validate answers
        validated_answers = []
        correct_count = 0
        
        for i, user_answer in enumerate(answers):
            if i < len(questions):
                question = questions[i]
                correct_answer = question["correct_answer"]
                is_correct = user_answer.lower() == correct_answer.lower()
                
                if is_correct:
                    correct_count += 1
                
                validated_answers.append({
                    "question_id": question["id"],
                    "selected_answer": user_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct
                })
        
        # Calculate score
        total_questions = len(questions)
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        passed = score >= 85
        
        # Save submission to assessment_submissions
        self.assessment_repo.create_submission(
            user_id=user_id,
            course_id=course_id,
            assessment_type='quiz',
            score=score,
            answers=validated_answers
        )
        
        # Update progress
        self.progress_repo.update_quiz_progress(
            user_id=user_id,
            course_id=course_id,
            score=score,
            passed=passed
        )
        
        return {
            "score": score,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "time_taken": time_taken,
            "answers": validated_answers,
            "passed": passed
        }
    
    def get_quiz_attempts(self, user_id: str, course_id: str, quiz_id: str = None) -> List[Dict[str, Any]]:
        """Get quiz attempts for a user"""
        return self.assessment_repo.get_user_submissions(
            user_id=user_id,
            course_id=course_id,
            assessment_type='quiz',
            limit=10
        )
