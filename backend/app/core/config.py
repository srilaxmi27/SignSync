"""
Application configuration.

Settings are loaded from environment variables (and an optional .env file).
No secrets or hardcoded configuration values live here.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PORT: int = 8000
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    APP_NAME: str = "SignSync Backend"
    APP_VERSION: str = "1.0.0"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse the comma-separated ALLOWED_ORIGINS string into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
