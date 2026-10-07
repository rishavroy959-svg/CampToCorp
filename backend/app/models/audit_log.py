from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class SecurityAuditLog(Base):
    """
    Immutable Security and Access Governance Audit Log.
    Compliant with SOC-2, ISO 27001, and FERPA access review standards.
    Records all authentication events, privilege escalations, PII exports, and lifecycle state changes.
    """
    __tablename__ = "security_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_email = Column(String, nullable=False, index=True)
    actor_role = Column(String, nullable=True)
    
    action = Column(String, nullable=False, index=True) 
    # e.g., AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILED, AUTH_LOCKED_OUT, AUTH_LOGOUT, 
    #       TOKEN_REFRESH, USER_REGISTERED, USER_STATUS_CHANGE, SESSION_REVOKED, 
    #       DRIVE_CREATED, STUDENT_PII_EXPORTED
    
    resource_type = Column(String, nullable=True, index=True)  # USER, SESSION, DRIVE, STUDENT_PROFILE
    resource_id = Column(String, nullable=True)
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    status = Column(String, nullable=False, default="SUCCESS")  # SUCCESS, DENIED, BLOCKED, WARNING
    details = Column(Text, nullable=True)  # JSON or descriptive text of the payload/context
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
