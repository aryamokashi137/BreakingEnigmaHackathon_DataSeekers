from datetime import datetime
from bson import ObjectId
from uuid import uuid4
from database import get_db


def _serialize_case(case: dict) -> dict:
    """Convert MongoDB case document to JSON-serializable dict."""
    if case is None:
        return None
    case["_id"] = str(case["_id"])
    return case


async def create_case(data: dict) -> dict:
    db = get_db()
    now = datetime.utcnow()
    case_doc = {
        "title": data["title"].strip(),
        "client_name": data["client_name"].strip(),
        "case_type": data.get("case_type", "General"),
        "status": data.get("status", "Active"),
        "description": data.get("description", "").strip(),
        "created_at": now,
        "updated_at": now,
        "notes": [],
        "deadlines": [],
        "documents": [],
    }
    result = await db.cases.insert_one(case_doc)
    case_doc["_id"] = str(result.inserted_id)
    return case_doc


async def get_all_cases() -> list:
    db = get_db()
    cursor = db.cases.find({}).sort("created_at", -1)
    cases = await cursor.to_list(length=None)  # None = no limit
    return [_serialize_case(c) for c in cases]


async def get_case_by_id(case_id: str) -> dict:
    db = get_db()
    try:
        case = await db.cases.find_one({"_id": ObjectId(case_id)})
    except Exception:
        return None
    return _serialize_case(case)


async def add_note(case_id: str, content: str) -> dict:
    db = get_db()
    note = {
        "id": str(uuid4()),
        "content": content,
        "created_at": datetime.utcnow(),
    }
    await db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {"$push": {"notes": note}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return note


async def add_deadline(case_id: str, title: str, due_date: str) -> dict:
    db = get_db()
    deadline = {
        "id": str(uuid4()),
        "title": title,
        "due_date": due_date,
        "completed": False,
    }
    await db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {"$push": {"deadlines": deadline}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return deadline


async def toggle_deadline(case_id: str, deadline_id: str) -> bool:
    db = get_db()
    case = await db.cases.find_one({"_id": ObjectId(case_id)})
    if not case:
        return False
    for d in case.get("deadlines", []):
        if d["id"] == deadline_id:
            d["completed"] = not d["completed"]
            break
    await db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {"$set": {"deadlines": case["deadlines"], "updated_at": datetime.utcnow()}},
    )
    return True


async def add_document(case_id: str, filename: str, original_name: str) -> dict:
    db = get_db()
    doc = {
        "id": str(uuid4()),
        "filename": filename,
        "original_name": original_name,
        "uploaded_at": datetime.utcnow(),
    }
    await db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {"$push": {"documents": doc}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return doc


async def get_document_info(case_id: str, document_id: str) -> dict:
    """Get a specific document's info from a case."""
    case = await get_case_by_id(case_id)
    if not case:
        return None
    for doc in case.get("documents", []):
        if doc["id"] == document_id:
            return doc
    return None


async def delete_document(case_id: str, document_id: str) -> bool:
    """Delete a document from a case."""
    db = get_db()
    result = await db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {"$pull": {"documents": {"id": document_id}}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return result.modified_count > 0
