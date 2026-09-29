import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class OTP(Base):
    """
    Short-lived OTP records for phone verification / login.
    Only the SHA-256 hash of the OTP is stored, never the plaintext code -
    mirrors how password hashing works, so a DB leak doesn't leak live OTPs.
    """
    __tablename__ = "otps"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number = Column(String(15), nullable=False, index=True)
    otp_hash = Column(String(64), nullable=False)
    purpose = Column(String(20), default="signup")  # signup | login | reset_password
    attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)

    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
