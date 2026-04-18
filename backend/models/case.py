from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# --- Case Sub-models ---

class NoteModel(BaseModel):
    id: str = ""
    content: str
    created_at: datetime = None


class DeadlineModel(BaseModel):
    id: str = ""
    title: str
    due_date: str  # ISO date string from frontend
    completed: bool = False


class DocumentModel(BaseModel):
    id: str = ""
    filename: str = ""
    original_name: str = ""
    uploaded_at: datetime = None


# --- Case Create / Response ---

class CaseCreate(BaseModel):
    title: str
    client_name: str
    case_type: str = "General"
    status: str = "Active"
    description: str = ""


class CaseResponse(BaseModel):
    id: str = Field(alias="_id", default="")
    title: str = ""
    client_name: str = ""
    case_type: str = ""
    status: str = ""
    description: str = ""
    created_at: datetime = None
    updated_at: datetime = None
    notes: List[NoteModel] = []
    deadlines: List[DeadlineModel] = []
    documents: List[DocumentModel] = []

    class Config:
        populate_by_name = True


# --- AI Request Models ---

class ResearchRequest(BaseModel):
    topic: str
    case_id: Optional[str] = None


class GenerateDocumentRequest(BaseModel):
    document_type: str  # e.g. "Legal Notice", "Affidavit", "Contract"
    details: str
    case_id: Optional[str] = None


class SummarizeRequest(BaseModel):
    case_id: str
    document_id: str


class ChatRequest(BaseModel):
    case_id: str
    message: str
    history: List[dict] = []


class PrepareCaseRequest(BaseModel):
    case_id: str
