from pydantic import BaseModel
from typing import Optional

class CaseCreate(BaseModel):
    case_name: str
    description: Optional[str] = ""

class ChatMessage(BaseModel):
    case_id: str
    message: str
