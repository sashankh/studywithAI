from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.models.chat import ChatRequest, ChatResponse
from app.models.mcq import MCQResponse
from app.services.llm import llm_service
import logging
import traceback

logger = logging.getLogger(__name__)
# Define router with a prefix tag
router = APIRouter(tags=["chat"])

@router.post("/chat", response_model=None)
async def process_chat(request: ChatRequest):
    """Process a chat message and return a response or MCQs"""
    try:
        logger.debug(f"Received chat request: {request}")
        user_query = request.message
        
        # Use LLM to detect MCQ intent
        logger.debug("Using LLM to detect if request is for MCQs")
        intent_result = await llm_service.detect_mcq_intent(user_query)
        
        if (intent_result["mcq_expected"] or intent_result["mcq_expected"] == 'true'):
            topic = intent_result["topic"]
            logger.info(f"MCQ request detected for topic: {topic}")
            
            # Get number of questions from intent response
            num_questions = 4  # Default
            if "num_questions" in intent_result:
                try:
                    extracted_num = int(intent_result["num_questions"])
                    # Limit to a reasonable range
                    num_questions = max(1, min(extracted_num, 10))
                    logger.debug(f"Extracted request for {num_questions} questions from intent detection")
                except (ValueError, TypeError):
                    logger.debug(f"Could not convert num_questions to int: {intent_result['num_questions']}, using default")
            
            try:
                # Generate MCQs directly
                questions = await llm_service.generate_mcqs(
                    topic=topic,
                    num_questions=num_questions
                )
                
                response_data = MCQResponse(
                    topic=topic,
                    questions=questions
                )
                
                # Return with explicit CORS headers
                return create_cors_response(response_data.dict())
                
            except Exception as e:
                logger.error(f"Error generating MCQs: {str(e)}")
                logger.exception("Full exception traceback:")
                
                # Fallback to a text response
                response_data = ChatResponse(
                    message=f"I'm sorry, I had trouble generating MCQs on {topic}. {str(e)}",
                    message_type="text",
                    requires_mcq=False
                )
                return create_cors_response(response_data.dict())
        
        # For regular chat messages
        logger.debug("Processing regular chat message")
        try:
            logger.debug("Calling LLM service to generate response")
            response = await llm_service.generate_response(user_query)
            logger.debug(f"LLM response received: {response[:50]}...")  # Log first 50 chars
            
            response_data = ChatResponse(
                message=response,
                message_type="text",
                requires_mcq=False
            )
            
            # Return with explicit CORS headers
            return create_cors_response(response_data.dict())
            
        except Exception as e:
            logger.error(f"Error in LLM service: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
    except Exception as e:
        logger.error(f"Unhandled error in process_chat: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

# Helper function to create a response with CORS headers
def create_cors_response(content):
    response = JSONResponse(content=content)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Add OPTIONS handler for CORS preflight requests
@router.options("/chat")
async def options_chat():
    response = JSONResponse(content={})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response