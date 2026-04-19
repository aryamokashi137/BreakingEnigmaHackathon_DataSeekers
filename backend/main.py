from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from datetime import datetime
import os, shutil

from database import cases_collection, documents_collection, chats_collection, lawyers_collection
from models import CaseCreate, ChatMessage
from pydantic import BaseModel
from pdf_processor import extract_text, chunk_text
from vector_store import add_chunks, search, delete_case_index
from ai_agent import rag_answer, summarize_text, legal_research, detect_intent, generate_draft, DOCUMENT_TYPES, extract_lifecycle, analyze_case, extract_deadlines

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def resolve_path(file_path: str) -> str:
    if os.path.isabs(file_path):
        return file_path
    return os.path.join(BASE_DIR, file_path)

def str_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ── Auth ───────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    lawyer_id: str

@app.post("/login")
def login(payload: LoginRequest):
    lawyer = lawyers_collection.find_one({"lawyer_id": payload.lawyer_id.upper()})
    if not lawyer:
        raise HTTPException(status_code=401, detail="Invalid Lawyer ID. Please check and try again.")
    lawyer["_id"] = str(lawyer["_id"])
    return {"lawyer": lawyer}

@app.get("/lawyers")
def list_lawyers():
    return [{**l, "_id": str(l["_id"])} for l in lawyers_collection.find()]


# ── Cases ──────────────────────────────────────────────────────────────────────

