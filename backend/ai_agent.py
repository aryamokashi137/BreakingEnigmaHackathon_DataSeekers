import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "anthropic/claude-3.5-haiku"


def _call_llm(prompt: str, max_tokens: int = 1024) -> str:
    response = httpx.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


# ── RAG ────────────────────────────────────────────────────────────────────────

def rag_answer(query: str, chunks: list[dict]) -> str:
    if not chunks:
        return "I could not find any relevant information in the uploaded documents to answer your question."

    context = "\n\n---\n\n".join(
        f"[{c['doc_name']} | chunk {c['chunk_index']}]\n{c['text']}"
        for c in chunks
    )

    prompt = f"""You are a legal assistant AI. Answer the user's question strictly based on the document context provided below.

Rules:
- Answer ONLY from the provided context.
- If the answer is not found in the context, respond with: "This information was not found in the uploaded documents."
- Be clear, structured, and concise.
- Do not make up information.

--- DOCUMENT CONTEXT ---
{context}
--- END CONTEXT ---

User Question: {query}

Answer:"""

    return _call_llm(prompt)


# ── SUMMARIZER ─────────────────────────────────────────────────────────────────

def summarize_text(chunks: list[dict]) -> str:
    if not chunks:
        return "No document content found to summarize. Please upload a document first."

    # If small enough, summarize directly
    all_text = " ".join(c["text"] for c in chunks)
    words = all_text.split()

    # If text is large, summarize in batches then combine
    BATCH_WORDS = 3000
    if len(words) > BATCH_WORDS:
        batch_summaries = []
        for i in range(0, len(words), BATCH_WORDS):
            batch = " ".join(words[i: i + BATCH_WORDS])
            batch_prompt = f"""Summarize the following legal document section concisely:

{batch}

Summary:"""
            batch_summaries.append(_call_llm(batch_prompt, max_tokens=512))

        combined = "\n\n".join(batch_summaries)
        final_prompt = f"""You are a legal assistant. Below are section-wise summaries of a legal document.
Combine them into one structured final summary.

Section Summaries:
{combined}

Provide the final summary in this format:
**Overview:** (2-3 sentences)
**Key Points:** (bullet list)
**Important Arguments:** (bullet list)
**Conclusion:** (if present, else write "Not specified")"""
        return _call_llm(final_prompt, max_tokens=1024)

    # Small document — summarize directly
    prompt = f"""You are a legal assistant AI. Summarize the following legal document clearly and concisely.

Document Content:
{all_text}

Provide the summary in this format:
**Overview:** (2-3 sentences)
**Key Points:** (bullet list)
**Important Arguments:** (bullet list)
**Conclusion:** (if present, else write "Not specified")"""

    return _call_llm(prompt, max_tokens=1024)


# ── LEGAL RESEARCH ─────────────────────────────────────────────────────────────

def legal_research(query: str) -> str:
    prompt = f"""You are an expert legal research assistant with deep knowledge of law, legal codes, constitutional articles, and statutes.

A lawyer has asked the following legal research question:
"{query}"

Provide a clear, structured, and accurate answer based on your legal knowledge.

Format your response as:
**Legal Provision:** (name/number of the law, article, or section)
**Explanation:** (clear explanation in simple language)
**Key Points:** (bullet list of important aspects)
**Practical Implications:** (how this applies in real legal scenarios)

If the query is about a specific country's law, mention which jurisdiction it applies to.
Be accurate, concise, and helpful."""

    return _call_llm(prompt, max_tokens=1024)


# ── CASE LIFECYCLE + SMART AGENT ────────────────────────────────────────────────

import json
import re

def extract_lifecycle(text: str) -> dict:
    prompt = f"""You are a legal analyst AI. Analyze the following legal case documents and extract structured lifecycle information.

Document Content:
{text[:6000]}

Extract and return ONLY a valid JSON object with this exact structure:
{{
  "timeline": ["event 1", "event 2"],
  "parties": ["Party Name (Role)"],
  "case_type": "Civil / Criminal / Family / etc.",
  "current_stage": "Investigation / Trial / Appeal / etc.",
  "legal_issues": ["issue 1", "issue 2"],
  "key_events": ["key event 1", "key event 2"]
}}

Return ONLY the JSON. No explanation. No markdown."""

    raw = _call_llm(prompt, max_tokens=1024)
    # Strip markdown code fences if present
    raw = re.sub(r"```(?:json)?\n?", "", raw).strip().rstrip("`")
    try:
        return json.loads(raw)
    except Exception:
        return {
            "timeline": [],
            "parties": [],
            "case_type": "Unknown",
            "current_stage": "Unknown",
            "legal_issues": [],
            "key_events": [],
            "raw": raw,
        }


