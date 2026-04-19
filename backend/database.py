from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client["legal_assistant"]

cases_collection = db["cases"]
documents_collection = db["documents"]
chats_collection = db["chats"]
lawyers_collection = db["lawyers"]

# ── Seed dummy lawyers (runs once) ────────────────────────────────────────────
DUMMY_LAWYERS = [
    {"lawyer_id": "LAW001", "name": "Arjun Mehta",    "specialization": "Criminal Law",  "bar_council": "Maharashtra", "experience": "8 years"},
    {"lawyer_id": "LAW002", "name": "Priya Sharma",   "specialization": "Civil Law",     "bar_council": "Delhi",       "experience": "5 years"},
    {"lawyer_id": "LAW003", "name": "Rahul Desai",    "specialization": "Corporate Law", "bar_council": "Gujarat",     "experience": "12 years"},
    {"lawyer_id": "LAW004", "name": "Sneha Kulkarni", "specialization": "Family Law",   "bar_council": "Karnataka",   "experience": "3 years"},
]

for lawyer in DUMMY_LAWYERS:
    if not lawyers_collection.find_one({"lawyer_id": lawyer["lawyer_id"]}):
        lawyers_collection.insert_one(lawyer)
