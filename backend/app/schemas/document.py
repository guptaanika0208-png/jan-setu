from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    doc_type: str
    file_name: str
    mime_type: str
    verification_status: str
    expiry_date: Optional[datetime]
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
