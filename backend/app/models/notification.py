import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text
from app.db.session import Base
from app.models.user import UserRole

class NotificationType(str, enum.Enum):
    COLLISION_ALERT = "COLLISION_ALERT"
    SHORTLIST_ALERT = "SHORTLIST_ALERT"
    AT_RISK_ESCALATION = "AT_RISK_ESCALATION"
    OFFER_RELEASED = "OFFER_RELEASED"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.SYSTEM_ANNOUNCEMENT, index=True)
    target_role = Column(Enum(UserRole), nullable=True, index=True)
    recipient_email = Column(String, nullable=True, index=True)
    is_read = Column(Boolean, default=False, index=True)
    action_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
