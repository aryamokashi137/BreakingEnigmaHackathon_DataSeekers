from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./legal_db.sqlite"
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    FAISS_INDEX_PATH: str = "./faiss_index"

    class Config:
        env_file = ".env"

settings = Settings()
