import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserRole(str, enum.Enum):
    PLACEMENT_OFFICER = "PLACEMENT_OFFICER"
    STUDENT = "STUDENT"
    RECRUITER = "RECRUITER"
    MENTOR = "MENTOR"
    ADMIN = "ADMIN"

class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"
    ALUMNI = "ALUMNI"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE)
    is_active = Column(Boolean, default=True)
    
    # Institutional Tenancy & Governance
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True, index=True)
    institution_name = Column(String, nullable=True, default="National Institute of Technology")
    institution_code = Column(String, nullable=True) # e.g., NIRF ID or College Code
    department = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    rejection_reason = Column(String, nullable=True)
    
    # Credential Governance & Brute-Force Defense
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    last_password_change = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    sessions = relationship("UserSession", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    audit_logs = relationship("SecurityAuditLog", backref="actor", foreign_keys="SecurityAuditLog.actor_id", lazy="dynamic")
