"""
MediaPipe Hands service — Tasks API, VIDEO running mode.

VIDEO mode uses MediaPipe's internal Kalman-filter tracker across frames
which gives smoother, lower-latency landmark positions than IMAGE mode
(no per-frame re-detection overhead once hands are found).

Each call to process_frame() must pass a monotonically increasing
timestamp_ms so the tracker can compute motion.
"""

from __future__ import annotations

import os
import time
from collections import deque
from dataclasses import dataclass, field
from typing import List, Optional

import cv2
import numpy as np
from mediapipe import Image, ImageFormat
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import (
    HandLandmarker,
    HandLandmarkerOptions,
    RunningMode,
)

# ─── Model file ───────────────────────────────────────────────────────────────

_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "hand_landmarker.task",
)

# Hand skeleton connections (21-landmark model)
HAND_CONNECTIONS: list[tuple[int, int]] = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20),
]

# ─── Data structures ──────────────────────────────────────────────────────────

@dataclass
class Landmark:
    id:  int
    x:   float   # normalised 0-1 (relative to frame width)
    y:   float   # normalised 0-1 (relative to frame height)
    z:   float   # depth
    px:  int     # pixel x (at the processed resolution)
    py:  int     # pixel y


@dataclass
class HandResult:
    hand_index: int
    handedness: str              # "Left" or "Right"
    landmarks:  List[Landmark] = field(default_factory=list)


@dataclass
class FrameResult:
    hands:      List[HandResult]
    hand_count: int
    fps:        float


# ─── Service ──────────────────────────────────────────────────────────────────

class MediaPipeHandsService:
    """
    Reusable, continuous-video MediaPipe Hands wrapper.

    Usage
    ─────
        svc = MediaPipeHandsService()
        result = svc.process_frame(bgr_frame)
        # result.hands   → list of HandResult
        # result.fps     → rolling FPS
        svc.release()
    """

    _FPS_WINDOW = 30

    def __init__(
        self,
        max_num_hands: int              = 2,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float  = 0.5,
        model_path: str                 = _MODEL_PATH,
    ) -> None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"MediaPipe model not found at {model_path}. "
                "Run: python -c \"import urllib.request; urllib.request.urlretrieve("
                "'https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
                "hand_landmarker/float16/1/hand_landmarker.task', 'hand_landmarker.task')\""
            )

        options = HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=model_path),
            running_mode=RunningMode.VIDEO,          # continuous tracking mode
            num_hands=max_num_hands,
            min_hand_detection_confidence=min_detection_confidence,
            min_hand_presence_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )
        self._detector = HandLandmarker.create_from_options(options)
        self._timestamps: deque[float] = deque(maxlen=self._FPS_WINDOW)
        # Monotonic ms timestamp for VIDEO mode (must always increase)
        self._start_ms: int = int(time.monotonic() * 1000)

    # ── Public API ────────────────────────────────────────────────────────────

    def process_frame(self, bgr_frame: np.ndarray) -> FrameResult:
        """
        Process one BGR frame.  Returns landmark data.
        Caller is responsible for drawing if needed.
        """
        h, w = bgr_frame.shape[:2]

        # VIDEO mode requires an explicit, strictly increasing timestamp
        ts_ms = int(time.monotonic() * 1000) - self._start_ms
        if ts_ms <= 0:
            ts_ms = 1

        rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
        mp_image = Image(image_format=ImageFormat.SRGB, data=rgb)

        detection = self._detector.detect_for_video(mp_image, ts_ms)

        # Rolling FPS
        self._timestamps.append(time.perf_counter())
        fps = self._compute_fps()

        # Build structured results
        hands: List[HandResult] = []
        for idx, (hand_lm, handedness_list) in enumerate(
            zip(detection.hand_landmarks, detection.handedness)
        ):
            label = handedness_list[0].category_name
            landmarks = [
                Landmark(
                    id=i,
                    x=lm.x, y=lm.y, z=lm.z,
                    px=int(lm.x * w), py=int(lm.y * h),
                )
                for i, lm in enumerate(hand_lm)
            ]
            hands.append(HandResult(
                hand_index=idx,
                handedness=label,
                landmarks=landmarks,
            ))

        return FrameResult(
            hands=hands,
            hand_count=len(hands),
            fps=fps,
        )

    def get_landmark_array(self, hand_result: HandResult) -> np.ndarray:
        """Return (21, 3) float32 array of normalised (x, y, z) — for classifiers."""
        return np.array(
            [[lm.x, lm.y, lm.z] for lm in hand_result.landmarks],
            dtype=np.float32,
        )

    def release(self) -> None:
        """Close detector and free resources."""
        try:
            self._detector.close()
        except Exception:  # noqa: BLE001
            pass

    # ── Private ───────────────────────────────────────────────────────────────

    def _compute_fps(self) -> float:
        if len(self._timestamps) < 2:
            return 0.0
        elapsed = self._timestamps[-1] - self._timestamps[0]
        return 0.0 if elapsed <= 0 else (len(self._timestamps) - 1) / elapsed
