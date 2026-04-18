from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from models.case import Case, Note, Deadline, Document
from datetime import datetime

async def create_case(db: AsyncSession, data: dict) -> Case:
    new_case = Case(
        title=data["title"],
        client_name=data["client_name"],
        fir_number=data.get("fir_number"),
        case_type=data.get("case_type", "General"),
        description=data.get("description", ""),
        status="Active"
    )
    db.add(new_case)
    await db.commit()
    
    # Reload with relationships for serialization
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Case)
        .where(Case.id == new_case.id)
        .options(
            selectinload(Case.notes),
            selectinload(Case.deadlines),
            selectinload(Case.documents)
        )
    )
    return result.scalar_one()

async def get_all_cases(db: AsyncSession) -> list[Case]:
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Case)
        .options(
            selectinload(Case.notes),
            selectinload(Case.deadlines),
            selectinload(Case.documents)
        )
        .order_by(Case.created_at.desc())
    )
    return result.scalars().all()

async def get_case_by_id(db: AsyncSession, case_id: int) -> Case:
    # Use joinedload or similar if needed, but simple select works for basics
    # For full response with relationships, we might need options(selectinload(Case.notes), ...)
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Case)
        .where(Case.id == case_id)
        .options(
            selectinload(Case.notes),
            selectinload(Case.deadlines),
            selectinload(Case.documents)
        )
    )
    return result.scalar_one_or_none()

async def add_note(db: AsyncSession, case_id: int, content: str) -> Note:
    note = Note(case_id=case_id, content=content)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note

async def add_deadline(db: AsyncSession, case_id: int, title: str, due_date: str) -> Deadline:
    # Handle string to datetime conversion if necessary
    dt_due = datetime.fromisoformat(due_date.replace("Z", "+00:00")) if isinstance(due_date, str) else due_date
    deadline = Deadline(case_id=case_id, title=title, due_date=dt_due)
    db.add(deadline)
    await db.commit()
    await db.refresh(deadline)
    return deadline

async def toggle_deadline(db: AsyncSession, deadline_id: int) -> bool:
    result = await db.execute(select(Deadline).where(Deadline.id == deadline_id))
    deadline = result.scalar_one_or_none()
    if not deadline:
        return False
    deadline.completed = not deadline.completed
    await db.commit()
    return True

async def add_document(db: AsyncSession, case_id: int, filename: str, original_name: str) -> Document:
    doc = Document(case_id=case_id, filename=filename, original_name=original_name)
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc

async def get_document_info(db: AsyncSession, document_id: int) -> Document:
    result = await db.execute(select(Document).where(Document.id == document_id))
    return result.scalar_one_or_none()

async def delete_document(db: AsyncSession, document_id: int) -> bool:
    from services.vector_store import vector_store
    import os
    
    # Get document first to get filename
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    
    if not doc:
        return False
        
    # Remove from filesystem
    file_path = os.path.join("uploads", doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        
    # Remove from vector store
    vector_store.delete_document(str(doc.case_id), doc.filename)
        
    # Delete from DB
    await db.execute(delete(Document).where(Document.id == document_id))
    await db.commit()
    return True

async def delete_case(db: AsyncSession, case_id: int) -> bool:
    from services.vector_store import vector_store
    import os
    from sqlalchemy.orm import selectinload
    
    # Get the case and its documents
    result = await db.execute(
        select(Case).where(Case.id == case_id).options(selectinload(Case.documents))
    )
    case = result.scalar_one_or_none()
    
    if not case:
        return False
        
    # Remove all documents from filesystem
    for doc in case.documents:
        file_path = os.path.join("uploads", doc.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
    # Remove all case embeddings from vector store
    vector_store.delete_by_case(str(case_id))
    
    # Delete case from DB (Cascade will delete notes, deadlines, and document records)
    await db.execute(delete(Case).where(Case.id == case_id))
    await db.commit()
    return True
