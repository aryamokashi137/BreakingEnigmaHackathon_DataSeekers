import os
from PyPDF2 import PdfReader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

FAISS_INDEX_PATH = "faiss_index_new"

class RAGService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.db = None
        self.load_or_create_db()

    def load_or_create_db(self):
        if os.path.exists(FAISS_INDEX_PATH):
            self.db = FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
        else:
            empty_doc = Document(page_content="initialization", metadata={"source": "system"})
            self.db = FAISS.from_documents([empty_doc], self.embeddings)
            self.save_db()

    @property
    def index_path(self):
        return FAISS_INDEX_PATH

    def save_db(self):
        if self.db:
            self.db.save_local(self.index_path)

    def process_pdf(self, file_path: str, case_id: int, filename: str):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
        
        # Simple chunking
        chunk_size = 500
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        
        documents = []
        for chunk in chunks:
            if chunk.strip():
                doc = Document(
                    page_content=chunk.strip(),
                    metadata={"case_id": str(case_id), "filename": filename}
                )
                documents.append(doc)
        
        if documents:
            self.db.add_documents(documents)
            self.save_db()
            print(f"Added {len(documents)} chunks to FAISS for case {case_id}")

    def query(self, query_text: str):
        docs = self.db.similarity_search(query_text, k=3)
        context_used = [doc.page_content for doc in docs if doc.metadata.get("source") != "system"]
        
        # Simple logic for answer as requested (no external API)
        if context_used:
            answer = "Based on the documents, here is the relevant information:\n" + "\n---\n".join(context_used)
        else:
            answer = "No relevant information found in the uploaded documents."
            
        return {
            "answer": answer,
            "context_used": context_used
        }

rag_service = RAGService()
