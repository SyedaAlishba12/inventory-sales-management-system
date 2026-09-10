import json
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Inventory & Sales Management System"
    app_version: str = "1.0.0"
    app_env: Literal["development", "testing", "production"] = "development"
    debug: bool = False

    database_url: str = (
        "postgresql+asyncpg://example_user:example_password@localhost:5432/example_database"
    )
    database_echo: bool = False
    database_pool_size: int = Field(default=5, ge=1, le=50)
    database_max_overflow: int = Field(default=10, ge=0, le=100)
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        value = self.cors_origins.strip()
        if not value:
            return []
        if value.startswith("["):
            parsed = json.loads(value)
            if not isinstance(parsed, list):
                raise ValueError("CORS_ORIGINS JSON value must be an array")
            return [str(origin).strip() for origin in parsed if str(origin).strip()]
        return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
