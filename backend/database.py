from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


class Database:
    client: AsyncIOMotorClient = None
    db = None


database = Database()


async def connect_db():
    database.client = AsyncIOMotorClient(settings.MONGODB_URI)
    database.db = database.client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_db():
    if database.client:
        database.client.close()
        print("MongoDB connection closed")


def get_db():
    return database.db
