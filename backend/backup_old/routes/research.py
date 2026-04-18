from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from services.rag_service import rag_service

router = APIRouter(
    prefix="/research",
    tags=["research"]
)

class ResearchQuery(BaseModel):
    query: str
    case_id: Optional[str] = None

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_document(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    section_type: str = Form("CaseLaw")
):
    """
    Feature 2: Document Ingestion
    Accepts PDF upload, extracts text, chunks it, and saves to Vector DB.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        chunks_saved = await rag_service.process_pdf(file, case_id, section_type)
        return {"message": f"Successfully ingested {file.filename}", "chunks_processed": chunks_saved}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")

@router.post("/", status_code=status.HTTP_200_OK)
async def legal_research(query_data: ResearchQuery):
    """
    Feature 3: Legal Research AI
    Converts query to embedding, retrieves context, and passes to LLM.
    """
    try:
        result = rag_service.query_legal_research(query_data.query, query_data.case_id)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")
