import os
import httpx
from openai import OpenAI
from PyPDF2 import PdfReader
from config import settings
from services import case_service


# --- Core AI Call ---

def get_ai_client():
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
    )


def call_ai(system_prompt: str, user_prompt: str, model: str = None) -> str:
    """Send a prompt to the AI model via OpenRouter and return the response text."""
    client = get_ai_client()
    response = client.chat.completions.create(
        model=model or settings.AI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        extra_headers={
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Legal Workflow Assistant",
        },
    )
    return response.choices[0].message.content


def call_ai_with_history(system_prompt: str, messages: list, model: str = None) -> str:
    """Send a multi-turn conversation to the AI model."""
    client = get_ai_client()
    full_messages = [{"role": "system", "content": system_prompt}] + messages
    response = client.chat.completions.create(
        model=model or settings.AI_MODEL,
        messages=full_messages,
        extra_headers={
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Legal Workflow Assistant",
        },
    )
    return response.choices[0].message.content


# --- PDF Text Extraction ---

def extract_pdf_text(filepath: str) -> str:
    """Extract text from a PDF file."""
    try:
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"


# --- Helper: Build case context ---

async def _build_case_context(case_id: str) -> str:
    """Fetch case data and format it as context for the AI."""
    case = await case_service.get_case_by_id(case_id)
    if not case:
        return "No case context available."

    context = f"""
CASE INFORMATION:
- Title: {case['title']}
- Client: {case['client_name']}
- Type: {case['case_type']}
- Status: {case['status']}
- Description: {case['description']}
"""
    if case.get("notes"):
        context += "\nCASE NOTES:\n"
        for note in case["notes"]:
            context += f"- [{note.get('created_at', 'N/A')}] {note['content']}\n"

    if case.get("deadlines"):
        context += "\nDEADLINES:\n"
        for dl in case["deadlines"]:
            status = "✅ Done" if dl["completed"] else "⏳ Pending"
            context += f"- {dl['title']} (Due: {dl['due_date']}) [{status}]\n"

    if case.get("documents"):
        context += "\nDOCUMENTS ON FILE:\n"
        for doc in case["documents"]:
            context += f"- {doc['original_name']}\n"

    return context


# --- High-Level AI Functions ---

async def research(topic: str, case_id: str = None) -> str:
    """Perform AI legal research on a topic, optionally with case context."""
    system_prompt = """You are an expert legal research assistant. 
Provide comprehensive legal research including:
1. Relevant laws and statutes
2. Key case precedents with citations
3. Legal principles that apply
4. Practical implications
Format your response clearly with sections and bullet points."""

    user_prompt = f"Research the following legal topic: {topic}"

    if case_id:
        context = await _build_case_context(case_id)
        user_prompt += f"\n\nThis research is for the following case:\n{context}"

    return call_ai(system_prompt, user_prompt)


async def generate_document(document_type: str, details: str, case_id: str = None) -> str:
    """Generate a legal document draft."""
    system_prompt = """You are an expert legal document drafting assistant.
Generate a professional, well-structured legal document based on the type and details provided.
Include all standard sections, legal language, and formatting appropriate for the document type.
Use placeholder brackets [PLACEHOLDER] for any specific details not provided."""

    user_prompt = f"Generate a {document_type} with the following details:\n{details}"

    if case_id:
        context = await _build_case_context(case_id)
        user_prompt += f"\n\nUse information from this case:\n{context}"

    return call_ai(system_prompt, user_prompt)


async def summarize_document(case_id: str, document_id: str) -> str:
    """Summarize a PDF document attached to a case."""
    doc_info = await case_service.get_document_info(case_id, document_id)
    if not doc_info:
        return "Document not found."

    filepath = os.path.join("uploads", doc_info["filename"])
    if not os.path.exists(filepath):
        return "File not found on server."

    pdf_text = extract_pdf_text(filepath)
    if pdf_text.startswith("Error"):
        return pdf_text

    # Truncate if too long (keep first ~8000 chars for API limits)
    if len(pdf_text) > 8000:
        pdf_text = pdf_text[:8000] + "\n... [truncated]"

    system_prompt = """You are a legal document analysis expert.
Provide a comprehensive summary including:
1. Document type and purpose
2. Key parties involved
3. Main terms, conditions, or arguments
4. Important dates and deadlines
5. Critical clauses or provisions
6. Action items or next steps"""

    user_prompt = f"Summarize the following legal document:\n\n{pdf_text}"

    return call_ai(system_prompt, user_prompt)


async def chat(case_id: str, message: str, history: list = None) -> str:
    """Context-aware chat about a specific case."""
    context = await _build_case_context(case_id)

    system_prompt = f"""You are an intelligent legal assistant with deep knowledge of the following case.
Use the case information to provide helpful, accurate responses.
If you don't know something specific about the case, say so clearly.

{context}"""

    messages = []
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": message})

    return call_ai_with_history(system_prompt, messages)


async def prepare_case(case_id: str) -> str:
    """Multi-step case preparation: analysis + research + strategy."""
    context = await _build_case_context(case_id)

    system_prompt = """You are a senior legal strategist preparing a comprehensive case brief.
Based on the case information provided, create a detailed case preparation document with:

1. **CASE ANALYSIS**
   - Summary of facts
   - Key legal issues identified
   - Strengths and weaknesses

2. **RELEVANT LEGAL RESEARCH**
   - Applicable laws and statutes
   - Relevant case precedents
   - Legal principles

3. **RECOMMENDED STRATEGY**
   - Suggested approach
   - Key arguments to make
   - Evidence to gather
   - Potential counter-arguments and responses

4. **TIMELINE & ACTION ITEMS**
   - Immediate next steps
   - Important deadlines to set
   - Preparation milestones

Format this as a professional legal brief."""

    user_prompt = f"Prepare a comprehensive case brief for the following case:\n{context}"

    return call_ai(system_prompt, user_prompt)
