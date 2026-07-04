"""
User profile routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from app.core.security import get_current_user_id
from app.db.supabase_client import get_db

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


class ProfileOut(BaseModel):
    id:    str
    name:  str
    email: str


class ProfileUpdate(BaseModel):
    name: str


@router.get("", response_model=ProfileOut)
async def get_profile(
    user_id: str   = Depends(get_current_user_id),
    db: Client     = Depends(get_db),
) -> ProfileOut:
    result = db.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileOut(**result.data)


@router.patch("", response_model=ProfileOut)
async def update_profile(
    body: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Client   = Depends(get_db),
) -> ProfileOut:
    result = (
        db.table("profiles")
        .update({"name": body.name})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileOut(**result.data[0])
