from pydantic import BaseModel
from typing import Optional, List

class ResearchRequest(BaseModel):
    topic: str
    case_id: Optional[int] = None

class GenerateDocumentRequest(BaseModel):
    document_type: str
    details: str
    case_id: Optional[int] = None

class SummarizeRequest(BaseModel):
    case_id: int
    document_id: int

class ChatRequest(BaseModel):
    case_id: int
    message: str
    history: Optional[List[dict]] = []

class PrepareCaseRequest(BaseModel):
    case_id: int
