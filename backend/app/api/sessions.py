"""
Session management routes.

Authenticated users can create, list, and end their translation sessions.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from supabase import Client

from app.core.security import get_current_user_id
from app.db.supabase_client import get_db

router = APIRouter(prefix="/api/v1/sessions", tags=["sessions"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    title: str = Field(default="Translation session", max_length=200)
    type: str  = Field(default="translation")


class SessionEnd(BaseModel):
    accuracy: Optional[float] = Field(default=None, ge=0, le=100)
    notes: Optional[str] = None


class SessionOut(BaseModel):
    id:         str
    user_id:    str
    title:      str
    type:       str
    started_at: datetime
    ended_at:   Optional[datetime] = None
    duration_s: Optional[int]      = None
    accuracy:   Optional[float]    = None


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def create_session(
    body: SessionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Client  = Depends(get_db),
) -> SessionOut:
    """Start a new session for the authenticated user."""
    result = (
        db.table("sessions")
        .insert({"user_id": user_id, "title": body.title, "type": body.type})
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create session")
    return SessionOut(**result.data[0])


@router.get("", response_model=List[SessionOut])
async def list_sessions(
    limit: int = 20,
    user_id: str = Depends(get_current_user_id),
    db: Client  = Depends(get_db),
) -> List[SessionOut]:
    """Return the most recent sessions for the authenticated user."""
    result = (
        db.table("sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [SessionOut(**row) for row in (result.data or [])]


@router.patch("/{session_id}/end", response_model=SessionOut)
async def end_session(
    session_id: str,
    body: SessionEnd,
    user_id: str = Depends(get_current_user_id),
    db: Client  = Depends(get_db),
) -> SessionOut:
    """Mark a session as ended and record accuracy."""
    update_data: dict = {"ended_at": datetime.now(tz=timezone.utc).isoformat()}
    if body.accuracy is not None:
        update_data["accuracy"] = body.accuracy
    if body.notes:
        update_data["notes"] = body.notes

    result = (
        db.table("sessions")
        .update(update_data)
        .eq("id", session_id)
        .eq("user_id", user_id)   # enforce ownership
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionOut(**result.data[0])
