from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.document import NotificationResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
