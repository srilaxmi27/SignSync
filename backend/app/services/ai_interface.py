"""
AI interface abstraction.

This module defines the contract that gesture/speech services use to obtain
predictions. Today it is backed by a mock implementation. Later, this file's
`MockAIProvider` can be swapped for a real implementation (e.g. MediaPipe +
Random Forest for gestures, a real ASR model for speech) WITHOUT changing any
route or service code, since callers only depend on the `AIProvider`
interface below.
"""

import random
from abc import ABC, abstractmethod
from typing import Any, Dict


class AIProvider(ABC):
    """Abstract contract for any AI backend (mock or real)."""

    @abstractmethod
    async def predict_gesture(self, image: str) -> Dict[str, Any]:
        """Return a gesture prediction for the given base64 image."""
        raise NotImplementedError

    @abstractmethod
    async def process_speech(self, audio: str | None, text: str | None) -> Dict[str, Any]:
        """Return a speech-processing result for the given audio or text."""
        raise NotImplementedError


class MockAIProvider(AIProvider):
    """
    Mock AI provider.

    Produces realistic, varied mock responses so the frontend can be built
    and tested end-to-end before a real model is wired in.
    """

    _GESTURES = [
        ("Hello", "Hello! How are you?"),
        ("Thank You", "Thank you very much."),
        ("Yes", "Yes, that is correct."),
        ("No", "No, that is not right."),
        ("Please", "Please help me with this."),
        ("Sorry", "I am sorry about that."),
        ("Good", "That is good to hear."),
        ("Help", "I need some help, please."),
    ]

    async def predict_gesture(self, image: str) -> Dict[str, Any]:
        # `image` is intentionally unused by the mock; a real implementation
        # would decode and run inference on it.
        gesture, sentence = random.choice(self._GESTURES)
        confidence = round(random.uniform(0.85, 0.99), 2)
        return {
            "gesture": gesture,
            "confidence": confidence,
            "sentence": sentence,
        }

    async def process_speech(self, audio: str | None, text: str | None) -> Dict[str, Any]:
        if text:
            transcript = text
        else:
            transcript = "This is a mock transcription of the provided audio."

        confidence = round(random.uniform(0.88, 0.99), 2)
        return {
            "transcript": transcript,
            "confidence": confidence,
            "language": "en-US",
        }


def get_ai_provider() -> AIProvider:
    """
    Dependency-injectable factory for the active AI provider.

    Swapping the mock for a real provider later only requires changing the
    return value here.
    """
    return MockAIProvider()
