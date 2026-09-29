"""
Jan Setu API - FastAPI entrypoint.
Wires together CORS, security headers, rate limiting, and every router.
Run with:  uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.db.database import Base, engine
from app.middlewares.rate_limiter import limiter
from app.middlewares.security_headers import SecurityHeadersMiddleware
from app.routers import applications, auth, documents, notifications, profile, schemes, voice

# Import models package so every table is registered on Base.metadata
import app.models  # noqa: F401

app = FastAPI(
    title="Jan Setu API",
    description="Digital Citizen Assistant - One Secure Profile. Every Government Benefit.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(schemes.router)
app.include_router(applications.router)
app.include_router(documents.router)
app.include_router(notifications.router)
app.include_router(voice.router)


@app.on_event("startup")
def on_startup():
    # For hackathon speed: auto-create tables if they don't exist.
    # In production, use Alembic migrations instead (see database/ folder).
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "service": "Jan Setu API",
        "status": "healthy",
        "tagline": "One Secure Profile. Every Government Benefit.",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
