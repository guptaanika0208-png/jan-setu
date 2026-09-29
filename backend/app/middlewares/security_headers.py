"""
Adds defensive HTTP security headers to every response - a standard
belt-and-suspenders layer against XSS, clickjacking, MIME sniffing, and to
enforce HTTPS in production (HSTS). SQL injection is prevented separately
via SQLAlchemy's parameterized queries (never raw string-interpolated SQL
anywhere in this codebase) and CSRF is mitigated by the API being
stateless/Bearer-token-based rather than cookie-session based.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(self), camera=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response
