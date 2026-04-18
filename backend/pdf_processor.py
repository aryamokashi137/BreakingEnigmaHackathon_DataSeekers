import fitz  # PyMuPDF
import docx
import os

def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
        return text.strip()

    elif ext in (".doc", ".docx"):
        doc = docx.Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()

    # Images and unsupported types — return empty
    return ""


def chunk_text(text: str, case_id: str, doc_name: str, chunk_size: int = 700, overlap: int = 100):
    words = text.split()
    chunks = []
    i = 0
    idx = 0
    while i < len(words):
        chunk_words = words[i: i + chunk_size]
        chunks.append({
            "text": " ".join(chunk_words),
            "case_id": case_id,
            "doc_name": doc_name,
            "chunk_index": idx,
        })
        i += chunk_size - overlap
        idx += 1
    return chunks
