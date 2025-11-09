from typing import Optional, List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    app_name: str = "Andori API"
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    openai_temperature: float = 0.7
    cors_origins: Union[str, List[str], None] = (
        ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    sqlalchemy_url: Optional[str] = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        default = ["http://localhost:3000", "http://127.0.0.1:3000"]
        if value is None or value == "":
            return default
        if isinstance(value, list):
            return [cls._normalize_origin(item) for item in value if isinstance(item, str)]
        if isinstance(value, str):
            # Supports comma separated values or JSON-style list strings
            value = value.strip()
            if value.startswith("[") and value.endswith("]"):
                try:
                    import json

                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [
                            cls._normalize_origin(item)
                            for item in parsed
                            if isinstance(item, str) and item.strip()
                        ]
                except json.JSONDecodeError:
                    pass
            return [
                cls._normalize_origin(origin)
                for origin in value.split(",")
                if origin.strip()
            ]
        return default

    @staticmethod
    def _normalize_origin(origin: str) -> str:
        cleaned = origin.strip()
        if cleaned.endswith("/"):
            cleaned = cleaned[:-1]
        if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
            cleaned = f"http://{cleaned}"
        return cleaned

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignora campos extras do .env


settings = Settings()


