"""
System-level routes (health checks, version info).
"""

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["system"])


@router.get("/health")
async def health_check() -> dict:
    """Simple health check endpoint used by uptime monitors and the frontend."""
    settings = get_settings()
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
    }
