"""
Enterprise Authentication & Identity Lifecycle Service
Handles:
- Salted Bcrypt Password Hashing & Verification
- Brute-Force Rate Limiting & Account Lockout
- Cryptographic Refresh Token Generation & Rotation (Zero-Trust)
- JWT Access Token Issuance & Signature Verification
- Student Profile Auto-Provisioning on Registration
- Immutable Security Audit Trail Logging
"""

import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple, List
from fastapi import HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_token,
    ACCESS_TOKEN_LIFETIME_MINUTES,
    REFRESH_TOKEN_LIFETIME_DAYS,
)
from app.models.college import College
from app.models.user import User, UserRole, UserStatus
from app.models.session import UserSession
from app.models.student import Student, ReadinessTier, StudentStatus
from app.schemas.user import UserCreate, UserLogin, PasswordChangeRequest
from app.services.audit_service import log_security_event

# Enterprise Security Policies (Tuned for active testing and development)
MAX_FAILED_LOGIN_ATTEMPTS = 15
LOCKOUT_DURATION_MINUTES = 1

class AuthService:
    @staticmethod
    def authenticate_user(
        db: Session,
        login_data: UserLogin,
        client_ip: str = "127.0.0.1",
        user_agent: str = "Browser",
    ) -> Dict[str, Any]:
        """
        Enterprise Authentication Gate:
        1. Validates brute-force lockout threshold.
        2. Salted bcrypt cryptographic verification.
        3. Issues rotating refresh token and in-memory access token.
        4. Records immutable security audit event.
        """
        user = db.query(User).filter(User.email == login_data.email).first()
        now_utc = datetime.now(timezone.utc)

        # 1. Brute-Force Defense: Check Account Lockout
        if user and user.locked_until:
            locked_until_utc = user.locked_until
            if locked_until_utc.tzinfo is None:
                locked_until_utc = locked_until_utc.replace(tzinfo=timezone.utc)

            if locked_until_utc > now_utc:
                remaining_minutes = int((locked_until_utc - now_utc).total_seconds() / 60) + 1
                log_security_event(
                    db=db,
                    actor_id=user.id,
                    actor_email=user.email,
                    actor_role=user.role.value,
                    action="AUTH_LOCKED_OUT",
                    status="BLOCKED",
                    ip_address=client_ip,
                    user_agent=user_agent,
                    details=f"Account locked until {user.locked_until}. Attempt rejected."
                )
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=f"Account is temporarily locked due to consecutive failed attempts. Please retry in {remaining_minutes} minutes.",
                )
            else:
                user.locked_until = None
                user.failed_login_attempts = 0
                db.commit()

        # 2. Credential Verification
        if not user or not verify_password(login_data.password, user.hashed_password):
            if user:
                user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
                if user.failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS:
                    user.locked_until = now_utc + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                    db.commit()
                    log_security_event(
                        db=db,
                        actor_id=user.id,
                        actor_email=user.email,
                        actor_role=user.role.value,
                        action="AUTH_LOCKED_OUT",
                        status="BLOCKED",
                        ip_address=client_ip,
                        user_agent=user_agent,
                        details=f"Account locked for {LOCKOUT_DURATION_MINUTES} minutes after {user.failed_login_attempts} failed attempts."
                    )
                    raise HTTPException(
                        status_code=status.HTTP_423_LOCKED,
                        detail=f"Security Alert: Too many failed login attempts. Account locked for {LOCKOUT_DURATION_MINUTES} minutes.",
                    )
                else:
                    db.commit()
                    log_security_event(
                        db=db,
                        actor_id=user.id,
                        actor_email=user.email,
                        actor_role=user.role.value,
                        action="AUTH_LOGIN_FAILED",
                        status="DENIED",
                        ip_address=client_ip,
                        user_agent=user_agent,
                        details=f"Invalid password. Failed attempt {user.failed_login_attempts}/{MAX_FAILED_LOGIN_ATTEMPTS}."
                    )
            else:
                log_security_event(
                    db=db,
                    actor_email=login_data.email,
                    action="AUTH_LOGIN_FAILED",
                    status="DENIED",
                    ip_address=client_ip,
                    user_agent=user_agent,
                    details="Attempted login with non-existent email."
                )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 3. Check Account Status & Identity Governance Status
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account. Contact institution administrator."
            )
        if getattr(user, "status", None) == UserStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account suspended by Institution Placement Cell or Governance Officer."
            )

        # 4. Reset Lockout Counter & Update Last Login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = now_utc
        db.commit()

        # 5. Issue Session & Cryptographic Refresh Token
        session_id = uuid.uuid4().hex
        raw_refresh_token, refresh_token_hash = generate_refresh_token()
        session_expires_at = now_utc + timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS)

        session_rec = UserSession(
            user_id=user.id,
            session_id=session_id,
            refresh_token_hash=refresh_token_hash,
            device_info=login_data.device_info or user_agent[:120],
            ip_address=client_ip,
            user_agent=user_agent,
            expires_at=session_expires_at,
            created_at=now_utc,
            last_active_at=now_utc,
        )
        db.add(session_rec)
        db.commit()

        # 6. Issue 30-Minute Access Token
        access_token = create_access_token(
            subject=user.id,
            role=user.role.value,
            extra_claims={
                "session_id": session_id,
                "institution": user.institution_name,
                "status": user.status.value if hasattr(user, "status") and user.status else "ACTIVE"
            }
        )

        # 7. Record Immutable Audit Event
        log_security_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            actor_role=user.role.value,
            action="AUTH_LOGIN_SUCCESS",
            resource_type="SESSION",
            resource_id=session_id,
            status="SUCCESS",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"session_id": session_id, "device": login_data.device_info}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "user": user,
            "refresh_token": raw_refresh_token,
            "session_id": session_id,
            "expires_in_minutes": ACCESS_TOKEN_LIFETIME_MINUTES,
        }

    @staticmethod
    def register_user(
        db: Session,
        user_in: UserCreate,
        client_ip: str = "127.0.0.1",
        user_agent: str = "Browser",
    ) -> Dict[str, Any]:
        """
        User Registration & Provisioning:
        - Prevents duplicate registration.
        - Hashes password.
        - Auto-provisions linked Student profile if role == STUDENT.
        - Issues initial session, refresh token, and access token.
        - Writes audit log.
        """
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            log_security_event(
                db=db,
                actor_email=user_in.email,
                action="USER_REGISTRATION_FAILED",
                status="DENIED",
                ip_address=client_ip,
                user_agent=user_agent,
                details="Duplicate email address registration attempted."
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        # Resolve Institutional Tenancy (College)
        target_college = None
        if user_in.college_id:
            target_college = db.query(College).filter(College.id == user_in.college_id).first()
        elif user_in.college_code:
            code_c = user_in.college_code.strip().upper()
            target_college = db.query(College).filter(College.code == code_c).first()
        elif user_in.college_name or user_in.institution_name:
            c_name = (user_in.college_name or user_in.institution_name).strip()
            target_college = db.query(College).filter(College.name.ilike(c_name)).first()
            if not target_college and user_in.role == UserRole.PLACEMENT_OFFICER:
                # Auto-create college for new TPO if code provided
                gen_code = (user_in.institution_code or c_name[:4]).strip().upper()
                target_college = College(name=c_name, code=gen_code)
                db.add(target_college)
                db.commit()
                db.refresh(target_college)

        if not target_college:
            # Fallback to NIT demo college if exists
            target_college = db.query(College).filter(College.code == "NIT").first() or db.query(College).first()

        # Determine user verification status:
        # Students require TPO verification (PENDING_VERIFICATION).
        # TPOs / Admins are active by default for hackathon setup.
        if user_in.role == UserRole.STUDENT:
            user_status = UserStatus.PENDING_VERIFICATION
        else:
            user_status = user_in.status or UserStatus.ACTIVE

        college_id_val = target_college.id if target_college else None
        inst_name_val = target_college.name if target_college else (user_in.institution_name or "National Institute of Technology")
        inst_code_val = target_college.code if target_college else user_in.institution_code

        new_user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            role=user_in.role,
            status=user_status,
            college_id=college_id_val,
            institution_name=inst_name_val,
            institution_code=inst_code_val,
            department=user_in.department,
            phone_number=user_in.phone_number,
            hashed_password=get_password_hash(user_in.password),
            is_active=True,
            last_login_at=datetime.now(timezone.utc),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # If student, ensure a corresponding Student profile exists with valid columns
        if new_user.role == UserRole.STUDENT:
            existing_student = db.query(Student).filter(Student.email == new_user.email).first()
            if not existing_student:
                roll_num = user_in.roll_number or f"STU-{new_user.id:04d}"
                # Check for roll number collision
                dup_roll = db.query(Student).filter(Student.roll_number == roll_num).first()
                if dup_roll:
                    roll_num = f"STU-{new_user.id:04d}-{secrets.token_hex(2).upper()}"

                student_profile = Student(
                    user_id=new_user.id,
                    college_id=college_id_val,
                    email=new_user.email,
                    roll_number=roll_num,
                    full_name=new_user.full_name,
                    phone=new_user.phone_number,
                    branch=new_user.department or "Computer Science Engineering",
                    batch_year=user_in.batch_year or 2026,
                    cgpa=user_in.cgpa if user_in.cgpa is not None else 0.0,
                    readiness_level=ReadinessTier.DEVELOPING,
                    status=StudentStatus.UNPLACED,
                    is_verified=False,
                )
                db.add(student_profile)
                db.commit()

        # Session & Refresh Token Creation
        session_id = uuid.uuid4().hex
        raw_refresh_token, refresh_token_hash = generate_refresh_token()
        now_utc = datetime.now(timezone.utc)
        expires_at = now_utc + timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS)

        session_rec = UserSession(
            user_id=new_user.id,
            session_id=session_id,
            refresh_token_hash=refresh_token_hash,
            device_info=user_agent[:120],
            ip_address=client_ip,
            user_agent=user_agent,
            expires_at=expires_at,
            created_at=now_utc,
            last_active_at=now_utc,
        )
        db.add(session_rec)
        db.commit()

        # Access Token
        access_token = create_access_token(
            subject=new_user.id,
            role=new_user.role.value,
            extra_claims={"session_id": session_id, "institution": new_user.institution_name}
        )

        log_security_event(
            db=db,
            actor_id=new_user.id,
            actor_email=new_user.email,
            actor_role=new_user.role.value,
            action="USER_REGISTERED",
            resource_type="USER",
            resource_id=str(new_user.id),
            status="SUCCESS",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"institution": new_user.institution_name, "role": new_user.role.value}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": new_user.role,
            "user": new_user,
            "refresh_token": raw_refresh_token,
            "session_id": session_id,
            "expires_in_minutes": ACCESS_TOKEN_LIFETIME_MINUTES,
        }

    @staticmethod
    def rotate_refresh_token(
        db: Session,
        raw_refresh_token: str,
        client_ip: str = "127.0.0.1",
        user_agent: str = "Browser",
    ) -> Dict[str, Any]:
        """
        Refresh Token Rotation (Zero-Trust Session Extension):
        - Detects token reuse / breach.
        - Validates expiration and user status.
        - Rotates refresh token in DB.
        - Issues new access token.
        - Logs audit event.
        """
        if not raw_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token missing from request or cookies.",
            )

        token_hash = hash_token(raw_refresh_token)
        session_rec = db.query(UserSession).filter(UserSession.refresh_token_hash == token_hash).first()
        now_utc = datetime.now(timezone.utc)

        # Detect Token Reuse / Theft: If token was already revoked, kill all user sessions!
        if not session_rec or session_rec.is_revoked:
            if session_rec:
                db.query(UserSession).filter(UserSession.user_id == session_rec.user_id).update(
                    {"is_revoked": True, "revoked_reason": "TOKEN_REUSE_DETECTED"}
                )
                db.commit()
                log_security_event(
                    db=db,
                    actor_id=session_rec.user_id,
                    actor_email=session_rec.user.email if session_rec.user else "unknown",
                    action="SECURITY_ALERT_TOKEN_REUSE",
                    status="BLOCKED",
                    ip_address=client_ip,
                    user_agent=user_agent,
                    details="Revoked refresh token presented again. All user sessions invalidated as a security precaution."
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked refresh token. Please re-authenticate.",
            )

        # Check expiration
        expires_at_utc = session_rec.expires_at
        if expires_at_utc.tzinfo is None:
            expires_at_utc = expires_at_utc.replace(tzinfo=timezone.utc)

        if expires_at_utc < now_utc:
            session_rec.is_revoked = True
            session_rec.revoked_reason = "EXPIRED"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh session has expired. Please re-authenticate.",
            )

        user = session_rec.user
        if not user or not user.is_active or user.status == UserStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is suspended or inactive.",
            )

        # ROTATION: Generate new refresh token and hash
        new_raw_refresh, new_token_hash = generate_refresh_token()
        session_rec.refresh_token_hash = new_token_hash
        session_rec.last_active_at = now_utc
        session_rec.expires_at = now_utc + timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS)
        db.commit()

        # Issue new Access Token
        access_token = create_access_token(
            subject=user.id,
            role=user.role.value,
            extra_claims={
                "session_id": session_rec.session_id,
                "institution": user.institution_name,
            }
        )

        log_security_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            actor_role=user.role.value,
            action="TOKEN_REFRESH",
            resource_type="SESSION",
            resource_id=session_rec.session_id,
            status="SUCCESS",
            ip_address=client_ip,
            user_agent=user_agent,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "user": user,
            "refresh_token": new_raw_refresh,
            "session_id": session_rec.session_id,
            "expires_in_minutes": ACCESS_TOKEN_LIFETIME_MINUTES,
        }

    @staticmethod
    def terminate_session(
        db: Session,
        session_id: Optional[str],
        current_user: Optional[User],
        client_ip: str = "127.0.0.1",
        user_agent: str = "Browser",
    ) -> None:
        """
        Session Termination (Leaver / Signout workflow):
        Revokes the active database session and logs the audit event.
        """
        if session_id:
            session_rec = db.query(UserSession).filter(UserSession.session_id == session_id).first()
            if session_rec:
                session_rec.is_revoked = True
                session_rec.revoked_reason = "USER_LOGOUT"
                db.commit()

        if current_user:
            log_security_event(
                db=db,
                actor_id=current_user.id,
                actor_email=current_user.email,
                actor_role=current_user.role.value,
                action="AUTH_LOGOUT",
                status="SUCCESS",
                ip_address=client_ip,
                user_agent=user_agent,
                details=f"Session {session_id} terminated."
            )

    @staticmethod
    def change_password(
        db: Session,
        user: User,
        payload: PasswordChangeRequest,
        client_ip: str = "127.0.0.1",
        user_agent: str = "Browser",
    ) -> Dict[str, str]:
        """
        Secure Password Rotation:
        - Verifies current password.
        - Hashes new password.
        - Revokes all other active sessions for this user.
        - Records immutable audit event.
        """
        if not verify_password(payload.current_password, user.hashed_password):
            log_security_event(
                db=db,
                actor_id=user.id,
                actor_email=user.email,
                actor_role=user.role.value,
                action="PASSWORD_CHANGE_FAILED",
                status="DENIED",
                ip_address=client_ip,
                user_agent=user_agent,
                details="Invalid current password supplied."
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

        user.hashed_password = get_password_hash(payload.new_password)
        user.last_password_change = datetime.now(timezone.utc)
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()

        # Invalidate all prior sessions except none (force re-login everywhere or keep current)
        db.query(UserSession).filter(UserSession.user_id == user.id).update(
            {"is_revoked": True, "revoked_reason": "PASSWORD_CHANGED"}
        )
        db.commit()

        log_security_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            actor_role=user.role.value,
            action="PASSWORD_CHANGED",
            status="SUCCESS",
            ip_address=client_ip,
            user_agent=user_agent,
            details="User password successfully updated. All active sessions invalidated."
        )

        return {"message": "Password changed successfully. Please log in with your new password."}
