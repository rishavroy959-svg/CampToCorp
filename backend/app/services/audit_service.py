import json
from typing import Optional, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.audit_log import SecurityAuditLog

def log_security_event(
    db: Session,
    actor_email: str,
    action: str,
    status: str = "SUCCESS",
    actor_id: Optional[int] = None,
    actor_role: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[Any] = None,
) -> SecurityAuditLog:
    """
    Records an immutable audit event for Identity & Access Governance compliance.
    Safe execution: failure to log will not break the primary flow, but errors are logged.
    """
    try:
        details_str = None
        if details is not None:
            if isinstance(details, (dict, list)):
                details_str = json.dumps(details)
            else:
                details_str = str(details)
                
        audit_entry = SecurityAuditLog(
            actor_id=actor_id,
            actor_email=actor_email,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            ip_address=ip_address or "127.0.0.1",
            user_agent=user_agent or "Browser/Client",
            status=status,
            details=details_str,
            created_at=datetime.now(timezone.utc),
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
    except Exception as e:
        db.rollback()
        print(f"[AuditService Error] Failed to write security audit log: {e}")
        return None
