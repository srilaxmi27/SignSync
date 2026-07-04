"""
WebSocket route for real-time hand-landmark streaming via MediaPipe.

Protocol
────────
Client → Server (binary):  raw JPEG bytes of the current video frame
Server → Client (JSON):    landmark data + annotated JPEG (base64) + metadata

Message schema sent to client
──────────────────────────────
{
  "hand_count":       int,
  "fps":              float,
  "detected":         bool,
  "hands": [
    {
      "hand_index":  int,
      "handedness":  "Left" | "Right",
      "landmarks": [
        { "id": int, "x": float, "y": float, "z": float, "px": int, "py": int },
        ...  // 21 landmarks
      ]
    },
    ...  // up to 2 hands
  ],
  "annotated_frame":  str | null   // base64-encoded JPEG with skeleton drawn
}

The annotated_frame field is included so the frontend can display the
MediaPipe overlay on top of the live video using a single <canvas> element
without any JS-side landmark drawing code.
"""

import asyncio
import logging
from typing import Optional

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from app.services.mediapipe_service import MediaPipeHandsService

logger = logging.getLogger("signsync")
router = APIRouter()


@router.websocket("/ws/hands")
async def hands_stream(websocket: WebSocket) -> None:
    """
    Receive raw JPEG frames from the browser, run MediaPipe Hands,
    and send back structured landmark data + annotated frame.
    """
    await websocket.accept()
    logger.info("MediaPipe WebSocket client connected: /ws/hands")

    service: Optional[MediaPipeHandsService] = None

    try:
        service = MediaPipeHandsService(
            max_num_hands=2,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.5,
        )

        while True:
            # ── Receive frame ─────────────────────────────────────────────
            try:
                raw = await asyncio.wait_for(
                    websocket.receive_bytes(),
                    timeout=5.0,  # disconnect if no frame for 5 s
                )
            except asyncio.TimeoutError:
                logger.warning("/ws/hands: no frame received for 5 s, closing")
                break

            # ── Decode JPEG → BGR NumPy array ─────────────────────────────
            jpg_array = np.frombuffer(raw, dtype=np.uint8)
            bgr = cv2.imdecode(jpg_array, cv2.IMREAD_COLOR)
            if bgr is None:
                logger.debug("/ws/hands: failed to decode JPEG, skipping frame")
                continue

            # ── Run MediaPipe (VIDEO mode — continuous tracking) ──────────
            result = service.process_frame(bgr)

            # ── Build response ─────────────────────────────────────────────
            payload = {
                "hand_count": result.hand_count,
                "fps":        round(result.fps, 1),
                "detected":   result.hand_count > 0,
                "hands": [
                    {
                        "hand_index": h.hand_index,
                        "handedness": h.handedness,
                        "landmarks": [
                            {
                                "id": lm.id,
                                "x":  round(lm.x, 4),
                                "y":  round(lm.y, 4),
                                "z":  round(lm.z, 4),
                                "px": lm.px,
                                "py": lm.py,
                            }
                            for lm in h.landmarks
                        ],
                    }
                    for h in result.hands
                ],
            }

            # ── Send response ─────────────────────────────────────────────
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json(payload)

    except WebSocketDisconnect:
        logger.info("MediaPipe WebSocket client disconnected: /ws/hands")
    except Exception as exc:  # noqa: BLE001
        logger.error("MediaPipe WebSocket error: %s", exc, exc_info=True)
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.close(code=1011)
    finally:
        if service is not None:
            service.release()
            logger.info("MediaPipe resources released")


# ── Keep legacy mock endpoint alive for backward compatibility ────────────────

import random
from datetime import datetime
from app.services.ai_interface import MockAIProvider
from app.services.gesture_service import GestureService

_STREAM_INTERVAL = 1


@router.websocket("/ws/gesture")
async def gesture_stream(websocket: WebSocket) -> None:
    """Legacy mock gesture stream — kept for backward compatibility."""
    await websocket.accept()
    svc = GestureService(ai_provider=MockAIProvider())
    try:
        while True:
            p = await svc.next_stream_prediction()
            await websocket.send_json({
                "gesture":    p["gesture"],
                "confidence": p["confidence"],
                "sentence":   p["sentence"],
                "timestamp":  p["timestamp"].isoformat(),
            })
            await asyncio.sleep(_STREAM_INTERVAL)
    except WebSocketDisconnect:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.error("Legacy WebSocket error: %s", exc)
        await websocket.close(code=1011)