def analyze_case(lifecycle: dict, chunks: list[dict]) -> dict:
    context = "\n\n".join(c["text"] for c in chunks[:5]) if chunks else "No document context available."
    lifecycle_text = json.dumps(lifecycle, indent=2)

    prompt = f"""You are an experienced legal advisor and strategist.

Based on the case lifecycle data and document context below, provide a comprehensive legal analysis.

Case Lifecycle:
{lifecycle_text}

Document Context:
{context}

Provide your analysis as ONLY a valid JSON object with this exact structure:
{{
  "strengths": ["strength 1", "strength 2"],
  "risks": ["risk 1", "risk 2"],
  "next_steps": ["step 1", "step 2"],
  "strategy": ["strategy point 1", "strategy point 2"]
}}

Be practical, realistic, and use legal reasoning. Return ONLY the JSON. No explanation. No markdown."""

    raw = _call_llm(prompt, max_tokens=1024)
    raw = re.sub(r"```(?:json)?\n?", "", raw).strip().rstrip("`")
    try:
        return json.loads(raw)
    except Exception:
        return {
            "strengths": [],
            "risks": [],
            "next_steps": [],
            "strategy": [],
            "raw": raw,
        }


# ── DOCUMENT DRAFTING ─────────────────────────────────────────────────────────

DOCUMENT_TYPES = {
    "affidavit": {
        "label": "Affidavit",
        "fields": ["deponent_name", "age", "address", "statement", "date", "location"],
    },
    "bail_application": {
        "label": "Bail Application",
        "fields": ["applicant_name", "case_number", "court_name", "charges", "grounds", "date", "location"],
    },
    "legal_notice": {
        "label": "Legal Notice",
        "fields": ["sender_name", "sender_address", "recipient_name", "recipient_address", "subject", "facts", "demand", "date"],
    },
}


def generate_draft(doc_type: str, data: dict) -> str:
    if doc_type not in DOCUMENT_TYPES:
        return "Unsupported document type."

    label = DOCUMENT_TYPES[doc_type]["label"]
    fields_text = "\n".join(f"- {k.replace('_', ' ').title()}: {v}" for k, v in data.items())

    prompt = f"""You are an expert legal document drafter with years of experience in Indian law.

Generate a complete, properly formatted {label} using the details provided below.

Details:
{fields_text}

Requirements:
- Use formal legal language and tone throughout
- Include all standard sections and clauses for a {label}
- Add proper headings, numbering, and structure
- Include standard legal declarations and signatures section
- Make it ready for real-world use
- Do NOT add placeholder text — use the provided details directly

Generate the complete {label} now:"""

    return _call_llm(prompt, max_tokens=2048)


# ── DEADLINE & COURT TRACKER ──────────────────────────────────────────────────

def extract_deadlines(text: str) -> list:
    prompt = f"""You are a legal analyst AI. Analyze the following legal case documents and extract all important dates and events.

Document Content:
{text[:6000]}

Tasks:
- Identify ALL dates mentioned in the document
- Determine the event type: hearing, filing_deadline, submission, judgment, notice, other
- Add a short description of the event
- Format dates as YYYY-MM-DD (if only month/year known, use first day e.g. 2026-04-01)

Return ONLY a valid JSON object:
{{"events": [
  {{"date": "YYYY-MM-DD", "type": "hearing", "description": "Court hearing scheduled"}}
]}}

Return ONLY the JSON. No explanation. No markdown."""

    raw = _call_llm(prompt, max_tokens=1024)
    raw = re.sub(r"```(?:json)?\n?", "", raw).strip().rstrip("`")
    try:
        return json.loads(raw).get("events", [])
    except Exception:
        return []


# ── AGENTIC INTENT CLASSIFIER ──────────────────────────────────────────────────

def detect_intent(query: str) -> str:
    prompt = f"""You are the routing brain of an AI legal assistant.

Classify the user query into EXACTLY one of these three categories:
- document_qa   → question about an uploaded case document (parties, facts, arguments, evidence, dates)
- summarize     → request to summarize or give an overview of a document
- legal_research → question about a law, act, section, article, IPC, constitution, legal concept

Rules:
- If the query mentions "this document", "this case", "uploaded", "file" → document_qa
- If the query asks to summarize, brief, overview, outline → summarize
- If the query asks about a law, section, article, IPC, legal concept → legal_research
- When in doubt between document_qa and legal_research → choose document_qa

Respond with ONLY one word: document_qa, summarize, or legal_research

User Query: {query}

Category:"""

    try:
        result = _call_llm(prompt, max_tokens=10).strip().lower()
        if "summarize" in result:
            return "summarize"
        if "legal_research" in result or "legal" in result or "research" in result:
            return "legal_research"
        return "document_qa"
    except Exception:
        # Fallback to keyword matching if LLM call fails
        q = query.lower()
        if any(k in q for k in ("summarize", "summary", "overview", "brief", "outline")):
            return "summarize"
        if any(k in q for k in ("article", "section", "ipc", "law", "act", "constitution", "clause")):
            return "legal_research"
        return "document_qa"
