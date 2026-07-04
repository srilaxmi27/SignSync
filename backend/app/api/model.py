"""
Model serving route.

GET /api/v1/model/gesture  — returns the serialized Random Forest as JSON.
GET /api/v1/model/meta     — returns model_meta.json (classes, accuracy, etc.)

The browser loads these once on session start, then runs inference locally
with zero network latency per prediction.

The route watches the model file's mtime and sets Cache-Control headers
so the browser automatically reloads the model when it is retrained.
"""

import json
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1/model", tags=["model"])

BACKEND_DIR   = Path(__file__).parent.parent.parent   # backend/
MODEL_JSON    = BACKEND_DIR / "gesture_model.json"
META_JSON     = BACKEND_DIR / "model_meta.json"


def _read_json(path: Path) -> dict:
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"{path.name} not found. Run export_model_json.py after training."
        )
    return json.loads(path.read_text(encoding="utf-8"))


@router.get("/gesture")
async def get_gesture_model() -> JSONResponse:
    """Serve the Random Forest as JSON for in-browser inference."""
    data  = _read_json(MODEL_JSON)
    mtime = int(MODEL_JSON.stat().st_mtime)
    return JSONResponse(
        content=data,
        headers={
            # Cache by mtime — browser re-fetches automatically after retrain+export
            "Cache-Control": f"public, max-age=3600",
            "ETag":          f'"{mtime}"',
        },
    )


@router.get("/meta")
async def get_model_meta() -> JSONResponse:
    """Serve human-readable model metadata (classes, accuracy)."""
    data = _read_json(META_JSON)
    return JSONResponse(content=data)
