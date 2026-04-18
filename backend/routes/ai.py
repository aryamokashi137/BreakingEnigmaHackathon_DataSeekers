from fastapi import APIRouter, HTTPException
from models.case import (
    ResearchRequest,
    GenerateDocumentRequest,
    SummarizeRequest,
    ChatRequest,
    PrepareCaseRequest,
)
from services import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/research")
async def research(req: ResearchRequest):
    try:
        result = await ai_service.research(req.topic, req.case_id)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/generate-document")
async def generate_document(req: GenerateDocumentRequest):
    try:
        result = await ai_service.generate_document(
            req.document_type, req.details, req.case_id
        )
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    try:
        result = await ai_service.summarize_document(req.case_id, req.document_id)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        result = await ai_service.chat(req.case_id, req.message, req.history)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/prepare-case")
async def prepare_case(req: PrepareCaseRequest):
    try:
        result = await ai_service.prepare_case(req.case_id)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
