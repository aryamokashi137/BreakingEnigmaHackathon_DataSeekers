import os
import shutil
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from models.case import CaseCreate, NoteModel, DeadlineModel
from services import case_service

router = APIRouter(prefix="/api/cases", tags=["Cases"])

# Absolute path — works regardless of where uvicorn is launched from
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("", status_code=201)
async def create_case(case: CaseCreate):
    if not case.title.strip():
        raise HTTPException(status_code=422, detail="Case title cannot be empty")
    if not case.client_name.strip():
        raise HTTPException(status_code=422, detail="Client name cannot be empty")
    result = await case_service.create_case(case.model_dump())
    return {"success": True, "case": result}


@router.get("")
async def get_all_cases():
    cases = await case_service.get_all_cases()
    return {"success": True, "cases": cases}


@router.get("/{case_id}")
async def get_case(case_id: str):
    case = await case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"success": True, "case": case}


@router.post("/{case_id}/notes")
async def add_note(case_id: str, note: NoteModel):
    case = await case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    result = await case_service.add_note(case_id, note.content)
    return {"success": True, "note": result}


@router.post("/{case_id}/deadlines")
async def add_deadline(case_id: str, deadline: DeadlineModel):
    case = await case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    result = await case_service.add_deadline(case_id, deadline.title, deadline.due_date)
    return {"success": True, "deadline": result}


@router.patch("/{case_id}/deadlines/{deadline_id}")
async def toggle_deadline(case_id: str, deadline_id: str):
    success = await case_service.toggle_deadline(case_id, deadline_id)
    if not success:
        raise HTTPException(status_code=404, detail="Case or deadline not found")
    return {"success": True}


@router.post("/{case_id}/upload")
async def upload_document(case_id: str, file: UploadFile = File(...)):
    case = await case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Only allow PDFs
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Save file with unique name
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid4()}{ext}"
    filepath = UPLOAD_DIR / unique_name

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    doc = await case_service.add_document(case_id, unique_name, file.filename)
    return {"success": True, "document": doc}


@router.get("/{case_id}/files/{filename}")
async def get_file(case_id: str, filename: str):
    # Prevent path traversal attacks
    filepath = (UPLOAD_DIR / filename).resolve()
    if not str(filepath).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid filename")
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(str(filepath), media_type="application/pdf")


@router.delete("/{case_id}/files/{document_id}")
async def delete_document_route(case_id: str, document_id: str):
    doc_info = await case_service.get_document_info(case_id, document_id)
    if doc_info:
        filepath = (UPLOAD_DIR / doc_info["filename"]).resolve()
        if filepath.exists():
            try:
                filepath.unlink()
            except Exception:
                pass

    success = await case_service.delete_document(case_id, document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document or case not found")
    return {"success": True}
