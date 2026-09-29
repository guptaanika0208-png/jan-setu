"""
Cybersecurity core primitives for Jan Setu.

- Password hashing (bcrypt via passlib)
- JWT access/refresh token issuance + verification
- AES (Fernet) field-level encryption for sensitive PII (Aadhaar, income, etc.)
- OTP generation/hashing for phone verification

These are the building blocks used by the auth router and the encrypted
document vault. Everything here favors "secure by default" over convenience.
"""
import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT tokens
# ---------------------------------------------------------------------------
def _create_token(subject: str, expires_delta: timedelta, token_type: str, extra_claims: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": secrets.token_hex(16),  # unique token id, enables revocation lists
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, role: str = "citizen") -> str:
    return _create_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        subject=user_id,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def decode_token(token: str) -> dict:
    """Raises jose.JWTError if invalid/expired."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


# ---------------------------------------------------------------------------
# AES field-level encryption (Fernet = AES-128-CBC + HMAC)
# Used for sensitive profile fields (Aadhaar number, income, etc.) stored at rest.
# ---------------------------------------------------------------------------
def _get_fernet() -> Fernet:
    # Derive a valid 32-byte urlsafe base64 key from whatever secret is configured,
    # so the app doesn't crash if a human-readable placeholder is used in .env.
    digest = hashlib.sha256(settings.FIELD_ENCRYPTION_KEY.encode()).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_field(plaintext: Optional[str]) -> Optional[str]:
    if plaintext is None:
        return None
    return _get_fernet().encrypt(plaintext.encode()).decode()


def decrypt_field(ciphertext: Optional[str]) -> Optional[str]:
    if ciphertext is None:
        return None
    try:
        return _get_fernet().decrypt(ciphertext.encode()).decode()
    except InvalidToken:
        return None


# ---------------------------------------------------------------------------
# OTP helpers
# ---------------------------------------------------------------------------
def generate_otp(length: int = 6) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()
