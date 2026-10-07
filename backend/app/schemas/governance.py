from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.user import UserRole, UserStatus

class AuditLogItem(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_email: str
    actor_role: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    logs: List[AuditLogItem]

class ActiveSessionItem(BaseModel):
    id: int
    session_id: str
    user_id: int
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    is_revoked: bool
    created_at: datetime
    last_active_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class RevokeSessionRequest(BaseModel):
    session_id: Optional[str] = None
    revoke_all_others: bool = False

class UserStatusUpdateRequest(BaseModel):
    user_id: int
    new_status: UserStatus
    reason: Optional[str] = "Administrative policy action"

class GovernanceStats(BaseModel):
    total_users: int
    active_users: int
    suspended_users: int
    pending_verification: int
    active_sessions: int
    failed_logins_24h: int
    security_events_24h: int
    compliance_score_pct: int
