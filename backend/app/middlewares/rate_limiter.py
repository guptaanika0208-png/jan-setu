"""
Rate limiting via slowapi (Flask-Limiter style, adapted for Starlette/FastAPI).
Applied globally by default in main.py, with tighter per-route overrides on
sensitive endpoints (login, OTP request/verify) to blunt brute-force and
OTP-spam attacks - see routers/auth.py for the @limiter.limit(...) usage.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
)
