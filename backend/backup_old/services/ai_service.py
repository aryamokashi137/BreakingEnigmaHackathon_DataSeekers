import os
from openai import OpenAI
from config import settings
from services import case_service
from services.rag_service import rag_service
from services.vector_store import vector_store
from database import AsyncSessionLocal

# --- Core AI Call (Mainly for OpenRouter/Generic) ---

def get_ai_client():
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY if hasattr(settings, 'OPENROUTER_API_KEY') else "",
    )

def call_ai(system_prompt: str, user_prompt: str, model: str = None) -> str:
    """Send a prompt to the AI model via Groq and return the response text."""
    try:
        llm = rag_service._get_llm()
        from langchain_core.messages import HumanMessage, SystemMessage
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = llm.invoke(messages)
        return response.content if hasattr(response, "content") else response
    except Exception as e:
        return f"AI Service Error: {str(e)}"

# --- Context Building ---

async def _build_case_context(case_id: int) -> str:
    """Fetch case data and relevant document chunks."""
    async with AsyncSessionLocal() as db:
        case = await case_service.get_case_by_id(db, case_id)
        if not case:
            return "No case context available."

        context = f"""
CASE INFORMATION:
- Title: {case.title}
- Client: {case.client_name}
- Type: {case.case_type}
- Status: {case.status}
- Description: {case.description}
"""
        if case.notes:
            context += "\nCASE NOTES:\n"
            for note in case.notes:
                context += f"- [{note.created_at}] {note.content}\n"

        if case.deadlines:
            context += "\nDEADLINES:\n"
            for dl in case.deadlines:
                status = "✅ Done" if dl.completed else "⏳ Pending"
                context += f"- {dl.title} (Due: {dl.due_date}) [{status}]\n"

        # Integrate RAG context
        # We query for general context related to the case description
        rag_result = rag_service.query_legal_research(case.description, case_id=case_id)
        if rag_result.get("answer"):
            context += f"\nRELEVANT DOCUMENT EXCERPTS:\n{rag_result['answer']}\n"

        return context

# --- High-Level AI Functions ---

async def research(topic: str, case_id: int = None) -> str:
    """Perform AI legal research with case context."""
    # Use rag_service directly for research as it's optimized for it
    result = rag_service.query_legal_research(topic, case_id=case_id)
    return result["answer"]

async def summarize_document(case_id: int, document_id: int) -> str:
    """Summarize a specific document within a case."""
    async with AsyncSessionLocal() as db:
        doc = await case_service.get_document_info(db, document_id)
        if not doc:
            return "Document not found."
        
        # Query vector store for chunks from this specific document
        filter_dict = {"case_id": str(case_id), "document_name": doc.filename}
        docs = vector_store.similarity_search("summary of content", k=20, filter=filter_dict)

        
        if not docs:
            return "No content found for this document in the vector store."
            
        context = "\n\n".join([d.page_content for d in docs])
        
        system_prompt = "You are a legal assistant specializing in document summarization."
        user_prompt = f"Please provide a concise but thorough summary of the following document: {doc.original_name}\n\nCONTENT:\n{context}"
        
        return call_ai(system_prompt, user_prompt)

async def generate_document(document_type: str, details: str, case_id: int = None) -> str:
    """Generate a legal document draft."""
    system_prompt = """You are an expert legal document drafting assistant.
Generate a professional, well-structured legal document based on the type and details provided.
Use information from the provided case context to make it specific and accurate."""

    user_prompt = f"Generate a {document_type} with the following details:\n{details}"

    if case_id:
        context = await _build_case_context(case_id)
        user_prompt += f"\n\nCASE CONTEXT:\n{context}"

    return call_ai(system_prompt, user_prompt)

async def chat(case_id: int, message: str, history: list = None) -> str:
    """Context-aware chat about a specific case."""
    # For chat, we pull relevant chunks based on the message
    rag_result = rag_service.query_legal_research(message, case_id=case_id)
    document_context = rag_result["answer"]
    
    async with AsyncSessionLocal() as db:
        case = await case_service.get_case_by_id(db, case_id)
        
    system_prompt = f"""You are an intelligent legal assistant.
You have access to the following case details and document excerpts.
Use them to provide helpful, accurate responses.

CASE: {case.title if case else 'Unknown'}
CLIENT: {case.client_name if case else 'Unknown'}

DOCUMENT EXCERPTS:
{document_context}
"""
    
    # We use rag_service's LLM for chat too to be consistent
    llm = rag_service._get_llm()
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    
    messages = [SystemMessage(content=system_prompt)]
    if history:
        for h in history:
            if h["role"] == "user": messages.append(HumanMessage(content=h["content"]))
            else: messages.append(AIMessage(content=h["content"]))
    
    messages.append(HumanMessage(content=message))
    
    response = llm.invoke(messages)
    return response.content if hasattr(response, "content") else response

async def prepare_case(case_id: int) -> str:
    """Multi-step case preparation: analysis + research + strategy."""
    # Use the new holistic analysis
    result = rag_service.analyze_case_holistically(case_id)
    return result["answer"]

