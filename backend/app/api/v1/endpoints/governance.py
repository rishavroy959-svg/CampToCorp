from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.session import UserSession
from app.models.audit_log import SecurityAuditLog
from app.schemas.governance import (
    AuditLogsResponse,
    AuditLogItem,
    ActiveSessionItem,
    RevokeSessionRequest,
    UserStatusUpdateRequest,
    GovernanceStats
)
from app.services.audit_service import log_security_event

router = APIRouter(prefix="/governance", tags=["Identity & Access Governance"])

@router.get("/audit-logs", response_model=AuditLogsResponse)
def get_security_audit_logs(
    action: Optional[str] = Query(None, description="Filter by event action (e.g., AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILED)"),
    actor_email: Optional[str] = Query(None, description="Filter by user email"),
    status: Optional[str] = Query(None, description="Filter by status (SUCCESS, DENIED, BLOCKED)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN]))
):
    """
    Access Governance Compliance Audit Log:
    Inspects tamper-evident security records, authentication history, privilege events, and PII accesses.
    Protected by RBAC: Exclusively accessible to Institutional Placement Officers and System Administrators.
    """
    query = db.query(SecurityAuditLog)
    if action:
        query = query.filter(SecurityAuditLog.action == action)
    if actor_email:
        query = query.filter(SecurityAuditLog.actor_email.ilike(f"%{actor_email}%"))
    if status:
        query = query.filter(SecurityAuditLog.status == status)

    total = query.count()
    logs = (
        query.order_by(desc(SecurityAuditLog.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "logs": logs,
    }

@router.get("/sessions", response_model=List[ActiveSessionItem])
def get_active_sessions(
    user_id: Optional[int] = Query(None, description="Target user ID (TPO/Admin only)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Session Governance & Device Fingerprinting:
    Inspects active browser/mobile sessions, issued refresh tokens, and revocation statuses.
    """
    target_id = current_user.id
    if user_id and current_user.role in [UserRole.PLACEMENT_OFFICER, UserRole.ADMIN]:
        target_id = user_id

    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == target_id)
        .order_by(desc(UserSession.last_active_at))
        .all()
    )
    return sessions

@router.post("/sessions/revoke")
def revoke_identity_session(
    payload: RevokeSessionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Zero-Trust Session Killswitch:
    Revokes specific compromised or unused sessions, or performs a global signout across all devices.
    """
    now_utc = datetime.now(timezone.utc)
    current_session_id = request.cookies.get("camptocorp_session")

    if payload.revoke_all_others:
        revoked_count = (
            db.query(UserSession)
            .filter(
                UserSession.user_id == current_user.id,
                UserSession.session_id != current_session_id,
                UserSession.is_revoked == False
            )
            .update({"is_revoked": True, "revoked_reason": "USER_GLOBAL_REVOCATION"})
        )
        db.commit()

        log_security_event(
            db=db,
            actor_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value,
            action="GLOBAL_SESSIONS_REVOKED",
            status="SUCCESS",
            details=f"Terminated {revoked_count} concurrent sessions."
        )
        return {"message": f"Successfully revoked {revoked_count} other sessions."}

    if payload.session_id:
        session_rec = db.query(UserSession).filter(UserSession.session_id == payload.session_id).first()
        if not session_rec:
            raise HTTPException(status_code=404, detail="Session not found.")
            
        # ABAC permission: User can revoke their own, TPO can revoke anyone's
        if session_rec.user_id != current_user.id and current_user.role not in [UserRole.PLACEMENT_OFFICER, UserRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Forbidden: Cannot revoke another user's session.")

        session_rec.is_revoked = True
        session_rec.revoked_reason = "MANUAL_REVOCATION"
        db.commit()

        log_security_event(
            db=db,
            actor_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value,
            action="SESSION_REVOKED",
            status="SUCCESS",
            resource_type="SESSION",
            resource_id=payload.session_id,
            details="Manual revocation by user or governance officer."
        )
        return {"message": f"Session {payload.session_id} has been revoked."}

    raise HTTPException(status_code=400, detail="Specify either session_id or set revoke_all_others to true.")

@router.patch("/users/{user_id}/status")
def update_user_governance_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN]))
):
    """
    User Lifecycle Governance (Mover & Leaver Workflow):
    Toggles identity state between ACTIVE, PENDING_VERIFICATION, SUSPENDED, and ALUMNI.
    If an account is SUSPENDED, all active sessions and refresh tokens are immediately revoked.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    old_status = target_user.status
    target_user.status = payload.new_status
    if payload.new_status == UserStatus.SUSPENDED:
        target_user.is_active = False
        # Kill all sessions immediately
        db.query(UserSession).filter(UserSession.user_id == user_id).update(
            {"is_revoked": True, "revoked_reason": f"ACCOUNT_SUSPENDED: {payload.reason}"}
        )
    elif payload.new_status == UserStatus.ACTIVE:
        target_user.is_active = True
        target_user.failed_login_attempts = 0
        target_user.locked_until = None

    db.commit()

    log_security_event(
        db=db,
        actor_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        action="USER_STATUS_CHANGE",
        resource_type="USER",
        resource_id=str(user_id),
        status="SUCCESS",
        details={
            "old_status": old_status.value if old_status else None,
            "new_status": payload.new_status.value,
            "reason": payload.reason
        }
    )

    return {
        "user_id": target_user.id,
        "email": target_user.email,
        "new_status": target_user.status,
        "is_active": target_user.is_active,
        "message": f"User lifecycle status successfully updated to {payload.new_status.value}."
    }

@router.get("/stats", response_model=GovernanceStats)
def get_governance_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN]))
):
    """
    Identity & Access Governance Health Metrics:
    Returns security telemetry, active sessions count, failed authentications, and compliance readiness score.
    """
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    suspended_users = db.query(User).filter(User.status == UserStatus.SUSPENDED).count()
    pending_verification = db.query(User).filter(User.status == UserStatus.PENDING_VERIFICATION).count()

    active_sessions = db.query(UserSession).filter(UserSession.is_revoked == False).count()

    since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    failed_logins_24h = (
        db.query(SecurityAuditLog)
        .filter(
            SecurityAuditLog.action.in_(["AUTH_LOGIN_FAILED", "AUTH_LOCKED_OUT"]),
            SecurityAuditLog.created_at >= since_24h
        )
        .count()
    )

    security_events_24h = (
        db.query(SecurityAuditLog)
        .filter(SecurityAuditLog.created_at >= since_24h)
        .count()
    )

    # Compliance posture: High if few failed logins and zero un-revoked stale sessions
    compliance_score = 98 if failed_logins_24h == 0 else max(75, 98 - (failed_logins_24h * 3))

    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "pending_verification": pending_verification,
        "active_sessions": active_sessions,
        "failed_logins_24h": failed_logins_24h,
        "security_events_24h": security_events_24h,
        "compliance_score_pct": compliance_score,
    }
