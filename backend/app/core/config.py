from typing import Optional, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Andori API"
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    openai_temperature: float = 0.7
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    sqlalchemy_url: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignora campos extras do .env


settings = Settings()


