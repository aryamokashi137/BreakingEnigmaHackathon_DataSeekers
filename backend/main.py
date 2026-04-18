import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, APIRouter
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Case, Document
from schemas import CaseCreate, CaseResponse, ResearchQuery, ResearchResponse
from rag import rag_service

# Create tables
Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Legal AI Backend (Full Reset)")

# Use a router with /api prefix
router = APIRouter(prefix="/api")

@router.post("/cases", response_model=CaseResponse)
def create_case(case_data: CaseCreate, db: Session = Depends(get_db)):
    try:
        new_case = Case(
            title=case_data.title,
            client_name=case_data.client_name,
            fir_number=case_data.fir_number,
            case_type=case_data.case_type,
            description=case_data.description
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        print(f"Case created successfully with ID: {new_case.id}")
        return new_case
    except Exception as e:
        print(f"Error creating case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
def upload_document(
    case_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Save file to disk
        file_path = os.path.join("uploads", file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Save metadata to DB
        new_doc = Document(case_id=case_id, filename=file.filename)
        db.add(new_doc)
        db.commit()
        
        # Process PDF and store in FAISS
        rag_service.process_pdf(file_path, case_id, file.filename)
        
        print(f"Document {file.filename} uploaded and processed for case {case_id}")
        return {"message": "Document uploaded and processed successfully", "filename": file.filename}
    except Exception as e:
        print(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/research", response_model=ResearchResponse)
def research(query_data: ResearchQuery):
    try:
        print(f"Processing research query: {query_data.query}")
        result = rag_service.query(query_data.query)
        return ResearchResponse(
            answer=result["answer"],
            context_used=result["context_used"]
        )
    except Exception as e:
        print(f"Error in research: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(router)
