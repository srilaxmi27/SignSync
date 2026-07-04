"""
Gesture prediction routes.

Routes only validate requests, call the service layer, and return responses.
Predictions are optionally persisted to gesture_logs when a session_id is provided.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from supabase import Client

from app.core.security import get_current_user_id
from app.db.supabase_client import get_db
from app.schemas.gesture import GestureRequest, GestureResponse
from app.services.ai_interface import AIProvider, get_ai_provider
from app.services.gesture_service import GestureService

router = APIRouter(prefix="/api/v1/gesture", tags=["gesture"])


class GestureRequestExtended(GestureRequest):
    session_id: Optional[str] = Field(default=None, description="Active session UUID to log this prediction under.")


def get_gesture_service(ai_provider: AIProvider = Depends(get_ai_provider)) -> GestureService:
    return GestureService(ai_provider=ai_provider)


@router.post("/predict", response_model=GestureResponse)
async def predict_gesture(
    request: GestureRequestExtended,
    service: GestureService   = Depends(get_gesture_service),
    user_id: str              = Depends(get_current_user_id),
    db: Client                = Depends(get_db),
) -> GestureResponse:
    """Predict a gesture and optionally persist the log."""
    result = await service.predict(image=request.image, timestamp=request.timestamp)

    # Persist to DB if a session is active
    if request.session_id:
        db.table("gesture_logs").insert({
            "session_id": request.session_id,
            "user_id":    user_id,
            "gesture":    result.gesture,
            "confidence": float(result.confidence),
            "sentence":   result.sentence,
        }).execute()

    return result
