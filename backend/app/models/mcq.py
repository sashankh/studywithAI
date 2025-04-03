from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MCQRequest(BaseModel):
    topic: str
    num_questions: int = 4

class MCQResponse(BaseModel):
    topic: str
    questions: List[Dict[str, Any]]

class MCQSubmission(BaseModel):
    questions: List[Dict[str, Any]]
    answers: List[str]

class MCQResult(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: Optional[str] = None

class MCQEvaluation(BaseModel):
    score: int
    total: int
    percentage: float
    results: List[MCQResult]