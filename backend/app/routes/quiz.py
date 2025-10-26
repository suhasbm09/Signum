from fastapi import APIRouter, HTTPException
from app.services.quiz_service import QuizQuestionsService, QuizSubmissionService
from pydantic import BaseModel
from typing import Dict, Any, List

class QuizSubmission(BaseModel):
    user_id: str
    course_id: str
    quiz_id: str
    answers: List[str]
    score: int
    total_questions: int
    time_taken: int

router = APIRouter()

def get_quiz_service():
    return QuizQuestionsService()

@router.get("/quiz/{course_id}/{quiz_id}")
async def get_quiz_questions(course_id: str, quiz_id: str):
    """Get quiz questions for a specific course and quiz"""
    try:
        quiz_service = get_quiz_service()
        quiz_data = quiz_service.get_quiz_questions(course_id, quiz_id)
        
        if "error" in quiz_data:
            raise HTTPException(status_code=404, detail=quiz_data["error"])
        
        # Don't send correct answers to frontend
        questions_for_frontend = []
        for question in quiz_data["questions"]:
            question_copy = question.copy()
            question_copy.pop("correct_answer", None)  # Remove correct answer
            questions_for_frontend.append(question_copy)
        
        return {
            "success": True,
            "data": {
                "title": quiz_data["title"],
                "questions": questions_for_frontend
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quizzes")
async def get_all_quizzes():
    """Get all available quizzes across all courses"""
    try:
        quiz_service = get_quiz_service()
        quizzes = quiz_service.get_all_courses_quizzes()
        
        return {
            "success": True,
            "data": quizzes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/course/{course_id}/quizzes")
async def get_course_quizzes(course_id: str):
    """Get all quizzes for a specific course"""
    try:
        quiz_service = get_quiz_service()
        all_quizzes = quiz_service.get_all_courses_quizzes()
        
        if course_id not in all_quizzes:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return {
            "success": True,
            "data": all_quizzes[course_id]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    """Submit quiz answers and get results"""
    try:
        quiz_service = QuizSubmissionService()
        result = quiz_service.submit_quiz(
            user_id=submission.user_id,
            course_id=submission.course_id,
            quiz_id=submission.quiz_id,
            answers=submission.answers,
            time_taken=submission.time_taken
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quiz/{course_id}/{quiz_id}/attempts/{user_id}")
async def get_quiz_attempts(course_id: str, quiz_id: str, user_id: str):
    """Get all quiz attempts for a specific user"""
    try:
        quiz_service = QuizSubmissionService()
        attempts = quiz_service.get_user_quiz_attempts(user_id, course_id, quiz_id)
        
        return {
            "success": True,
            "data": attempts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))