import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    full_name = Column(String(150), nullable=False)
    phone_number = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), default="citizen", nullable=False)  # citizen | admin
    is_phone_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    preferred_language = Column(String(10), default="en")  # ISO code, see i18n locales
    high_contrast_mode = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime, nullable=True)
