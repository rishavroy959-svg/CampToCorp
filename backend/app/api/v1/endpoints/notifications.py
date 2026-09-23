from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.notification import Notification, NotificationType
from app.models.user import UserRole
from app.schemas.notification import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notification Engine (PRD Area 6)"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    role: Optional[UserRole] = None,
    recipient_email: Optional[str] = None,
    unread_only: bool = False,
    db: Session = Depends(get_db),
):
    """Retrieve system, drive collision, and candidate notifications."""
    Base.metadata.create_all(bind=engine)
    query = db.query(Notification)

    if role:
        query = query.filter((Notification.target_role == role) | (Notification.target_role == None))
    if recipient_email:
        query = query.filter(Notification.recipient_email == recipient_email)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    return query.order_by(Notification.created_at.desc()).limit(50).all()

@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
):
    """Trigger automated notification for collision, shortlist, or mentor escalation."""
    Base.metadata.create_all(bind=engine)
    notif = Notification(**notification_in.dict())
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
