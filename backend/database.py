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
