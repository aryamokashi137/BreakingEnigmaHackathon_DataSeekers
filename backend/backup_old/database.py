from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def connect_db():
    # In a production app, you might run alembic migrations here
    # or ensure connection is alive.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("SQLite Database connected and tables created")

async def close_db():
    await engine.dispose()
    print("SQLite Database connection closed")
