from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.notification import NotificationType
from app.models.user import UserRole

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType = NotificationType.SYSTEM_ANNOUNCEMENT
    target_role: Optional[UserRole] = None
    recipient_email: Optional[str] = None
    action_url: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
