from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.case import CaseCreate, CaseResponse
from services import case_service, rag_service
import os
import shutil

router = APIRouter(
    prefix="/cases",
    tags=["cases"]
)

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(case_data: CaseCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await case_service.create_case(db, case_data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create case: {str(e)}")

@router.get("/", response_model=list[CaseResponse])
async def get_all_cases(db: AsyncSession = Depends(get_db)):
    return await case_service.get_all_cases(db)

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(case_id: int, db: AsyncSession = Depends(get_db)):
    case = await case_service.get_case_by_id(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/{case_id}/notes")
async def add_note(case_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    content = data.get("content")
    if not content:
        raise HTTPException(status_code=400, detail="Content required")
    return await case_service.add_note(db, case_id, content)

@router.post("/{case_id}/deadlines")
async def add_deadline(case_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    return await case_service.add_deadline(db, case_id, data["title"], data["due_date"])

@router.patch("/{case_id}/deadlines/{deadline_id}")
async def toggle_deadline(case_id: int, deadline_id: int, db: AsyncSession = Depends(get_db)):
    success = await case_service.toggle_deadline(db, deadline_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deadline not found")
    return {"success": True}

@router.post("/{case_id}/upload")
async def upload_document(case_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    
    file_path = os.path.join("uploads", file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Save to database
    doc = await case_service.add_document(db, case_id, file.filename, file.filename)
    
    # Process for RAG
    # Reset file pointer to the beginning before reading for RAG
    await file.seek(0)
    await rag_service.rag_service.process_pdf(file, str(case_id))
    
    return doc

@router.get("/{case_id}/files/{filename}")
async def get_document(case_id: int, filename: str):
    file_path = os.path.join("uploads", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path)

@router.delete("/{case_id}/files/{document_id}")
async def delete_document(case_id: int, document_id: int, db: AsyncSession = Depends(get_db)):
    success = await case_service.delete_document(db, document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True}

@router.delete("/{case_id}")
async def delete_case(case_id: int, db: AsyncSession = Depends(get_db)):
    success = await case_service.delete_case(db, case_id)
    if not success:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"success": True}
