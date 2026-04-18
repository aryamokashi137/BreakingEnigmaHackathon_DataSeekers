import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from config import settings

class VectorStore:
    def __init__(self):
        self.index_path = settings.FAISS_INDEX_PATH
        # Use a small, fast local model for embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.db = None

    def _init_embeddings(self):
        # Already initialized in __init__
        pass

    def load_or_create_db(self):
        self._init_embeddings()
        if os.path.exists(self.index_path):
            self.db = FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
        else:
            # Create an empty index
            empty_doc = Document(page_content="initialization", metadata={"source": "system"})
            self.db = FAISS.from_documents([empty_doc], self.embeddings)
            self.save_db()

    def save_db(self):
        if self.db:
            self.db.save_local(self.index_path)

    def add_documents(self, documents: list[Document]):
        if not self.db:
            self.load_or_create_db()
        self.db.add_documents(documents)
        self.save_db()

    def similarity_search(self, query: str, k: int = 4, filter: dict = None):
        if not self.db:
            self.load_or_create_db()
        # FAISS local wrapper in langchain supports filtering for metadata
        if filter:
            return self.db.similarity_search(query, k=k, filter=filter)
        return self.db.similarity_search(query, k=k)

    def delete_by_case(self, case_id: str):
        if not self.db:
            return
        ids_to_delete = []
        for doc_id, doc in self.db.docstore._dict.items():
            if doc.metadata.get("case_id") == str(case_id):
                ids_to_delete.append(doc_id)
        if ids_to_delete:
            self.db.delete(ids_to_delete)
            self.save_db()

    def delete_document(self, case_id: str, document_name: str):
        if not self.db:
            return
        ids_to_delete = []
        for doc_id, doc in self.db.docstore._dict.items():
            # Sometimes source holds full path, we match the end of it
            source = doc.metadata.get("source", "")
            if doc.metadata.get("case_id") == str(case_id) and source.endswith(document_name):
                ids_to_delete.append(doc_id)
        if ids_to_delete:
            self.db.delete(ids_to_delete)
            self.save_db()

vector_store = VectorStore()
