"""
Legacy data model definitions for the Legal RAG Pipeline.

This module originally contained SQLAlchemy ORM models. It now exposes plain
Python dataclasses with the same entity names so the rest of the application
can keep using familiar objects while MongoDB handles persistence.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field, fields
from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid


def utcnow() -> datetime:
    """Return a UTC timestamp for default field values."""
    return datetime.utcnow()


def generate_id() -> str:
    """Generate a Mongo-friendly string identifier."""
    return uuid.uuid4().hex


@dataclass
class MongoDocument:
    """Base dataclass with helpers for MongoDB serialization."""

    id: str = field(default_factory=generate_id)

    def to_mongo(self) -> Dict[str, Any]:
        data = asdict(self)
        data["_id"] = data.pop("id")
        return data

    @classmethod
    def from_mongo(cls, document: Optional[Dict[str, Any]]) -> Optional["MongoDocument"]:
        if not document:
            return None

        payload = dict(document)
        payload["id"] = str(payload.pop("_id", payload.get("id", generate_id())))
        valid_fields = {field_info.name for field_info in fields(cls)}
        filtered_payload = {key: value for key, value in payload.items() if key in valid_fields}
        return cls(**filtered_payload)


@dataclass
class Client(MongoDocument):
    """
    Client record for storing personal details and case relationships.
    """

    created_at: datetime = field(default_factory=utcnow)
    last_updated: datetime = field(default_factory=utcnow)
    client_details: Dict[str, Any] = field(default_factory=dict)
    name: str = ""
    notes: str = ""

    @property
    def email(self) -> str:
        return self.client_details.get("email", "") if self.client_details else ""

    @property
    def phone(self) -> str:
        return self.client_details.get("phone", "") if self.client_details else ""

    @property
    def address(self) -> str:
        return self.client_details.get("address", "") if self.client_details else ""

    @property
    def date_of_birth(self) -> str:
        return self.client_details.get("date_of_birth", "") if self.client_details else ""

    @property
    def gender(self) -> str:
        return self.client_details.get("gender", "") if self.client_details else ""

    @property
    def occupation(self) -> str:
        return self.client_details.get("occupation", "") if self.client_details else ""


@dataclass
class Case(MongoDocument):
    """
    Case record containing legal case metadata and the linked client ID.
    """

    client_id: str = ""
    name: str = ""
    jurisdiction_code: str = ""
    court_level: str = ""
    legal_issue: str = ""
    notes: str = ""
    case_type: str = ""
    case_status: str = ""
    created_at: datetime = field(default_factory=utcnow)


@dataclass
class VectorStore(MongoDocument):
    """
    Vector store record pointing to the FAISS directory for a case.
    """

    type: str = "Case"
    description: str = ""
    case_id: str = ""
    file_path: str = ""
    created_at: datetime = field(default_factory=utcnow)


@dataclass
class SourceDocument(MongoDocument):
    """
    Source document metadata for uploaded or scraped content.
    """

    case_id: str = ""
    source_name: str = ""
    title: str = ""
    description: str = ""
    language: str = ""
    chunk_ids: List[str] = field(default_factory=list)
    uploaded_at: datetime = field(default_factory=utcnow)


@dataclass
class ChatHistory(MongoDocument):
    """
    Chat history entry storing a question, answer, and referenced chunks.
    """

    case_id: str = ""
    user_prompt: str = ""
    assistant_response: str = ""
    timestamp: datetime = field(default_factory=utcnow)
    chunk_ids: List[str] = field(default_factory=list)
