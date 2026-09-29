"""
Authentication router.
Flow: Signup -> OTP verification -> Login (password + JWT) -> Refresh.
Every sensitive action writes an AuditLog row (login_success, login_failed,
suspicious_login) which powers the frontend Privacy Dashboard / Cyber
Health Score.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    hash_otp,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.middlewares.rate_limiter import limiter
from app.models.audit_log import AuditLog
from app.models.otp import OTP
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    OTPRequest,
    OTPVerifyRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
    UserPublic,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _log(db: Session, user_id: str | None, action: str, request: Request):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(entry)
    db.commit()


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def signup(payload: SignupRequest, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this phone number already exists")

    user = User(
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _log(db, user.id, "signup", request)
    return user


@router.post("/otp/request")
@limiter.limit("5/minute")
def request_otp(payload: OTPRequest, request: Request, db: Session = Depends(get_db)):
    otp_code = generate_otp()
    record = OTP(
        phone_number=payload.phone_number,
        otp_hash=hash_otp(otp_code),
        purpose=payload.purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=settings.OTP_EXPIRY_SECONDS),
    )
    db.add(record)
    db.commit()

    # In OTP_MOCK_MODE (hackathon demo) we return the code directly instead
    # of dispatching via an SMS gateway (MSG91/Twilio) - swap in production.
    response = {"message": "OTP sent successfully", "expires_in": settings.OTP_EXPIRY_SECONDS}
    if settings.OTP_MOCK_MODE:
        response["demo_otp"] = otp_code
    return response


@router.post("/otp/verify", response_model=TokenResponse)
@limiter.limit("10/minute")
def verify_otp(payload: OTPVerifyRequest, request: Request, db: Session = Depends(get_db)):
    record = (
        db.query(OTP)
        .filter(OTP.phone_number == payload.phone_number, OTP.purpose == payload.purpose, OTP.is_used == False)  # noqa: E712
        .order_by(OTP.created_at.desc())
        .first()
    )
    if not record:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No pending OTP for this number. Request a new one.")
    if datetime.now(timezone.utc) > record.expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "OTP expired. Request a new one.")
    if record.attempts >= 5:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts. Request a new OTP.")

    record.attempts += 1
    if hash_otp(payload.otp) != record.otp_hash:
        db.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Incorrect OTP")

    record.is_used = True
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if user:
        user.is_phone_verified = True
        user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account found for this number")

    _log(db, user.id, "login_success", request)
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if not user or not verify_password(payload.password, user.password_hash):
        _log(db, user.id if user else None, "login_failed", request)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid phone number or password")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    _log(db, user.id, "login_success", request)

    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token")

    user = db.query(User).filter(User.id == decoded["sub"]).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
