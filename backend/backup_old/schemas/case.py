from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class NoteSchema(BaseModel):
    id: int
    content: str
    created_at: datetime
    class Config: from_attributes = True

class DeadlineSchema(BaseModel):
    id: int
    title: str
    due_date: datetime
    completed: bool
    class Config: from_attributes = True

class DocumentSchema(BaseModel):
    id: int
    filename: str
    original_name: str
    uploaded_at: datetime
    class Config: from_attributes = True

class CaseCreate(BaseModel):
    title: str = Field(..., description="Title of the case")
    client_name: str = Field(..., description="Name of the client")
    fir_number: Optional[str] = Field(None, description="FIR Number if applicable")
    case_type: str = Field(..., description="Type of case: criminal or civil")
    description: str = Field(..., description="Description of the case details")

class CaseResponse(BaseModel):
    id: int
    title: str
    client_name: str
    fir_number: Optional[str]
    case_type: str
    status: str
    description: str
    created_at: datetime
    updated_at: Optional[datetime]
    notes: List[NoteSchema] = []
    deadlines: List[DeadlineSchema] = []
    documents: List[DocumentSchema] = []

    class Config:
        from_attributes = True