@app.post("/cases")
def create_case(payload: CaseCreate):
    doc = {
        "case_name": payload.case_name,
        "description": payload.description,
        "lawyer_id": payload.lawyer_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = cases_collection.insert_one(doc)
    return {"id": str(result.inserted_id), "case_name": payload.case_name}


@app.get("/cases")
def list_cases(lawyer_id: str):
    return [str_id(c) for c in cases_collection.find({"lawyer_id": lawyer_id})]


@app.get("/cases/{case_id}")
def get_case(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return str_id(case)


@app.delete("/cases/{case_id}")
def delete_case(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    docs = list(documents_collection.find({"case_id": case_id}))
    for doc in docs:
        if os.path.exists(resolve_path(doc["file_path"])):
            os.remove(resolve_path(doc["file_path"]))
    documents_collection.delete_many({"case_id": case_id})
    chats_collection.delete_many({"case_id": case_id})
    cases_collection.delete_one({"_id": ObjectId(case_id)})
    return {"message": "Case deleted"}


# ── Documents ──────────────────────────────────────────────────────────────────

@app.post("/upload/{case_id}")
async def upload_document(case_id: str, file: UploadFile = File(...)):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed.")

    case_dir = os.path.join(UPLOAD_DIR, case_id)
    os.makedirs(case_dir, exist_ok=True)
    file_path = os.path.join(case_dir, file.filename)

    abs_file_path = resolve_path(file_path)
    with open(abs_file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text(abs_file_path)
    if text:
        chunks = chunk_text(text, case_id=case_id, doc_name=file.filename)
        add_chunks(case_id, chunks)

    doc = {
        "case_id": case_id,
        "filename": file.filename,
        "file_path": file_path,
        "has_text": bool(text),
        "created_at": datetime.utcnow().isoformat(),
    }
    result = documents_collection.insert_one(doc)
    return {"id": str(result.inserted_id), "filename": file.filename, "indexed": bool(text)}


@app.get("/documents/{case_id}")
def list_documents(case_id: str):
    return [str_id(d) for d in documents_collection.find({"case_id": case_id})]


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    doc = documents_collection.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if os.path.exists(resolve_path(doc["file_path"])):
        os.remove(resolve_path(doc["file_path"]))
    documents_collection.delete_one({"_id": ObjectId(doc_id)})
    return {"message": "Deleted"}


# ── Chat ───────────────────────────────────────────────────────────────────────

@app.post("/chat")
def chat(payload: ChatMessage):
    chats_collection.insert_one({
        "case_id": payload.case_id, "role": "user",
        "message": payload.message, "created_at": datetime.utcnow().isoformat(),
    })

    intent = detect_intent(payload.message)

    if intent == "summarize":
        chunks = search(payload.case_id, "document summary overview", top_k=20)
        reply = summarize_text(chunks)
    elif intent == "legal_research":
        # Pass top RAG chunks as case context so research is case-aware
        context_chunks = search(payload.case_id, payload.message, top_k=3)
        case_context = "\n\n".join(c["text"] for c in context_chunks) if context_chunks else ""
        reply = legal_research(payload.message, case_context)
    else:
        chunks = search(payload.case_id, payload.message, top_k=5)
        reply = rag_answer(payload.message, chunks)

    chats_collection.insert_one({
        "case_id": payload.case_id, "role": "assistant",
        "message": reply, "intent": intent, "created_at": datetime.utcnow().isoformat(),
    })
    return {"response": reply, "intent": intent}


@app.get("/chat/{case_id}")
def get_chat_history(case_id: str):
    return [str_id(m) for m in chats_collection.find({"case_id": case_id})]


@app.delete("/chat/{case_id}")
def clear_chat(case_id: str):
    chats_collection.delete_many({"case_id": case_id})
    return {"message": "Chat cleared"}


# ── Summarize ──────────────────────────────────────────────────────────────────

@app.post("/summarize/{case_id}/{doc_name}")
def summarize_document(case_id: str, doc_name: str):
    doc = documents_collection.find_one({"case_id": case_id, "filename": doc_name})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    text = extract_text(resolve_path(doc["file_path"]))
    if not text.strip():
        return {"summary": "This document has no extractable text content."}
    chunks = chunk_text(text, case_id=case_id, doc_name=doc_name)
    return {"summary": summarize_text(chunks)}


# ── Document Drafting ──────────────────────────────────────────────────────────

@app.get("/draft-types")
def get_draft_types():
    return {k: {"label": v["label"], "fields": v["fields"]} for k, v in DOCUMENT_TYPES.items()}


class DraftRequest(BaseModel):
    type: str
    data: dict

@app.post("/generate-draft")
def generate_document_draft(payload: DraftRequest):
    if payload.type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported document type: {payload.type}")
    return {"draft": generate_draft(payload.type, payload.data)}


# ── Case Lifecycle ─────────────────────────────────────────────────────────────

@app.post("/case-lifecycle/{case_id}")
def build_case_lifecycle(case_id: str, force: bool = False):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.get("lifecycle") and not force:
        return {"lifecycle": case["lifecycle"], "cached": True}
    docs = list(documents_collection.find({"case_id": case_id, "has_text": True}))
    if not docs:
        raise HTTPException(status_code=400, detail="No indexed documents found for this case.")
    combined_text = "".join(extract_text(resolve_path(d["file_path"])) + "\n\n" for d in docs)
    lifecycle = extract_lifecycle(combined_text)
    cases_collection.update_one({"_id": ObjectId(case_id)}, {"$set": {"lifecycle": lifecycle}})
    return {"lifecycle": lifecycle, "cached": False}


@app.get("/case-lifecycle/{case_id}")
def get_case_lifecycle(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"lifecycle": case.get("lifecycle")}


# ── Smart Analysis ─────────────────────────────────────────────────────────────

@app.post("/analyze-case/{case_id}")
def analyze_case_endpoint(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    lifecycle = case.get("lifecycle")
    if not lifecycle:
        raise HTTPException(status_code=400, detail="Run /case-lifecycle first.")
    chunks = search(case_id, "case arguments evidence parties legal issues", top_k=8)
    return {"analysis": analyze_case(lifecycle, chunks)}


# ── Deadline Tracker ───────────────────────────────────────────────────────────

@app.post("/extract-deadlines/{case_id}")
def extract_case_deadlines(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    docs = list(documents_collection.find({"case_id": case_id, "has_text": True}))
    if not docs:
        raise HTTPException(status_code=400, detail="No indexed documents found.")
    combined_text = "".join(extract_text(resolve_path(d["file_path"])) + "\n\n" for d in docs)
    events = extract_deadlines(combined_text)
    cases_collection.update_one({"_id": ObjectId(case_id)}, {"$set": {"events": events}})
    return {"events": events}


@app.get("/timeline/{case_id}")
def get_timeline(case_id: str):
    from datetime import date
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    today = date.today().isoformat()
    upcoming, past = [], []
    for e in sorted(case.get("events", []), key=lambda x: x.get("date", "")):
        (upcoming if e.get("date", "") >= today else past).append(e)
    return {"upcoming": upcoming, "past": past}


class EventInput(BaseModel):
    date: str
    type: str
    description: str

@app.post("/add-event/{case_id}")
def add_event(case_id: str, payload: EventInput):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    new_event = {"date": payload.date, "type": payload.type, "description": payload.description}
    cases_collection.update_one({"_id": ObjectId(case_id)}, {"$push": {"events": new_event}})
    return {"message": "Event added", "event": new_event}
