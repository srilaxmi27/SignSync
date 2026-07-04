"""
WebSocket route for real-time gesture prediction streaming.

Sends a mock prediction once per second. The frontend can connect here and,
later, receive real predictions without any change to the message contract.
"""

import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ai_interface import MockAIProvider
from app.services.gesture_service import GestureService

logger = logging.getLogger("signsync")

router = APIRouter()

STREAM_INTERVAL_SECONDS = 1


@router.websocket("/ws/gesture")
async def gesture_stream(websocket: WebSocket) -> None:
    """Stream a mock gesture prediction to the client every second."""
    await websocket.accept()
    service = GestureService(ai_provider=MockAIProvider())
    logger.info("WebSocket client connected: /ws/gesture")

    try:
        while True:
            payload = await service.next_stream_prediction()
            await websocket.send_json(
                {
                    "gesture": payload["gesture"],
                    "confidence": payload["confidence"],
                    "sentence": payload["sentence"],
                    "timestamp": payload["timestamp"].isoformat(),
                }
            )
            await asyncio.sleep(STREAM_INTERVAL_SECONDS)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected: /ws/gesture")
    except Exception as exc:  # noqa: BLE001 - never let the socket crash silently
        logger.error("Unexpected WebSocket error: %s", exc)
        await websocket.close(code=1011)
