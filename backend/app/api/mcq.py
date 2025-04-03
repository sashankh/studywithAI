from fastapi import APIRouter, HTTPException
from app.models.mcq import MCQRequest, MCQResponse, MCQSubmission, MCQEvaluation
from app.services.llm import llm_service

router = APIRouter()

@router.post("/mcq/generate", response_model=MCQResponse)
async def generate_mcqs(request: MCQRequest):
    """Generate MCQs for a given topic"""
    try:
        questions = await llm_service.generate_mcqs(
            topic=request.topic,
            num_questions=request.num_questions
        )
        
        return MCQResponse(
            topic=request.topic,
            questions=questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating MCQs: {str(e)}")

@router.post("/mcq/evaluate", response_model=MCQEvaluation)
async def evaluate_mcqs(submission: MCQSubmission):
    """Evaluate submitted MCQ answers"""
    try:
        evaluation = await llm_service.evaluate_mcqs(
            questions=submission.questions,
            user_answers=submission.answers
        )
        
        return MCQEvaluation(**evaluation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating MCQs: {str(e)}")