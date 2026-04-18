import sys
import os

# Add backend directory to sys.path to allow imports from services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.vector_store import vector_store
from langchain_core.documents import Document

# Mock data simulating Indian Legal Data
MOCK_DATA = [
    {
        "content": "Section 420 of the Indian Penal Code (IPC) deals with Cheating and dishonestly inducing delivery of property. Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
        "metadata": {
            "section_type": "IPC",
            "document_name": "Indian Penal Code, 1860"
        }
    },
    {
        "content": "Section 302 of the Indian Penal Code (IPC) prescribes the punishment for murder. Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
        "metadata": {
            "section_type": "IPC",
            "document_name": "Indian Penal Code, 1860"
        }
    },
    {
        "content": "Section 438 of the Code of Criminal Procedure (CrPC) deals with Direction for grant of bail to person apprehending arrest (Anticipatory Bail). When any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section.",
        "metadata": {
            "section_type": "CrPC",
            "document_name": "Code of Criminal Procedure, 1973"
        }
    },
    {
        "content": "Case Law: Arnesh Kumar vs State of Bihar (2014) 8 SCC 273. The Supreme Court laid down guidelines to ensure that police officers do not arrest accused unnecessarily and magistrate do not authorise detention casually and mechanically under Section 498-A IPC.",
        "metadata": {
            "section_type": "CaseLaw",
            "document_name": "Arnesh Kumar vs State of Bihar"
        }
    }
]

def seed_data():
    print("Seeding mock Indian Legal Data into Vector Store...")
    try:
        documents = []
        for item in MOCK_DATA:
            doc = Document(
                page_content=item["content"],
                metadata=item["metadata"]
            )
            documents.append(doc)
        
        vector_store.add_documents(documents)
        print(f"Successfully added {len(documents)} documents to FAISS.")
    except Exception as e:
        print(f"Error seeding data: {str(e)}")

if __name__ == "__main__":
    seed_data()
