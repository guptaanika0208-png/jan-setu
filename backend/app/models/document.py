import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Document(Base):
    """
    Encrypted Document Vault entry.
    `storage_path` points at encrypted-at-rest object storage (S3/Supabase/etc
    in production; local disk for the hackathon demo). The file bytes
    themselves are AES-encrypted before write - see routers/documents.py.
    """
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)

    doc_type = Column(String(50), nullable=False)  # aadhaar | pan | income_certificate | caste_certificate | disability_certificate | passport | other
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(128), nullable=False)  # SHA-256, used for integrity verification + dedup

    expiry_date = Column(DateTime, nullable=True)  # for expiry notifications (e.g. income certificate)
    verification_status = Column(String(20), default="pending")  # pending | verified | rejected

    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
