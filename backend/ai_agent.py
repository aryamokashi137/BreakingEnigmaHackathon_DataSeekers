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
