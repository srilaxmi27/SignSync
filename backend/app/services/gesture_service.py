"""
Gesture business logic.

Routes call into this service; the service delegates prediction work to the
AI interface. Routes never contain prediction logic themselves.
"""

import logging
from datetime import datetime

from app.core.exceptions import ServiceError
from app.schemas.gesture import GestureResponse
from app.services.ai_interface import AIProvider

logger = logging.getLogger("signsync")


class GestureService:
    """Encapsulates all gesture-recognition business logic."""

    def __init__(self, ai_provider: AIProvider):
        self._ai_provider = ai_provider

    async def predict(self, image: str, timestamp: datetime) -> GestureResponse:
        """Run a gesture prediction for a single frame."""
        if not image:
            raise ServiceError("Image data must not be empty.", status_code=400)

        try:
            result = await self._ai_provider.predict_gesture(image)
        except Exception as exc:  # noqa: BLE001 - convert any provider failure
            logger.error("Gesture prediction failed: %s", exc)
            raise ServiceError("Failed to generate gesture prediction.") from exc

        return GestureResponse(
            gesture=result["gesture"],
            confidence=result["confidence"],
            sentence=result["sentence"],
        )

    async def next_stream_prediction(self) -> dict:
        """Produce the next mock prediction payload for the WebSocket stream."""
        try:
            result = await self._ai_provider.predict_gesture(image="")
        except Exception as exc:  # noqa: BLE001
            logger.error("Streaming gesture prediction failed: %s", exc)
            raise ServiceError("Failed to generate streaming prediction.") from exc

        return {
            "gesture": result["gesture"],
            "confidence": result["confidence"],
            "sentence": result["sentence"],
            "timestamp": datetime.utcnow(),
        }
