"""
Supabase client singleton.

Use `get_db()` as a FastAPI dependency to get a typed Supabase client.
The service-role key is used here so the backend can bypass Row Level
Security for server-side operations. Never expose this key to the frontend.
"""

from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache(maxsize=1)
def _get_client() -> Client:
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file. "
            "See .env.example for instructions."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_db() -> Client:
    """FastAPI dependency — returns the Supabase service-role client."""
    return _get_client()
