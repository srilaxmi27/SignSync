"""
Speech business logic.

Routes call into this service; the service delegates processing work to the
AI interface. Routes never contain processing logic themselves.
"""

import logging

from app.core.exceptions import ServiceError
from app.schemas.speech import SpeechResponse
from app.services.ai_interface import AIProvider

logger = logging.getLogger("signsync")


class SpeechService:
    """Encapsulates all speech-processing business logic."""

    def __init__(self, ai_provider: AIProvider):
        self._ai_provider = ai_provider

    async def process(self, audio: str | None, text: str | None) -> SpeechResponse:
        """Process incoming audio or text into a transcript."""
        if not audio and not text:
            raise ServiceError("Either audio or text must be provided.", status_code=400)

        try:
            result = await self._ai_provider.process_speech(audio=audio, text=text)
        except Exception as exc:  # noqa: BLE001 - convert any provider failure
            logger.error("Speech processing failed: %s", exc)
            raise ServiceError("Failed to process speech input.") from exc

        return SpeechResponse(
            transcript=result["transcript"],
            confidence=result["confidence"],
            language=result["language"],
        )
