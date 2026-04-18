from pydantic import BaseModel
from typing import Optional, List

class CaseCreate(BaseModel):
    title: str
    client_name: str
    fir_number: Optional[str] = None
    case_type: str
    description: Optional[str] = None

class CaseResponse(CaseCreate):
    id: int

    class Config:
        orm_mode = True

class ResearchQuery(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    answer: str
    context_used: List[str]
