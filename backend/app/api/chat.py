from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.llm import llm_service
import logging
import traceback

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    """Process a chat message and return a response"""
    try:
        logger.debug(f"Received chat request: {request}")
        user_query = request.message
        
        # First response - "Thinking..."
        thinking_response = ChatResponse(
            message="Thinking...",
            message_type="status",  # New type for status messages
            requires_mcq=False
        )
        
        # Use LLM to detect MCQ intent
        logger.debug("Using LLM to detect if request is for MCQs")
        intent_result = await llm_service.detect_mcq_intent(user_query)
        
        if (intent_result["mcq_expected"] or intent_result["mcq_expected"] == 'true'): # and intent_result["topic"]:
            topic = intent_result["topic"]
            logger.info(f"MCQ request detected for topic: {topic}")
            
            # Second response - "Generating questions..."
            generating_response = ChatResponse(
                message=f"Generating questions on topic {topic}...",
                message_type="status",
                requires_mcq=True,
                mcq_topic=topic
            )
            
            # This will be handled by the mcq router, return a message to redirect
            return ChatResponse(
                message=f"I'll generate some MCQs for you on {topic}.",
                message_type="text",
                requires_mcq=True,
                mcq_topic=topic
            )
        
        # For regular chat messages
        logger.debug("Processing regular chat message")
        try:
            logger.debug("Calling LLM service to generate response")
            response = await llm_service.generate_response(user_query)
            logger.debug(f"LLM response received: {response[:50]}...")  # Log first 50 chars
            return ChatResponse(
                message=response,
                message_type="text",
                requires_mcq=False
            )
        except Exception as e:
            logger.error(f"Error in LLM service: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
    except Exception as e:
        logger.error(f"Unhandled error in process_chat: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")