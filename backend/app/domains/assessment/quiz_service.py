"""
Quiz service - handles quiz questions and submissions with SERVER-SIDE scoring
Similar architecture to coding_evaluation_service for security
"""
from typing import Dict, List, Any
from datetime import datetime, timezone, timedelta
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.progress_repository import ProgressRepository
import uuid
import random

class QuizService:
    """Service for quiz management with server-side scoring"""
    
    def __init__(self):
        self.assessment_repo = AssessmentRepository()
        self.progress_repo = ProgressRepository()
        
        # Active quiz sessions (in production, use Redis or database)
        # Maps session_id -> {user_id, course_id, questions, start_time, expires_at}
        self.active_sessions = {}
        
        # Quiz time limit in seconds (15 minutes)
        self.QUIZ_TIME_LIMIT = 900
        
        # Question bank - stored server-side for security
        # Each question has: id, topic, difficulty, question, options, correct (index 0-3), explanation
        self.QUESTION_BANK = {
            "data-structures": [
                # Arrays (1D) Questions
                {
                    "id": 1, "topic": "Arrays (1D)", "difficulty": "Medium",
                    "question": "What is the time complexity of accessing an element in an array by index?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                    "correct": 0,
                    "explanation": "Array elements can be directly accessed using their index in constant time O(1) because arrays provide random access."
                },
                {
                    "id": 2, "topic": "Arrays (1D)", "difficulty": "Medium",
                    "question": "Given an array [5, 2, 8, 1, 9], what will be the result after one pass of bubble sort?",
                    "options": ["[2, 5, 1, 8, 9]", "[2, 5, 8, 1, 9]", "[5, 2, 1, 8, 9]", "[1, 2, 5, 8, 9]"],
                    "correct": 0,
                    "explanation": "After one pass of bubble sort, adjacent elements are compared and swapped if needed, moving the largest element to the end."
                },
                {
                    "id": 3, "topic": "Arrays (1D)", "difficulty": "High",
                    "question": "What is the time complexity of the two-pointer approach for finding two numbers that sum to target in a sorted array?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                    "correct": 2,
                    "explanation": "Two-pointer technique traverses the array once, making it O(n) time complexity with O(1) space."
                },
                {
                    "id": 18, "topic": "Arrays (1D)", "difficulty": "High",
                    "question": "What is the optimal time complexity for finding the kth largest element in an unsorted array?",
                    "options": ["O(n log n)", "O(n log k)", "O(n)", "O(k log n)"],
                    "correct": 2,
                    "explanation": "Using Quickselect algorithm (similar to quicksort partition), we can find kth largest in average O(n) time."
                },
                # Arrays (2D) Questions
                {
                    "id": 4, "topic": "Arrays (2D)", "difficulty": "Medium",
                    "question": "What is the correct way to traverse a 2D array row by row?",
                    "options": [
                        "Outer loop for columns, inner loop for rows",
                        "Outer loop for rows, inner loop for columns", 
                        "Single loop with row × column iterations",
                        "Random access with single index"
                    ],
                    "correct": 1,
                    "explanation": "Row-major traversal uses outer loop for rows (i) and inner loop for columns (j), accessing elements as arr[i][j]."
                },
                {
                    "id": 5, "topic": "Arrays (2D)", "difficulty": "High",
                    "question": "What is the space complexity of storing an m×n matrix?",
                    "options": ["O(1)", "O(m)", "O(n)", "O(m×n)"],
                    "correct": 3,
                    "explanation": "A 2D matrix with m rows and n columns requires m×n memory locations, hence O(m×n) space."
                },
                {
                    "id": 6, "topic": "Arrays (2D)", "difficulty": "High",
                    "question": "In matrix multiplication A[m×k] * B[k×n], what is the time complexity?",
                    "options": ["O(m×n)", "O(m×k)", "O(m×n×k)", "O(m²×n²)"],
                    "correct": 2,
                    "explanation": "Three nested loops running m, n, and k times respectively give O(m×n×k) complexity."
                },
                # Stacks Questions
                {
                    "id": 7, "topic": "Stacks", "difficulty": "Medium",
                    "question": "Which principle does a stack follow?",
                    "options": ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Random Access", "Priority Based"],
                    "correct": 1,
                    "explanation": "Stack follows LIFO principle - the last element pushed is the first one to be popped."
                },
                {
                    "id": 8, "topic": "Stacks", "difficulty": "Medium",
                    "question": "What happens when you try to pop from an empty stack?",
                    "options": ["Returns null", "Returns 0", "Stack underflow", "Creates new element"],
                    "correct": 2,
                    "explanation": "Attempting to pop from an empty stack results in stack underflow error."
                },
                {
                    "id": 9, "topic": "Stacks", "difficulty": "High",
                    "question": "What will be the values popped in order for: Push(1), Push(2), Pop(), Push(3), Pop(), Pop()?",
                    "options": ["1, 2, 3", "2, 3, 1", "3, 2, 1", "1, 3, 2"],
                    "correct": 1,
                    "explanation": "Following LIFO: Pop() returns 2, then Pop() returns 3, finally Pop() returns 1."
                },
                {
                    "id": 19, "topic": "Stacks", "difficulty": "High",
                    "question": "Which data structure is used to implement function call management in programming languages?",
                    "options": ["Queue", "Stack", "Array", "Linked List"],
                    "correct": 1,
                    "explanation": "Call stack is used for function calls - when a function is called, it's pushed onto stack, and popped when it returns (LIFO behavior)."
                },
                # Queues Questions
                {
                    "id": 10, "topic": "Queues", "difficulty": "Medium",
                    "question": "Which principle does a queue follow?",
                    "options": ["LIFO (Last In First Out)", "FIFO (First In First Out)", "Random Access", "Priority Based"],
                    "correct": 1,
                    "explanation": "Queue follows FIFO principle - first element added is the first one to be removed."
                },
                {
                    "id": 11, "topic": "Queues", "difficulty": "Medium",
                    "question": "In a circular queue with size n, how many elements can be stored?",
                    "options": ["n", "n-1", "n+1", "2n"],
                    "correct": 1,
                    "explanation": "In circular queue implementation, one position is kept empty to distinguish between full and empty states, so n-1 elements can be stored."
                },
                {
                    "id": 12, "topic": "Queues", "difficulty": "High",
                    "question": "What is the time complexity of both enqueue and dequeue operations in a queue implemented using arrays?",
                    "options": ["O(1) for both", "O(n) for both", "O(1) enqueue, O(n) dequeue", "O(n) enqueue, O(1) dequeue"],
                    "correct": 0,
                    "explanation": "Both operations just update pointers and access array elements directly, making them O(1)."
                },
                # Trees Questions
                {
                    "id": 13, "topic": "Trees", "difficulty": "Medium",
                    "question": "What is the maximum number of nodes in a binary tree of height h?",
                    "options": ["h", "2h", "2^h - 1", "2^(h+1) - 1"],
                    "correct": 3,
                    "explanation": "A complete binary tree of height h has 2^(h+1) - 1 nodes total (levels 0 to h)."
                },
                {
                    "id": 14, "topic": "Trees", "difficulty": "Medium",
                    "question": "In which tree traversal do we visit the root node first?",
                    "options": ["Inorder", "Preorder", "Postorder", "Level order"],
                    "correct": 1,
                    "explanation": "Preorder traversal visits nodes in the order: Root → Left → Right."
                },
                {
                    "id": 15, "topic": "Trees", "difficulty": "High",
                    "question": "What will be the inorder traversal of BST with Root(4), Left(2), Right(6), 2->Left(1), 2->Right(3), 6->Left(5), 6->Right(7)?",
                    "options": ["4 2 1 3 6 5 7", "1 2 3 4 5 6 7", "1 3 2 5 7 6 4", "4 6 2 7 5 3 1"],
                    "correct": 1,
                    "explanation": "Inorder traversal of BST always gives sorted order: 1 2 3 4 5 6 7."
                },
                {
                    "id": 16, "topic": "Trees", "difficulty": "High",
                    "question": "What is the time complexity of searching in a balanced binary search tree?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                    "correct": 1,
                    "explanation": "In a balanced BST, the height is O(log n), so search takes O(log n) time."
                },
                {
                    "id": 17, "topic": "Trees", "difficulty": "High",
                    "question": "What is the height of a complete binary tree with n nodes?",
                    "options": ["⌊log₂(n)⌋", "⌈log₂(n)⌉", "⌊log₂(n+1)⌋", "⌈log₂(n+1)⌉"],
                    "correct": 2,
                    "explanation": "Height of complete binary tree with n nodes is ⌊log₂(n+1)⌋."
                },
                {
                    "id": 20, "topic": "Trees", "difficulty": "High",
                    "question": "In a binary heap (max-heap), what is the relationship between parent and child nodes?",
                    "options": ["Parent < Child", "Parent > Child", "Parent = Child", "No fixed relationship"],
                    "correct": 1,
                    "explanation": "In max-heap, parent node is always greater than or equal to its children, ensuring maximum element is at root."
                }
            ]
        }
    
    def start_quiz_session(self, user_id: str, course_id: str, num_questions: int = 10) -> Dict[str, Any]:
        """
        Start a new quiz session - generates questions and returns them WITHOUT answers
        Returns session_id that must be used for submission
        """
        if course_id not in self.QUESTION_BANK:
            return {"error": "Course not found", "success": False}
        
        # Select random questions
        all_questions = self.QUESTION_BANK[course_id]
        selected = random.sample(all_questions, min(num_questions, len(all_questions)))
        
        # Create session
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=self.QUIZ_TIME_LIMIT)
        
        # Store session with full question data (including correct answers)
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "course_id": course_id,
            "questions": selected,  # Full questions with answers
            "start_time": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "time_limit": self.QUIZ_TIME_LIMIT
        }
        
        # Prepare questions for frontend (WITHOUT correct answers)
        questions_for_frontend = []
        for q in selected:
            questions_for_frontend.append({
                "id": q["id"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "options": q["options"]
                # NO correct answer or explanation sent!
            })
        
        return {
            "success": True,
            "session_id": session_id,
            "questions": questions_for_frontend,
            "time_limit": self.QUIZ_TIME_LIMIT,
            "start_time": now.isoformat(),
            "expires_at": expires_at.isoformat()
        }
    
    def submit_quiz(self, user_id: str, session_id: str, 
                   answers: Dict[int, int],  # {question_id: selected_option_index}
                   anti_cheat_data: Dict = None) -> Dict[str, Any]:
        """
        Submit quiz for SERVER-SIDE scoring
        
        Args:
            user_id: User ID
            session_id: Quiz session ID from start_quiz_session
            answers: Dict mapping question_id to selected option index (0-3)
            anti_cheat_data: Violation data for penalty calculation
            
        Returns:
            {success, score, results, time_taken, feedback, etc.}
        """
        # Validate session exists
        if session_id not in self.active_sessions:
            return {"success": False, "error": "Invalid or expired session"}
        
        session = self.active_sessions[session_id]
        
        # Validate user
        if session["user_id"] != user_id:
            return {"success": False, "error": "Session does not belong to this user"}
        
        # Check if expired (allow 30 second grace period for network latency)
        now = datetime.now(timezone.utc)
        expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
        grace_period = timedelta(seconds=30)
        
        if now > expires_at + grace_period:
            # Remove expired session
            del self.active_sessions[session_id]
            return {"success": False, "error": "Quiz session expired"}
        
        # Calculate time taken
        start_time = datetime.fromisoformat(session["start_time"].replace('Z', '+00:00'))
        time_taken_seconds = (now - start_time).total_seconds()
        
        # Score the quiz SERVER-SIDE
        questions = session["questions"]
        results = []
        correct_count = 0
        difficulty_bonus = 0
        
        for question in questions:
            q_id = question["id"]
            user_answer = answers.get(q_id)  # Index 0-3 or None
            is_correct = user_answer == question["correct"]
            
            if is_correct:
                correct_count += 1
                # Bonus for hard questions
                if question["difficulty"] == "High":
                    difficulty_bonus += 2
                else:
                    difficulty_bonus += 1
            
            results.append({
                "question_id": q_id,
                "question": question["question"],
                "topic": question["topic"],
                "difficulty": question["difficulty"],
                "options": question["options"],
                "user_answer": user_answer,
                "correct_answer": question["correct"],
                "is_correct": is_correct,
                "explanation": question["explanation"]
            })
        
        # Calculate score using the same formula as frontend
        total_questions = len(questions)
        base_score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        # Bonus points
        bonus_points = 0
        if correct_count == total_questions:
            bonus_points = 15  # Perfect score
        elif correct_count >= total_questions * 0.8:
            bonus_points = 10  # 80%+
        elif correct_count >= total_questions * 0.7:
            bonus_points = 5   # 70%+
        
        # Time bonus (if completed with time remaining)
        time_remaining = self.QUIZ_TIME_LIMIT - time_taken_seconds
        time_bonus = 3 if time_remaining > 300 else (1 if time_remaining > 60 else 0)
        
        # Calculate anti-cheat penalty
        anti_cheat_penalty = self._calculate_anti_cheat_penalty(anti_cheat_data)
        
        # Final score (cap at 100)
        raw_score = base_score + bonus_points + time_bonus + (difficulty_bonus * 0.5)
        final_score = max(0, min(100, round(raw_score - anti_cheat_penalty)))
        
        passed = final_score >= 85  # NFT eligibility threshold
        course_id = session["course_id"]
        
        # Save submission to database
        self.assessment_repo.create_submission(
            user_id=user_id,
            course_id=course_id,
            assessment_type='quiz',
            score=final_score,
            answers=results
        )
        
        # Update progress
        self.progress_repo.update_quiz_progress(
            user_id=user_id,
            course_id=course_id,
            score=final_score,
            passed=passed
        )
        
        # Clean up session
        del self.active_sessions[session_id]
        
        # Generate feedback
        feedback = self._generate_feedback(correct_count, total_questions, final_score, 
                                          anti_cheat_penalty, time_taken_seconds)
        
        return {
            "success": True,
            "score": final_score,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "results": results,  # Full results with correct answers for review
            "breakdown": {
                "base_score": round(base_score),
                "bonus_points": bonus_points,
                "time_bonus": time_bonus,
                "difficulty_bonus": round(difficulty_bonus * 0.5),
                "anti_cheat_penalty": anti_cheat_penalty
            },
            "time_taken": round(time_taken_seconds),
            "passed": passed,
            "feedback": feedback
        }
    
    def _calculate_anti_cheat_penalty(self, anti_cheat_data: Dict) -> float:
        """Calculate score penalty based on anti-cheat violations (same as coding)"""
        if not anti_cheat_data:
            return 0
        
        penalty = 0
        
        # Tab switches: -2% per switch, max -20%
        tab_switches = anti_cheat_data.get('tab_switches', 0)
        penalty += min(tab_switches * 2, 20)
        
        # Copy attempts: -5% per attempt, max -30%
        copy_attempts = anti_cheat_data.get('copy_attempts', 0)
        penalty += min(copy_attempts * 5, 30)
        
        # Paste attempts: -10% per attempt, max -40%
        paste_attempts = anti_cheat_data.get('paste_attempts', 0)
        penalty += min(paste_attempts * 10, 40)
        
        return min(penalty, 50)  # Max 50% penalty
    
    def _generate_feedback(self, correct: int, total: int, score: float, 
                          penalty: float, time_taken: float) -> str:
        """Generate feedback message"""
        feedback_parts = []
        
        feedback_parts.append(f"Questions: {correct}/{total} correct")
        feedback_parts.append(f"Time taken: {int(time_taken // 60)}m {int(time_taken % 60)}s")
        
        if penalty > 0:
            feedback_parts.append(f"⚠ Anti-cheat penalty: -{penalty}%")
        
        feedback_parts.append(f"Final Score: {score}%")
        
        if score >= 95:
            feedback_parts.append("🏆 Perfect! Outstanding performance!")
        elif score >= 85:
            feedback_parts.append("🎖️ Excellent! NFT Certificate Eligible!")
        elif score >= 70:
            feedback_parts.append("👍 Good job! Keep practicing!")
        elif score >= 50:
            feedback_parts.append("📚 Passing! Review and try again for better score!")
        else:
            feedback_parts.append("💪 Keep learning! You can do better!")
        
        return '\n'.join(feedback_parts)
    
    def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Check if a session is still valid and get time remaining"""
        if session_id not in self.active_sessions:
            return {"valid": False, "error": "Session not found or expired"}
        
        session = self.active_sessions[session_id]
        now = datetime.now(timezone.utc)
        expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
        
        if now > expires_at:
            del self.active_sessions[session_id]
            return {"valid": False, "error": "Session expired"}
        
        time_remaining = (expires_at - now).total_seconds()
        
        return {
            "valid": True,
            "time_remaining": int(time_remaining),
            "start_time": session["start_time"],
            "expires_at": session["expires_at"]
        }
    
    def get_quiz_attempts(self, user_id: str, course_id: str) -> List[Dict[str, Any]]:
        """Get quiz attempts for a user"""
        return self.assessment_repo.get_user_submissions(
            user_id=user_id,
            course_id=course_id,
            assessment_type='quiz',
            limit=10
        )
