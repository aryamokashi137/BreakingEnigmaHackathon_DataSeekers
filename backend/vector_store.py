import faiss
import numpy as np
import os
import pickle
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

FAISS_DIR = "faiss_indexes"
os.makedirs(FAISS_DIR, exist_ok=True)

# In-memory store: case_id -> {"index": faiss_index, "chunks": [...]}
_store: dict = {}


def _index_path(case_id: str):
    return os.path.join(FAISS_DIR, f"{case_id}.pkl")


def _load_case(case_id: str):
    if case_id not in _store:
        path = _index_path(case_id)
        if os.path.exists(path):
            with open(path, "rb") as f:
                _store[case_id] = pickle.load(f)
        else:
            _store[case_id] = {"index": None, "chunks": []}
    return _store[case_id]


def _save_case(case_id: str):
    with open(_index_path(case_id), "wb") as f:
        pickle.dump(_store[case_id], f)


def add_chunks(case_id: str, chunks: list[dict]):
    if not chunks:
        return

    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=False).astype("float32")

    store = _load_case(case_id)

    if store["index"] is None:
        dim = embeddings.shape[1]
        store["index"] = faiss.IndexFlatL2(dim)

    store["index"].add(embeddings)
    store["chunks"].extend(chunks)

    _save_case(case_id)


def search(case_id: str, query: str, top_k: int = 5) -> list[dict]:
    store = _load_case(case_id)
    if store["index"] is None or store["index"].ntotal == 0:
        return []

    query_vec = model.encode([query], show_progress_bar=False).astype("float32")
    distances, indices = store["index"].search(query_vec, min(top_k, store["index"].ntotal))

    results = []
    for idx in indices[0]:
        if idx != -1:
            results.append(store["chunks"][idx])
    return results


def delete_case_index(case_id: str):
    path = _index_path(case_id)
    if os.path.exists(path):
        os.remove(path)
    _store.pop(case_id, None)
