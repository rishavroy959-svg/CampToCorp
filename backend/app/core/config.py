import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampToCorp"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "camptocorp-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    DATABASE_URL: str = "sqlite:///./camptocorp.db"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def resolve_sqlite_path(cls, v: str) -> str:
        if v.startswith("sqlite:///./"):
            db_rel_path = v[len("sqlite:///./"):]
            abs_db_path = os.path.join(BACKEND_DIR, db_rel_path).replace("\\", "/")
            return f"sqlite:///{abs_db_path}"
        return v

    class Config:
        case_sensitive = True
        env_file = (ENV_PATH, ".env")
        extra = "ignore"

settings = Settings()

