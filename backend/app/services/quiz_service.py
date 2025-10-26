from typing import Dict, List, Any
from datetime import datetime
from app.services.firebase_admin import get_firestore_client

class QuizQuestionsService:
    """Service to manage quiz questions and validate answers"""
    
    def __init__(self):
        # Sample quiz data for data structures course
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
        """Get quiz questions for a specific course and quiz"""
        if course_id not in self.quiz_questions:
            return {"error": "Course not found"}
        
        if quiz_id not in self.quiz_questions[course_id]:
            return {"error": "Quiz not found"}
        
        return self.quiz_questions[course_id][quiz_id]
    
    def validate_quiz_answers(self, course_id: str, quiz_id: str, user_answers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate user answers against correct answers"""
        quiz_data = self.get_quiz_questions(course_id, quiz_id)
        
        if "error" in quiz_data:
            raise Exception(quiz_data["error"])
        
        questions = quiz_data["questions"]
        validated_answers = []
        
        # Create a mapping of question_id to correct answer
        correct_answers = {q["id"]: q["correct_answer"] for q in questions}
        
        print(f"Available questions: {list(correct_answers.keys())}")
        print(f"User answers received: {user_answers}")
        
        for user_answer in user_answers:
            question_id = user_answer.get("question_id")
            selected_answer = user_answer.get("selected_answer", "").strip()
            
            print(f"Processing question {question_id}: user={selected_answer}, correct={correct_answers.get(question_id)}")
            
            if question_id in correct_answers:
                correct_answer = correct_answers[question_id]
                is_correct = selected_answer.lower() == correct_answer.lower() if selected_answer and correct_answer else False
                
                validated_answers.append({
                    "question_id": question_id,
                    "selected_answer": selected_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct,
                    "time_spent": user_answer.get("time_spent", 0)
                })
            else:
                print(f"Warning: Question {question_id} not found in quiz")
        
        print(f"Validated answers: {validated_answers}")
        return validated_answers
    
    def get_all_courses_quizzes(self) -> Dict[str, Any]:
        """Get all available quizzes for all courses"""
        result = {}
        for course_id, course_data in self.quiz_questions.items():
            result[course_id] = {}
            for quiz_id, quiz_data in course_data.items():
                result[course_id][quiz_id] = {
                    "title": quiz_data["title"],
                    "question_count": len(quiz_data["questions"])
                }
        return result


class QuizSubmissionService:
    """Service to handle quiz submissions and scoring"""
    
    def __init__(self):
        self.quiz_service = QuizQuestionsService()
        
    def submit_quiz(self, user_id: str, course_id: str, quiz_id: str, 
                   answers: List[str], time_taken: int) -> Dict[str, Any]:
        """Submit quiz answers and calculate score"""
        try:
            # Get quiz questions
            quiz_data = self.quiz_service.get_quiz_questions(course_id, quiz_id)
            if "error" in quiz_data:
                return {"error": quiz_data["error"]}
            
            questions = quiz_data["questions"]
            
            # Convert letter answers to validation format
            user_answers = []
            for i, answer in enumerate(answers):
                if i < len(questions):
                    user_answers.append({
                        "question_id": questions[i]["id"],
                        "selected_answer": answer,
                        "time_spent": time_taken // len(questions)  # Distribute time evenly
                    })
            
            # Validate answers
            validated = self.quiz_service.validate_quiz_answers(course_id, quiz_id, user_answers)
            
            # Calculate score
            correct_count = sum(1 for answer in validated if answer["is_correct"])
            total_questions = len(questions)
            score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
            
            # Save to Firebase
            attempt_data = {
                "user_id": user_id,
                "course_id": course_id,
                "quiz_id": quiz_id,
                "answers": validated,
                "score": score_percentage,
                "correct_answers": correct_count,
                "total_questions": total_questions,
                "time_taken": time_taken,
                "timestamp": datetime.now().isoformat(),
                "completed": True
            }
            
            # Store in Firestore
            db = get_firestore_client()
            attempts_ref = db.collection("quiz_attempts")
            attempts_ref.add(attempt_data)
            
            # Note: Quiz completion is now handled by simple_progress_service
            # when quiz results are saved via /progress/quiz endpoint
            
            return {
                "score": score_percentage,
                "correct_answers": correct_count,
                "total_questions": total_questions,
                "time_taken": time_taken,
                "answers": validated,
                "passed": score_percentage >= 70  # 70% passing grade
            }
            
        except Exception as e:
            print(f"Error submitting quiz: {str(e)}")
            return {"error": str(e)}
    
    def get_user_quiz_attempts(self, user_id: str, course_id: str = None, quiz_id: str = None) -> List[Dict[str, Any]]:
        """Get all quiz attempts for a user"""
        try:
            db = get_firestore_client()
            query = db.collection("quiz_attempts").where("user_id", "==", user_id)
            
            if course_id:
                query = query.where("course_id", "==", course_id)
            if quiz_id:
                query = query.where("quiz_id", "==", quiz_id)
            
            attempts = query.order_by("timestamp", direction="DESCENDING").stream()
            
            result = []
            for attempt in attempts:
                data = attempt.to_dict()
                data["id"] = attempt.id
                result.append(data)
            
            return result
            
        except Exception as e:
            print(f"Error fetching quiz attempts: {str(e)}")
            return []