"""
Speech processing routes.

Routes only validate requests, call the service layer, and return responses.
No processing logic lives here.
"""

from fastapi import APIRouter, Depends

from app.schemas.speech import SpeechRequest, SpeechResponse
from app.services.ai_interface import AIProvider, get_ai_provider
from app.services.speech_service import SpeechService

router = APIRouter(prefix="/api/v1/speech", tags=["speech"])


def get_speech_service(ai_provider: AIProvider = Depends(get_ai_provider)) -> SpeechService:
    """Build a SpeechService with its AI provider dependency injected."""
    return SpeechService(ai_provider=ai_provider)


@router.post("/process", response_model=SpeechResponse)
async def process_speech(
    request: SpeechRequest,
    service: SpeechService = Depends(get_speech_service),
) -> SpeechResponse:
    """Process speech audio or text into a transcript."""
    return await service.process(audio=request.audio, text=request.text)
