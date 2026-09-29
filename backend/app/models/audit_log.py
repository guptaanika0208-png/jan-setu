import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class AuditLog(Base):
    """
    Immutable-by-convention security audit trail. Written on every sensitive
    action (login, login failure, password change, document access/download,
    profile edit, application submit). Powers the Privacy Dashboard and
    Cyber Health Score on the frontend.
    """
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), nullable=True, index=True)  # nullable: failed logins before user resolved

    action = Column(String(60), nullable=False)  # login_success | login_failed | password_change | document_access | profile_update | suspicious_login | application_submit
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(300), nullable=True)
    metadata_json = Column(String(1000), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
