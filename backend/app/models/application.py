import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Application(Base):
    """
    Tracks a citizen's application to a scheme, including a `draft_data`
    JSON blob and `current_step` for the auto-save/resume system: if the
    network drops mid-form, the frontend simply re-fetches this row and
    resumes exactly where the user left off (see routers/applications.py
    autosave endpoint, called on a debounce from the frontend form).
    """
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    scheme_id = Column(UUID(as_uuid=False), ForeignKey("schemes.id"), nullable=False, index=True)

    status = Column(String(20), default="draft")  # draft | submitted | under_review | approved | rejected
    current_step = Column(Integer, default=0)
    total_steps = Column(Integer, default=4)
    draft_data = Column(JSON, nullable=False, default=dict)  # auto-filled + edited form fields

    submitted_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
