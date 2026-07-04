"""
Gesture prediction routes.

Routes only validate requests, call the service layer, and return responses.
No prediction logic lives here.
"""

from fastapi import APIRouter, Depends

from app.schemas.gesture import GestureRequest, GestureResponse
from app.services.ai_interface import AIProvider, get_ai_provider
from app.services.gesture_service import GestureService

router = APIRouter(prefix="/api/v1/gesture", tags=["gesture"])


def get_gesture_service(ai_provider: AIProvider = Depends(get_ai_provider)) -> GestureService:
    """Build a GestureService with its AI provider dependency injected."""
    return GestureService(ai_provider=ai_provider)


@router.post("/predict", response_model=GestureResponse)
async def predict_gesture(
    request: GestureRequest,
    service: GestureService = Depends(get_gesture_service),
) -> GestureResponse:
    """Predict a sign-language gesture from a single image frame."""
    return await service.predict(image=request.image, timestamp=request.timestamp)
