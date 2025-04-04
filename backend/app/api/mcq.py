from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.models.mcq import MCQRequest, MCQResponse, MCQSubmission, MCQEvaluation
from app.services.llm import llm_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/mcq/generate", response_model=MCQResponse)
async def generate_mcqs(request: MCQRequest):
    """Generate MCQs for a given topic"""
    try:
        logger.info(f"MCQ generation request received for topic: {request.topic}")
        logger.info(f"Requesting {request.num_questions} questions")
        
        questions = await llm_service.generate_mcqs(
            topic=request.topic,
            num_questions=request.num_questions
        )
        
        logger.info(f"Successfully generated {len(questions)} MCQs")
        
        response_data = MCQResponse(
            topic=request.topic,
            questions=questions
        )
        
        # Return with explicit CORS headers
        return create_cors_response(response_data.dict())
    except Exception as e:
        logger.error(f"Error generating MCQs: {str(e)}")
        logger.exception("Full exception traceback:")
        # Return a more detailed error message
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Error generating MCQs: {str(e)}",
                "type": str(type(e).__name__),
                "detail": "Check server logs for more information"
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

@router.post("/mcq/evaluate", response_model=MCQEvaluation)
async def evaluate_mcqs(submission: MCQSubmission):
    """Evaluate submitted MCQ answers"""
    try:
        evaluation = await llm_service.evaluate_mcqs(
            questions=submission.questions,
            user_answers=submission.answers
        )
        
        response_data = MCQEvaluation(**evaluation)
        
        # Return with explicit CORS headers
        return create_cors_response(response_data.dict())
    except Exception as e:
        logger.error(f"Error evaluating MCQs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error evaluating MCQs: {str(e)}")

# Helper function to create a response with CORS headers
def create_cors_response(content):
    response = JSONResponse(content=content)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Add OPTIONS handlers for CORS preflight requests
@router.options("/mcq/generate")
async def options_generate():
    response = JSONResponse(content={})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@router.options("/mcq/evaluate")
async def options_evaluate():
    response = JSONResponse(content={})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response