import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)

    type = Column(String(30), nullable=False)  # deadline | expiry | application_update | security
    title = Column(String(200), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
