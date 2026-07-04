"""
Pydantic models for the speech processing endpoint.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class SpeechRequest(BaseModel):
    """Incoming request containing audio or text to process."""

    audio: str | None = Field(default=None, description="Base64-encoded audio data.")
    text: str | None = Field(default=None, description="Raw text input, if audio is not provided.")
    timestamp: datetime = Field(..., description="Client-side capture timestamp (ISO 8601).")


class SpeechResponse(BaseModel):
    """Response returned after processing speech input."""

    transcript: str = Field(..., description="Transcribed or echoed text.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Transcription confidence score.")
    language: str = Field(default="en-US", description="Detected or assumed language code.")
