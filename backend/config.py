from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "legal_assistant"
    AI_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"

    class Config:
        env_file = ".env"


settings = Settings()
