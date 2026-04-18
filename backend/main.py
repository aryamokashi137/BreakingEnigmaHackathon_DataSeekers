from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from datetime import datetime
import os, shutil

from database import cases_collection, documents_collection, chats_collection
from models import CaseCreate, ChatMessage
from pdf_processor import extract_text, chunk_text
from vector_store import add_chunks, search, delete_case_index
from ai_agent import rag_answer, summarize_text, legal_research, detect_intent

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

def str_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ── Cases ──────────────────────────────────────────────────────────────────────

@app.post("/cases")
def create_case(payload: CaseCreate):
    doc = {
        "case_name": payload.case_name,
        "description": payload.description,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = cases_collection.insert_one(doc)
    return {"id": str(result.inserted_id), "case_name": payload.case_name}


@app.get("/cases")
def list_cases():
    return [str_id(c) for c in cases_collection.find()]


@app.get("/cases/{case_id}")
def get_case(case_id: str):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return str_id(case)


# ── Documents ──────────────────────────────────────────────────────────────────

@app.post("/upload/{case_id}")
async def upload_document(case_id: str, file: UploadFile = File(...)):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    case_dir = os.path.join(UPLOAD_DIR, case_id)
    os.makedirs(case_dir, exist_ok=True)
    file_path = os.path.join(case_dir, file.filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Extract text + chunk + embed → FAISS
    text = extract_text(file_path)
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
    docs = documents_collection.find({"case_id": case_id})
    return [str_id(d) for d in docs]


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    doc = documents_collection.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if os.path.exists(doc["file_path"]):
        os.remove(doc["file_path"])
    documents_collection.delete_one({"_id": ObjectId(doc_id)})
    return {"message": "Deleted"}


# ── Chat (Intent Router) ──────────────────────────────────────────────────────

@app.post("/chat")
def chat(payload: ChatMessage):
    user_msg = {
        "case_id": payload.case_id,
        "role": "user",
        "message": payload.message,
        "created_at": datetime.utcnow().isoformat(),
    }
    chats_collection.insert_one(user_msg)

    intent = detect_intent(payload.message)

    if intent == "summarize":
        chunks = search(payload.case_id, "document summary overview", top_k=20)
        reply = summarize_text(chunks)

    elif intent == "legal_research":
        reply = legal_research(payload.message)

    else:  # document_qa
        chunks = search(payload.case_id, payload.message, top_k=5)
        reply = rag_answer(payload.message, chunks)

    bot_msg = {
        "case_id": payload.case_id,
        "role": "assistant",
        "message": reply,
        "intent": intent,
        "created_at": datetime.utcnow().isoformat(),
    }
    chats_collection.insert_one(bot_msg)

    return {"response": reply, "intent": intent}


@app.get("/chat/{case_id}")
def get_chat_history(case_id: str):
    msgs = chats_collection.find({"case_id": case_id})
    return [str_id(m) for m in msgs]


# ── Summarize specific document ────────────────────────────────────────────────

@app.post("/summarize/{case_id}/{doc_name}")
def summarize_document(case_id: str, doc_name: str):
    doc = documents_collection.find_one({"case_id": case_id, "filename": doc_name})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    text = extract_text(doc["file_path"])
    if not text.strip():
        return {"summary": "This document has no extractable text content (e.g. scanned image)."}

    chunks = chunk_text(text, case_id=case_id, doc_name=doc_name)
    summary = summarize_text(chunks)
    return {"summary": summary}
