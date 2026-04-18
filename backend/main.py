import os
import json
import logging
import sys
from uuid import uuid4
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory and parent to path for imports
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.append(PROJECT_ROOT)
sys.path.append(BACKEND_DIR)

from src.core.agent import LegalRagAgent, QuestionProcessingError
from src.storage.database_manager import DatabaseManager

# Initialize FastAPI application
app = FastAPI(
    title="Legal RAG Pipeline API",
    description="Backend API for the Legal Workflow Agent with RAG intelligence.",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route for root redirect to Swagger
from fastapi.responses import RedirectResponse

@app.get("/")
async def root():
    """Redirect root to Swagger documentation."""
    return RedirectResponse(url="/docs")

# Try to mount frontend if build exists
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# Global instances
agent: Optional[LegalRagAgent] = None
db_manager: Optional[DatabaseManager] = None
message_count = 0
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.doc', '.docx'}

# Pydantic Models for Requests
class ModelInitRequest(BaseModel):
    model_name: Optional[str] = None

class QuestionRequest(BaseModel):
    question: str

class CaseCreateRequest(BaseModel):
    name: str
    jurisdiction_code: Optional[str] = "oncj"
    fir_no: Optional[str] = None
    case_type: Optional[str] = "General"
    notes: Optional[str] = ""

class CaseLoadRequest(BaseModel):
    case_id: str
    case_name: Optional[str] = ""

# API Status Helper
def api_status():
    return {
        "status": "ok",
        "framework": "FastAPI",
        "swagger": "/api/docs",
        "endpoints": {
            "health": "/api/health",
            "initialize": "/api/initialize_agent",
            "cases": "/api/get_cases",
            "chat": "/api/ask_question"
        }
    }

@app.get("/api/health", tags=["System"])
async def health():
    return api_status()

@app.get("/api/welcome", tags=["System"])
async def welcome():
    """Flowchart Node 1: Welcome Screen Intro"""
    if not agent: return {"message": "Legal Assistant ready."}
    return {"message": agent.get_welcome_response()}

@app.post("/api/generate_draft", tags=["AI & Chat"])
async def generate_draft(req: dict):
    """Flowchart Node 4: Generate Draft notice/petition"""
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    draft_type = req.get("draft_type", "Legal Notice")
    details = req.get("details", "")
    try:
        draft = agent.generate_legal_draft(draft_type, details)
        return {"success": True, "draft": draft}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get_highlights", tags=["AI & Chat"])
async def get_highlights(req: dict):
    """Flowchart Node 3: Metadata highlighting for Scanned Docs"""
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    question = req.get("question", "summary")
    try:
        highlights = agent.get_highlighted_sources(question)
        return {"success": True, "highlights": highlights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/initialize_agent", tags=["System"])
async def initialize_agent(req: ModelInitRequest):
    global agent, db_manager
    model_name = req.model_name or os.getenv('OPENAI_MODEL_NAME') or 'gemma3:4b'
    
    if agent:
        if agent.set_llm(model_name):
            return {"success": True, "message": f"Agent re-initialized with {model_name}"}
        raise HTTPException(status_code=500, detail="Model update failed")
        
    try:
        db_url = os.getenv('DATABASE_URL')
        vector_store_dir = os.getenv('VECTOR_STORE_DIR') or os.getenv('FAISS_INDEX_PATH') or 'app_data/vector_db'
        os.makedirs(vector_store_dir, exist_ok=True)
            
        db_manager = DatabaseManager(root_vector_db_dir=vector_store_dir, mongo_uri=db_url)
        agent = LegalRagAgent(db_manager, model_name=model_name)
        
        return {"success": True, "message": f"Legal RAG Agent initialized with {model_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/stats", tags=["Dashboard"])
async def get_dashboard_stats():
    """Centralized dashboard stats: total, active, and deadlines."""
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    try:
        cases = agent.database_manager.get_cases_by_name("")
        total = len(cases)
        active = len([c for c in cases if c.case_status not in ['Judgment', 'Closed']])
        # Mocking deadlines for now as we don't have a specific field, but returning the structure
        return {
            "total_cases": total,
            "active_cases": active,
            "upcoming_deadlines": 3  # Placeholder based on upcoming calendar dates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_cases", tags=["Case Management"])
async def get_cases(search_term: str = ""):
    if not agent:
        raise HTTPException(status_code=400, detail="Agent not initialized")
    
    try:
        cases = agent.database_manager.get_cases_by_name(search_term)
        return {
            "success": True, 
            "cases": [{
                "id": c.id, "name": c.name, "jurisdiction_code": c.jurisdiction_code,
                "case_type": getattr(c, 'case_type', 'General'),
                "case_status": getattr(c, 'case_status', 'Open'),
                "created_at": c.created_at.isoformat() if c.created_at else None
            } for c in cases]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/update_case_status", tags=["Case Management"])
async def update_case_status(req: dict):
    """Move case through lifecycle: FIR -> Investigation -> Chargesheet -> Judgment"""
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    case_id = req.get("case_id")
    new_status = req.get("status")
    
    if new_status not in ["FIR", "Investigation", "Chargesheet", "Trial", "Judgment"]:
        raise HTTPException(status_code=400, detail="Invalid lifecycle stage")
        
    try:
        updated = agent.database_manager.update_case(case_id, case_status=new_status)
        return {"success": True, "new_status": updated.case_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create_case", tags=["Case Management"])
async def create_case(req: CaseCreateRequest):
    if not agent:
        raise HTTPException(status_code=400, detail="Agent not initialized")
    
    try:
        case = agent.database_manager.create_case(
            name=req.name,
            jurisdiction_code=req.jurisdiction_code,
            case_type=req.case_type,
            case_status='Investigation',
            notes=f"FIR No: {req.fir_no}. {req.notes}"
        )
        agent.database_manager.initialize_from_case(case)
        return {
            "success": True,
            "case": {"id": case.id, "name": case.name, "case_type": case.case_type}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/load_case", tags=["Case Management"])
async def load_case(req: CaseLoadRequest):
    global agent
    if not agent: raise HTTPException(status_code=400, detail="Agent init required")
    
    try:
        case = agent.get_case_by_name_web_safe(req.case_name)
        if not case: raise HTTPException(status_code=404, detail="Case not found")
        
        agent.database_manager.initialize_from_case(case)
        return {"success": True, "case": {"id": case.id, "name": case.name}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask_question", tags=["AI & Chat"])
async def ask_question(req: QuestionRequest):
    global agent, message_count
    if not agent: raise HTTPException(status_code=400, detail="Agent not initialized")
    
    try:
        chat_interaction = agent.execute_actions(req.question)
        message_count += 1
        return {
            "success": True,
            "answer": chat_interaction.assistant_response,
            "new_advice": agent.generate_passive_legal_information() if message_count % 5 == 0 else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_documents", tags=["Documents"])
async def get_documents():
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    try:
        docs = agent.database_manager.get_uploaded_documents()
        return {"success": True, "documents": [{"id": d.id, "source_name": d.source_name, "uploaded_at": d.uploaded_at.isoformat()} for d in docs]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload_document", tags=["Documents"])
async def upload_document(files: List[UploadFile] = File(...)):
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    
    upload_dir = os.path.join(PROJECT_ROOT, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    saved_paths = []
    for file in files:
        file_path = os.path.join(upload_dir, f"{uuid4().hex}_{file.filename}")
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        saved_paths.append(file_path)
    
    # Links to the currently loaded case in the db_manager
    agent.database_manager.add_file_documents(saved_paths)
    return {"success": True, "message": f"Processed {len(saved_paths)} files"}

@app.post("/api/ai/suggest_next_step", tags=["AI Services"])
async def suggest_next_step():
    """Smart Agent Node: Proactively suggests next legal action."""
    if not agent or not agent.database_manager.case:
        return {"suggestion": "Please load a case to get personalized suggestions."}
    
    stage = agent.database_manager.case.case_status
    suggestions = {
        "FIR": "Initiate investigation and prepare an application for Anticipatory Bail if necessary.",
        "Investigation": "Analyze evidence and prepare inputs for the formal Chargesheet.",
        "Chargesheet": "Review prosecution evidence and prepare for the commencement of the Trial.",
        "Trial": "Focus on cross-examination of key witnesses and gathering rebuttal evidence.",
        "Judgment": "Review the judgment for grounds of appeal or initiate the decree execution process."
    }
    
    recommendation = suggestions.get(stage, "Continue with standard case procedures and document analysis.")
    return {"success": True, "current_stage": stage, "suggestion": recommendation}

@app.post("/api/ai/generate_draft", tags=["AI Services"])
async def generate_draft_api(req: dict):
    return await generate_draft(req)

@app.post("/api/ai/research", tags=["AI Services"])
async def ai_research(req: dict):
    """Legal Research AI Module: Specialized in precedents."""
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    query = req.get("query", "")
    try:
        # Calls the specialized legal research logic
        # For now returns a structured AI response based on RAG
        result = agent.execute_actions(f"Research following legal point: {query}")
        return {"success": True, "research_data": result.assistant_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat", tags=["AI Services"])
async def ai_chat(req: QuestionRequest):
    """Document Chat AI Module: Conversational RAG."""
    return await ask_question(req)

@app.post("/api/ai/summarize", tags=["AI Services"])
async def ai_summarize(req: dict):
    """PDF Summarizer AI Module: High-level document analysis."""
    return await summarize_document(req)

@app.post("/api/summarize_document", tags=["AI & Chat"])
async def summarize_document(req: dict):
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    doc_id = req.get("document_id")
    try:
        documents = agent.database_manager.get_uploaded_documents()
        doc = next((d for d in documents if d.id == doc_id), None)
        if not doc: raise HTTPException(status_code=404, detail="Doc not found")
        
        result = agent.execute_actions(f"Executive summary for '{doc.source_name}'")
        return {"success": True, "summary": result.assistant_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_chat_history", tags=["AI & Chat"])
async def get_history():
    if not agent: raise HTTPException(status_code=400, detail="Init required")
    try:
        history = agent.database_manager.get_chat_history()
        return {"success": True, "history": [{"question": h.user_prompt, "answer": h.assistant_response} for h in history]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
