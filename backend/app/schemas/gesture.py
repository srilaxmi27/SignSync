"""
Pydantic models for the gesture prediction endpoints.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class GestureRequest(BaseModel):
    """Incoming request for a single gesture prediction."""

    image: str = Field(..., description="Base64-encoded image data.")
    timestamp: datetime = Field(..., description="Client-side capture timestamp (ISO 8601).")


class GestureResponse(BaseModel):
    """Response returned for a gesture prediction."""

    gesture: str = Field(..., description="The predicted gesture label.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score.")
    sentence: str = Field(..., description="Composed sentence derived from recognized gestures.")


class GestureWebSocketMessage(BaseModel):
    """Message shape broadcast over the /ws/gesture WebSocket."""

    gesture: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    sentence: str
    timestamp: datetime
