"""
Database Manager for Legal RAG Pipeline
=======================================

This module provides MongoDB-backed metadata management alongside the
existing FAISS vector store layer used for semantic retrieval.
"""

from __future__ import annotations

import os
import re
from collections import deque
from datetime import datetime
from typing import Iterable, List, Optional
from urllib.parse import urlparse

from .sql_classes import Case, ChatHistory, Client, SourceDocument, VectorStore
from .vector_database import VectorStoreManager

try:
    from pymongo import ASCENDING, MongoClient
except ImportError:  # pragma: no cover - handled at runtime when MongoDB is used
    ASCENDING = 1
    MongoClient = None

try:
    import mongomock
except ImportError:  # pragma: no cover - optional development fallback
    mongomock = None


class DatabaseManager:
    """
    Central manager for MongoDB metadata and case-specific vector stores.
    """

    DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/legal_rag"

    def __init__(self, root_vector_db_dir: str, mongo_uri: str, database_name: Optional[str] = None):
        """
        Initialize the database manager with MongoDB and vector store settings.

        Args:
            root_vector_db_dir: Directory path for storing vector databases
            mongo_uri: MongoDB connection string
            database_name: Optional database override when the URI omits it
        """
        use_mock_mongo = os.getenv("MONGODB_USE_MOCK", "false").lower() == "true"

        if MongoClient is None and not use_mock_mongo:
            raise ImportError(
                "pymongo is required for MongoDB support. "
                "Install dependencies with `pip install -r requirements.txt`."
            )

        if use_mock_mongo and mongomock is None:
            raise ImportError(
                "MONGODB_USE_MOCK is enabled but `mongomock` is not installed. "
                "Install dependencies with `pip install -r requirements.txt`."
            )

        self.root_vector_db_dir = root_vector_db_dir
        self.mongo_uri = self._normalize_mongo_uri(mongo_uri, use_mock_mongo)
        self.database_name = self._resolve_database_name(self.mongo_uri, database_name)
        if use_mock_mongo:
            self.mongo_client = mongomock.MongoClient()
        else:
            self.mongo_client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
        self.db = self.mongo_client[self.database_name]
        self.db.command("ping")

        self.clients_collection = self.db["clients"]
        self.cases_collection = self.db["cases"]
        self.vector_stores_collection = self.db["vector_stores"]
        self.source_documents_collection = self.db["uploaded_documents"]
        self.chat_history_collection = self.db["chat_history"]
        self._ensure_indexes()

        self.case_vector_store_manager = None
        self.conversation_history = deque(maxlen=25)
        self.client = None
        self.case = None

    @classmethod
    def _normalize_mongo_uri(cls, mongo_uri: Optional[str], use_mock_mongo: bool) -> str:
        value = (mongo_uri or "").strip()

        if not value:
            if use_mock_mongo:
                return os.getenv("MONGODB_MOCK_URI", cls.DEFAULT_MONGO_URI)
            raise ValueError("A MongoDB connection string is required.")

        if value.startswith("mongosh"):
            match = re.search(r'(mongodb(?:\+srv)?://[^"\s]+)', value)
            if match:
                value = match.group(1)
            elif use_mock_mongo:
                return os.getenv("MONGODB_MOCK_URI", cls.DEFAULT_MONGO_URI)
            else:
                raise ValueError(
                    "DATABASE_URL must be a MongoDB connection URI, not a `mongosh ...` command."
                )

        if value.startswith(("mongodb://", "mongodb+srv://")):
            return value

        if use_mock_mongo:
            return os.getenv("MONGODB_MOCK_URI", cls.DEFAULT_MONGO_URI)

        raise ValueError("DATABASE_URL must start with `mongodb://` or `mongodb+srv://`.")

    @staticmethod
    def _resolve_database_name(mongo_uri: str, database_name: Optional[str]) -> str:
        if database_name:
            return database_name

        parsed_uri = urlparse(mongo_uri)
        uri_database_name = parsed_uri.path.lstrip("/")
        if uri_database_name:
            return uri_database_name.split("/")[0]

        return os.getenv("MONGODB_DB_NAME", "legal_rag")

    def _ensure_indexes(self) -> None:
        self.clients_collection.create_index([("name", ASCENDING)])
        self.cases_collection.create_index([("name", ASCENDING)])
        self.cases_collection.create_index([("client_id", ASCENDING)])
        self.vector_stores_collection.create_index([("case_id", ASCENDING)])
        self.source_documents_collection.create_index([("case_id", ASCENDING)])
        self.source_documents_collection.create_index([("source_name", ASCENDING)])
        self.chat_history_collection.create_index([("case_id", ASCENDING), ("timestamp", ASCENDING)])

    @staticmethod
    def _hydrate(model_class, document):
        return model_class.from_mongo(document) if document else None

    @staticmethod
    def _hydrate_many(model_class, documents: Iterable[dict]) -> List:
        return [model_class.from_mongo(document) for document in documents]

    @staticmethod
    def _name_filter(field_name: str, value: Optional[str]) -> dict:
        if not value:
            return {}
        return {field_name: {"$regex": re.escape(str(value)), "$options": "i"}}

    @staticmethod
    def _build_client_details(payload: dict) -> dict:
        client_details = dict(payload.get("client_details") or {})
        for key in ("email", "phone", "address", "date_of_birth", "gender", "occupation"):
            if key in payload and payload[key] is not None:
                client_details[key] = payload[key]
        return client_details

    def initialize_from_case(self, case: Case):
        """
        Initialize state for a specific case and load its vector/chat history.
        """
        fresh_case = self.get_case_by_id(case.id) or case
        self.case = fresh_case
        self.client = self.get_client_by_id(fresh_case.client_id) if fresh_case.client_id else None

        store = self.get_case_vector_store()
        self.case_vector_store_manager = VectorStoreManager(file_path=store.file_path if store else None)
        if not store:
            self.add_case_vector_store()

        self.conversation_history.clear()
        chats = self.get_chat_history()
        self.conversation_history.extend((chat.user_prompt, chat.assistant_response) for chat in chats)

    def get_client_by_id(self, client_id):
        if not client_id:
            return None
        return self._hydrate(Client, self.clients_collection.find_one({"_id": str(client_id)}))

    def get_cases_by_client_id(self, client_id):
        if not client_id:
            return []
        cursor = self.cases_collection.find({"client_id": str(client_id)}).sort("created_at", ASCENDING)
        return self._hydrate_many(Case, cursor)

    def get_clients_by_case_id(self, case_id):
        case = self.get_case_by_id(case_id)
        if not case or not case.client_id:
            return None
        return self.get_client_by_id(case.client_id)

    def get_cases_by_name(self, name):
        cursor = self.cases_collection.find(self._name_filter("name", name)).sort("created_at", ASCENDING)
        return self._hydrate_many(Case, cursor)

    def get_case_by_id(self, case_id):
        if not case_id:
            return None
        return self._hydrate(Case, self.cases_collection.find_one({"_id": str(case_id)}))

    def get_clients_by_name(self, name):
        filter_doc = self._name_filter("name", name)
        if self.case and self.case.client_id:
            filter_doc["_id"] = self.case.client_id
        cursor = self.clients_collection.find(filter_doc).sort("name", ASCENDING)
        return self._hydrate_many(Client, cursor)

    def get_uploaded_documents(self):
        if not self.case:
            return []
        cursor = self.source_documents_collection.find({"case_id": self.case.id}).sort("uploaded_at", ASCENDING)
        return self._hydrate_many(SourceDocument, cursor)

    def get_chat_history(self):
        if not self.case:
            return []
        cursor = self.chat_history_collection.find({"case_id": self.case.id}).sort("timestamp", ASCENDING)
        return self._hydrate_many(ChatHistory, cursor)

    def get_case_vector_store(self):
        if not self.case:
            return None
        document = self.vector_stores_collection.find_one(
            {"case_id": self.case.id},
            sort=[("created_at", ASCENDING)],
        )
        return self._hydrate(VectorStore, document)

    def get_vector_store_by_id(self, vector_store_id):
        if not vector_store_id:
            return None
        return self._hydrate(VectorStore, self.vector_stores_collection.find_one({"_id": str(vector_store_id)}))

    def get_uploaded_documents_by_name(self, names):
        if not self.case:
            raise ValueError("Case must be set before retrieving documents by name.")

        if isinstance(names, str):
            names = [names]

        if not names:
            return []

        cursor = self.source_documents_collection.find(
            {
                "case_id": self.case.id,
                "source_name": {"$in": list(names)},
            }
        )
        return self._hydrate_many(SourceDocument, cursor)

    def add_client(self, **kwargs):
        client_data = {
            "name": kwargs.get("name", ""),
            "notes": kwargs.get("notes", ""),
            "client_details": self._build_client_details(kwargs),
            "created_at": kwargs.get("created_at") or datetime.utcnow(),
            "last_updated": kwargs.get("last_updated") or datetime.utcnow(),
        }
        if kwargs.get("id"):
            client_data["id"] = str(kwargs["id"])

        client = Client(**client_data)
        self.clients_collection.insert_one(client.to_mongo())
        return client

    def add_case_client(self, case: Case, client: Client = None, **kwargs):
        if client is None:
            client = self.add_client(**kwargs)
        else:
            existing_client = self.get_client_by_id(client.id)
            if not existing_client:
                self.clients_collection.insert_one(client.to_mongo())
            else:
                client = existing_client

        update_result = self.cases_collection.update_one(
            {"_id": case.id},
            {"$set": {"client_id": client.id}},
        )
        if update_result.matched_count == 0:
            raise ValueError("Case must exist before linking a client.")

        case.client_id = client.id
        if self.case and self.case.id == case.id:
            self.case = self.get_case_by_id(case.id)
            self.client = client

        return client

    def add_case(self, **kwargs):
        case_data = {
            "client_id": str(kwargs.get("client_id", "") or ""),
            "name": kwargs.get("name", ""),
            "jurisdiction_code": kwargs.get("jurisdiction_code", ""),
            "court_level": kwargs.get("court_level", ""),
            "legal_issue": kwargs.get("legal_issue", ""),
            "notes": kwargs.get("notes", ""),
            "case_type": kwargs.get("case_type", ""),
            "case_status": kwargs.get("case_status", ""),
            "created_at": kwargs.get("created_at") or datetime.utcnow(),
        }
        if kwargs.get("id"):
            case_data["id"] = str(kwargs["id"])

        case = Case(**case_data)
        self.cases_collection.insert_one(case.to_mongo())
        return case

    def add_case_vector_store(self):
        if not self.case:
            raise ValueError("Case must be set before creating a vector store.")

        existing_store = self.get_case_vector_store()
        if existing_store:
            return existing_store

        if not self.case_vector_store_manager:
            self.case_vector_store_manager = VectorStoreManager()

        os.makedirs(self.root_vector_db_dir, exist_ok=True)
        vector_store_dir = os.path.join(self.root_vector_db_dir, f"vector_store_{self.case.id}")
        os.makedirs(vector_store_dir, exist_ok=True)
        self.case_vector_store_manager.save_vector_store(vector_store_dir)

        store = VectorStore(case_id=self.case.id, file_path=vector_store_dir)
        self.vector_stores_collection.insert_one(store.to_mongo())
        return store

    def add_case_chat_history(self, user_prompt, assistant_response):
        if not self.case or not self.case_vector_store_manager:
            raise ValueError("Case and vector store manager must be set before adding chat history.")

        chunk_ids = self.case_vector_store_manager._index_document(user_prompt, {"type": "chat"}) or []
        chat = ChatHistory(
            case_id=self.case.id,
            user_prompt=user_prompt,
            assistant_response=assistant_response,
            chunk_ids=chunk_ids,
        )
        self.chat_history_collection.insert_one(chat.to_mongo())
        self.conversation_history.append((user_prompt, assistant_response))
        return chat

    def _add_source_documents(self, meta_datas):
        if not self.case:
            raise ValueError("Case must be set before adding source documents.")

        documents = []
        for meta in meta_datas:
            documents.append(
                SourceDocument(
                    case_id=self.case.id,
                    source_name=meta.get("source_name") or meta.get("source", ""),
                    title=meta.get("title", ""),
                    description=meta.get("description", ""),
                    language=meta.get("language", ""),
                    chunk_ids=meta.get("chunk_ids", []),
                )
            )

        if documents:
            self.source_documents_collection.insert_many([document.to_mongo() for document in documents])

        return documents

    def add_web_documents(self, urls, source_type="uploaded"):
        doc_meta_datas = self.case_vector_store_manager.index_web_documents(urls, source_type)
        return self._add_source_documents(doc_meta_datas)

    def add_file_documents(self, file_paths, source_type="uploaded"):
        doc_meta_datas = self.case_vector_store_manager.index_file_documents(file_paths, source_type)
        return self._add_source_documents(doc_meta_datas)

    def query_documents(self, query, k=5, meta_filter=None):
        return self.case_vector_store_manager.query_vector_store(query, k=k, meta_filter=meta_filter)

    def delete_documents(self, ids):
        document_ids = [str(document_id) for document_id in ids if document_id]
        if not document_ids:
            return False

        filter_doc = {"_id": {"$in": document_ids}}
        if self.case:
            filter_doc["case_id"] = self.case.id

        documents = self._hydrate_many(SourceDocument, self.source_documents_collection.find(filter_doc))
        if not documents:
            return False

        uuids_to_delete = []
        for document in documents:
            uuids_to_delete.extend(document.chunk_ids)

        self.source_documents_collection.delete_many({"_id": {"$in": [document.id for document in documents]}})
        self.case_vector_store_manager.delete_documents(uuids_to_delete)
        return True

    def update_case(self, case_id, **kwargs):
        case = self.get_case_by_id(case_id)
        if not case:
            return None

        updates = {}
        for field_name in ("name", "jurisdiction_code", "court_level", "legal_issue", "notes", "case_type", "case_status", "client_id"):
            if field_name in kwargs:
                updates[field_name] = str(kwargs[field_name]) if field_name == "client_id" and kwargs[field_name] is not None else kwargs[field_name]

        if updates:
            self.cases_collection.update_one({"_id": case.id}, {"$set": updates})

        updated_case = self.get_case_by_id(case_id)
        if self.case and updated_case and self.case.id == updated_case.id:
            self.case = updated_case
            self.client = self.get_client_by_id(updated_case.client_id) if updated_case.client_id else None

        return updated_case

    def update_client(self, client_id, **kwargs):
        client = self.get_client_by_id(client_id)
        if not client:
            return None

        client_details = dict(client.client_details or {})
        nested_details = kwargs.get("client_details") or {}

        for key in ("email", "phone", "address", "date_of_birth", "gender", "occupation"):
            if key in kwargs and kwargs[key] is not None:
                client_details[key] = kwargs[key]
            if key in nested_details and nested_details[key] is not None:
                client_details[key] = nested_details[key]

        updates = {
            "client_details": client_details,
            "last_updated": datetime.utcnow(),
        }
        if "name" in kwargs:
            updates["name"] = kwargs["name"]
        if "notes" in kwargs:
            updates["notes"] = kwargs["notes"]

        self.clients_collection.update_one({"_id": client.id}, {"$set": updates})
        updated_client = self.get_client_by_id(client_id)

        if self.client and updated_client and self.client.id == updated_client.id:
            self.client = updated_client

        return updated_client

    def save_all(self):
        if not self.case or not self.case_vector_store_manager:
            return False

        vector_path = os.path.join(self.root_vector_db_dir, f"vector_store_{self.case.id}")
        return bool(self.case_vector_store_manager.save_vector_store(vector_path))
