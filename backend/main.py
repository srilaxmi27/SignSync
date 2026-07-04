"""
SignSync Backend entry point.

Run with:
    uvicorn main:app --reload --port 8000
"""

import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api import gesture, speech, system, websocket
from app.api import sessions, profile
from app.core.config import get_settings
from app.core.exceptions import (
    ServiceError,
    service_error_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(debug=settings.DEBUG)
logger = logging.getLogger("signsync")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ServiceError, service_error_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(system.router)
app.include_router(gesture.router)
app.include_router(speech.router)
app.include_router(websocket.router)
app.include_router(sessions.router)
app.include_router(profile.router)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("%s v%s starting up on port %s", settings.APP_NAME, settings.APP_VERSION, settings.PORT)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("%s shutting down", settings.APP_NAME)
