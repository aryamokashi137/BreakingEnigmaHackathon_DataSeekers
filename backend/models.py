from sqlalchemy import Column, Integer, String, Text
from database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    fir_number = Column(String, nullable=True)
    case_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=False)
    filename = Column(String, nullable=False)
