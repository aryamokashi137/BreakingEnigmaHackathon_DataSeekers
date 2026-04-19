import os
import httpx
import json
import re
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

    all_text = " ".join(c["text"] for c in chunks)
    words = all_text.split()

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

    prompt = f"""You are a legal assistant AI. Summarize the following legal document clearly and concisely.

Document Content:
{all_text}

Provide the summary in this format:
**Overview:** (2-3 sentences)
**Key Points:** (bullet list)
**Important Arguments:** (bullet list)
**Conclusion:** (if present, else write "Not specified")"""

    return _call_llm(prompt, max_tokens=1024)


# ── LEGAL RESEARCH (live web search + context-aware) ──────────────────────────

def _web_search(query: str, max_results: int = 5) -> list[dict]:
    """Search DuckDuckGo and return top results."""
    try:
        from duckduckgo_search import DDGS
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "title":   r.get("title", ""),
                    "snippet": r.get("body", ""),
                    "url":     r.get("href", ""),
                })
        return results
    except Exception as e:
        return [{"title": "Search unavailable", "snippet": str(e), "url": ""}]


def _build_search_query(user_query: str, case_context: str) -> str:
    """Ask Claude to generate a precise legal search query."""
    prompt = f"""You are a legal research assistant. Generate a precise web search query to find relevant Indian laws, IPC sections, articles, petitions, or case precedents.

User Question: {user_query}

Case Context (brief):
{case_context[:500] if case_context else 'No case context provided.'}

Generate ONE concise search query (max 10 words) optimized for finding Indian legal information.
Return ONLY the search query. No explanation. No quotes."""
    try:
        return _call_llm(prompt, max_tokens=30).strip().strip('"').strip("'")
    except Exception:
        return user_query


def legal_research(query: str, case_context: str = "") -> str:
    # Step 1: Build precise search query using case context
    search_query = _build_search_query(query, case_context)

    # Step 2: Live web search
    results = _web_search(f"{search_query} India law", max_results=5)

    # Step 3: Format search results
    search_text = ""
    sources = []
    for i, r in enumerate(results, 1):
        if r["snippet"]:
            search_text += f"[Source {i}] {r['title']}\n{r['snippet']}\n\n"
        if r["url"]:
            sources.append(f"{i}. {r['title']} — {r['url']}")

    # Step 4: Claude synthesizes answer from live results + case context
    prompt = f"""You are an expert Indian legal research assistant.

A lawyer asked: "{query}"

{f'Case Context:{chr(10)}{case_context[:800]}' if case_context else ''}

Live web search results for "{search_query}":

{search_text if search_text else 'No web results found. Use your legal knowledge.'}

Based on the search results and your legal knowledge, provide a comprehensive answer.

Format your response as:
**Legal Provision:** (specific law, IPC section, article, or act name)
**Explanation:** (clear explanation in simple language)
**Key Points:** (bullet list of important aspects)
**Relevant to This Case:** (how this applies to the case context above, if provided)
**Practical Implications:** (what the lawyer should do next)

Be accurate, cite specific section numbers, and focus on Indian law."""

    answer = _call_llm(prompt, max_tokens=1500)

    if sources:
        answer += "\n\n**Sources:**\n" + "\n".join(sources)

    return answer


# ── CASE LIFECYCLE + SMART AGENT ──────────────────────────────────────────────

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
    raw = re.sub(r"```(?:json)?\n?", "", raw).strip().rstrip("`")
    try:
        return json.loads(raw)
    except Exception:
        return {
            "timeline": [], "parties": [],
            "case_type": "Unknown", "current_stage": "Unknown",
            "legal_issues": [], "key_events": [], "raw": raw,
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
        return {"strengths": [], "risks": [], "next_steps": [], "strategy": [], "raw": raw}


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


# ── AGENTIC INTENT CLASSIFIER (improved) ──────────────────────────────────────

def detect_intent(query: str) -> str:
    prompt = f"""You are the routing brain of an AI legal assistant.

Classify the user query into EXACTLY one of these three categories:
- document_qa    → asking about FACTS in uploaded documents (who are parties, what happened, evidence, dates in the case, arguments made)
- summarize      → request to summarize, give overview, brief, or outline a document
- legal_research → asking about laws, acts, IPC sections, articles, constitutional provisions, petitions, legal procedures, OR asking for laws/sections RELEVANT TO or APPLICABLE TO a case

CRITICAL RULES (override everything else):
- "laws relevant to this case" → legal_research (NOT document_qa)
- "applicable sections for this case" → legal_research
- "what laws apply here" → legal_research
- "petitions related to this" → legal_research
- "give me family/property/criminal laws" → legal_research
- "search for laws" → legal_research
- Only use document_qa when asking about FACTS that exist IN the document (names, dates, what was filed, what was argued)
- summarize wins if the query contains: summarize, summary, overview, brief, outline, gist

Respond with ONLY one word: document_qa, summarize, or legal_research

User Query: {query}

Category:"""

    try:
        result = _call_llm(prompt, max_tokens=10).strip().lower()
        if "summarize" in result:
            return "summarize"
        if "legal_research" in result or "research" in result:
            return "legal_research"
        return "document_qa"
    except Exception:
        # Keyword fallback
        q = query.lower()
        if any(k in q for k in ("summarize", "summary", "overview", "brief", "outline", "gist")):
            return "summarize"
        if any(k in q for k in ("law", "laws", "section", "article", "ipc", "act", "petition",
                                 "constitution", "clause", "statute", "relevant law",
                                 "applicable", "search", "find law")):
            return "legal_research"
        return "document_qa"
