from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserSession(Base):
    """
    Tracks active sessions, device fingerprints, and rotating refresh tokens.
    Enables remote session revocation, concurrent session management, and brute-force mitigation.
    """
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    session_id = Column(String, unique=True, index=True, nullable=False) # Public UUID identifying this device/browser session
    refresh_token_hash = Column(String, nullable=False, index=True)      # SHA-256 hash of the rotating refresh token
    
    device_info = Column(String, nullable=True)                          # Parsed User-Agent (e.g. Chrome on Windows)
    ip_address = Column(String, nullable=True)                           # Client IP address
    user_agent = Column(String, nullable=True)
    
    is_revoked = Column(Boolean, default=False, nullable=False, index=True)
    revoked_reason = Column(String, nullable=True)                      # e.g., USER_LOGOUT, SUSPICIOUS_ROTATION, ADMIN_KILL
    
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_active_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
