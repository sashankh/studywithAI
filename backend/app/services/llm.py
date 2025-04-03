import os
import json
import yaml
import re
from typing import List, Dict, Any, Optional
import openai
import logging
import traceback
from app.utils.prompt_loader import load_prompt
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        logger.debug("Initializing LLM Service")
        openai.api_type = "azure"
        openai.api_key = settings.AZURE_OPENAI_API_KEY
        
        # Ensure the API base has a URL scheme and no trailing slash
        api_base = settings.AZURE_OPENAI_API_BASE
        if api_base:
            # Remove trailing slash if present
            api_base = api_base.rstrip('/')
            
            # Ensure it has a proper URL scheme
            if not api_base.startswith(('http://', 'https://')):
                api_base = f"https://{api_base}"
                
            openai.api_base = api_base
            logger.info(f"Using API base URL: {api_base}")
        else:
            logger.error("AZURE_OPENAI_API_BASE environment variable is not set!")
            
        openai.api_version = settings.AZURE_OPENAI_API_VERSION
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME
        
        # Log API configuration
        logger.info(f"API version: {openai.api_version}")
        logger.info(f"Deployment name: {self.deployment_name}")
        
        # Check if API key is set
        if not settings.AZURE_OPENAI_API_KEY:
            logger.warning("AZURE_OPENAI_API_KEY is not set!")
        
    async def detect_mcq_intent(self, user_query: str) -> Dict[str, Any]:
        """Detect if the user is asking for MCQs and extract the topic"""
        logger.debug(f"Detecting MCQ intent for query: {user_query[:50]}...")
        
        try:
            logger.debug("Loading system and user prompts for MCQ intent detection")
            system_prompt = load_prompt("detect_mcq_intent/system.txt")
            user_prompt = load_prompt("detect_mcq_intent/prompt.txt").format(user_query=user_query)
            
            logger.debug("Calling Azure OpenAI API for MCQ intent detection")
            response = openai.ChatCompletion.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,  # Lower temperature for more deterministic responses
                max_tokens=200
            )
            
            # Get the raw content from the response
            content = response.choices[0].message.content
            logger.debug(f"Raw response content: {content}")
            
            # Manual extraction and parsing of YAML content
            try:
                # First, try to use regex to extract content between markdown code blocks
                cleaned_content = content
                yaml_pattern = r"```(?:yaml)?(.*?)```"
                match = re.search(yaml_pattern, content, re.DOTALL)
                
                if match:
                    # Extract content inside code block
                    cleaned_content = match.group(1).strip()
                    logger.debug(f"Content extracted with regex: {cleaned_content}")
                elif "```" in content:
                    # Fallback: manual string manipulation
                    parts = content.split("```")
                    if len(parts) >= 3:
                        middle_part = parts[1]
                        if middle_part.startswith("yaml"):
                            middle_part = middle_part[4:].strip()
                        cleaned_content = middle_part.strip()
                    else:
                        cleaned_content = content.replace("```yaml", "").replace("```", "").strip()
                
                logger.debug(f"Cleaned content: {cleaned_content}")
                
                # Replace string boolean values with Python booleans
                cleaned_content = cleaned_content.replace("true", "True").replace("false", "False")
                
                # Manual parsing of YAML content as fallback
                if "mcq_expected:" in cleaned_content and "topic:" in cleaned_content:
                    lines = cleaned_content.strip().split("\n")
                    mcq_expected = False
                    topic = ""
                    
                    for line in lines:
                        line = line.strip()
                        if line.startswith("mcq_expected:"):
                            value = line.split("mcq_expected:")[1].strip().lower()
                            mcq_expected = (value in ["true", "yes", "1"])
                        elif line.startswith("topic:"):
                            topic = line.split("topic:")[1].strip()
                            # Remove any quotes around the topic
                            if topic.startswith('"') and topic.endswith('"'):
                                topic = topic[1:-1]
                            elif topic.startswith("'") and topic.endswith("'"):
                                topic = topic[1:-1]
                    
                    logger.debug(f"Manual parsing result: mcq_expected={mcq_expected}, topic={topic}")
                    return {
                        "mcq_expected": mcq_expected, 
                        "topic": topic
                    }
                else:
                    # If can't manually parse, try using PyYAML
                    result = yaml.safe_load(cleaned_content)
                    logger.debug(f"YAML parsing result: {result}")
                    
                    # Convert string booleans to actual booleans
                    mcq_expected = result.get("mcq_expected", False)
                    if isinstance(mcq_expected, str):
                        mcq_expected = mcq_expected.lower() in ["true", "yes", "1"]
                        
                    return {
                        "mcq_expected": mcq_expected,
                        "topic": result.get("topic", "")
                    }
            except Exception as yaml_error:
                logger.error(f"Error parsing YAML response: {str(yaml_error)}")
                logger.error(traceback.format_exc())
                # Hard-coded detection as last resort
                if "true" in content.lower() and any(keyword in content.lower() for keyword in ["javascript", "python", "physics"]):
                    # Extract potential topics
                    potential_topics = re.findall(r"topic:\s*([A-Za-z0-9 ]+)", content)
                    topic = potential_topics[0] if potential_topics else ""
                    logger.debug(f"Hard-coded detection: topic={topic}")
                    return {"mcq_expected": True, "topic": topic}
                    
            # Default to no MCQ intent if all parsing methods fail
            return {"mcq_expected": False, "topic": ""}
            
        except Exception as e:
            logger.error(f"Error detecting MCQ intent: {str(e)}")
            logger.error(traceback.format_exc())
            # Return default response in case of error
            return {"mcq_expected": False, "topic": ""}
    
    async def generate_response(self, user_query: str) -> str:
        """Generate a simple response to user query"""
        logger.debug(f"Generating response for query: {user_query[:50]}...")
        
        try:
            logger.debug("Loading system and user prompts")
            system_prompt = load_prompt("simple_request/system.txt")
            user_prompt = load_prompt("simple_request/prompt.txt").format(user_query=user_query)
            
            logger.debug("Calling Azure OpenAI API")
            response = openai.ChatCompletion.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=800,
            )
            
            logger.debug("Processing API response")
            content = response.choices[0].message.content
            logger.debug(f"Response content (first 50 chars): {content[:50]}...")
            return content
            
        except Exception as e:
            logger.error(f"Error in generate_response: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    async def generate_mcqs(self, topic: str, num_questions: int = 4) -> List[Dict[str, Any]]:
        """Generate MCQs for a given topic"""
        logger.debug(f"Generating {num_questions} MCQs for topic: {topic}")
        
        try:
            logger.debug("Loading system and user prompts for MCQ generation")
            system_prompt = load_prompt("formulate_mcqs/system.txt")
            user_prompt = load_prompt("formulate_mcqs/prompt.txt").format(
                topic=topic, 
                num_questions=num_questions
            )
            
            logger.debug(f"System prompt (first 50 chars): {system_prompt[:50]}...")
            logger.debug(f"User prompt (first 50 chars): {user_prompt[:50]}...")
            
            logger.debug("Calling Azure OpenAI API for MCQ generation")
            response = openai.ChatCompletion.create(
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # Parse the JSON response
            logger.debug("Processing API response for MCQ generation")
            content = response.choices[0].message.content
            logger.debug(f"Raw response content (first 100 chars): {content[:100]}...")
            
            # Try to extract JSON from the response
            content = content.strip()
            # If the response contains markdown code blocks, extract the JSON content
            if "```json" in content:
                logger.debug("Extracting JSON from markdown code block with json annotation")
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                logger.debug("Extracting JSON from markdown code block")
                content = content.split("```")[1].split("```")[0].strip()
                
            logger.debug(f"Cleaned content (first 100 chars): {content[:100]}...")
            logger.debug("Parsing JSON content")
            mcqs = json.loads(content)
            questions = mcqs.get("questions", [])
            logger.info(f"Successfully generated {len(questions)} MCQs")
            return questions
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Response content causing JSON error: {content}")
            raise Exception(f"Failed to parse LLM response as JSON: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating MCQs: {str(e)}")
            logger.error(traceback.format_exc())
            raise
            
    async def evaluate_mcqs(self, questions: List[Dict], user_answers: List[str]) -> Dict:
        """Evaluate user's MCQ answers"""
        logger.debug(f"Evaluating {len(questions)} MCQs with {len(user_answers)} user answers")
        
        try:
            correct_count = 0
            results = []
            
            for i, question in enumerate(questions):
                is_correct = user_answers[i] == question["correct_answer"]
                logger.debug(f"Q{i+1}: User answer: {user_answers[i]}, Correct: {question['correct_answer']}, Result: {is_correct}")
                
                if is_correct:
                    correct_count += 1
                    
                results.append({
                    "question": question["question"],
                    "user_answer": user_answers[i],
                    "correct_answer": question["correct_answer"],
                    "is_correct": is_correct,
                    "explanation": question.get("explanation", "")
                })
                
            evaluation_result = {
                "score": correct_count,
                "total": len(questions),
                "percentage": (correct_count / len(questions)) * 100 if questions else 0,
                "results": results
            }
            
            logger.info(f"Evaluation complete. Score: {correct_count}/{len(questions)} ({evaluation_result['percentage']:.2f}%)")
            return evaluation_result
            
        except Exception as e:
            logger.error(f"Error evaluating MCQs: {str(e)}")
            logger.error(traceback.format_exc())
            raise

llm_service = LLMService()