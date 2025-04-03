from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    message: str
    message_type: str = "text"  # can be "text" or "mcq"
    requires_mcq: bool = False
    mcq_topic: Optional[str] = None