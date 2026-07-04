"""
Custom exceptions and global exception handlers.

Ensures the API always returns consistent, predictable JSON error bodies.
"""

import logging

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("signsync")


class ServiceError(Exception):
    """Raised when a service-layer operation fails."""

    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _error_body(message: str, details: object = None) -> dict:
    return {
        "error": {
            "message": message,
            "details": details,
        }
    }


async def service_error_handler(request: Request, exc: ServiceError) -> JSONResponse:
    """Handle known service-layer errors."""
    logger.error("Service error on %s: %s", request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(exc.message),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors raised by FastAPI/Pydantic."""
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_error_body("Request validation failed", exc.errors()),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for any exception not otherwise handled."""
    logger.exception("Unhandled exception on %s", request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body("Internal server error"),
    )
