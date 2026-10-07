from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def get_token_from_request(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[str]:
    """
    Extracts authentication token from Authorization Bearer header OR HttpOnly session cookie.
    Guarantees cross-origin and browser cookie compatibility.
    """
    if bearer_token:
        return bearer_token
    # Fallback to HttpOnly cookie
    cookie_token = request.cookies.get("camptocorp_access_token") or request.cookies.get("camptocorp_session")
    return cookie_token

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        # Real Cryptographic JWT Verification (mock/demo tokens are not accepted)
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenPayload(sub=user_id, role=payload.get("role"), session_id=payload.get("session_id"))
    except Exception:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(token_data.sub)).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user account. Access revoked by identity governance."
        )
    if getattr(user, "status", None) == UserStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended by Institution Placement Cell or Governance Officer."
        )
        
    return user

def get_optional_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request),
) -> Optional[User]:
    """Returns the authenticated user if a valid token is present, otherwise None."""
    if not token:
        return None
    try:
        return get_current_user(db=db, token=token)
    except HTTPException:
        return None

# Sentinel meaning "caller may see nothing" (no college linked / anonymous without filter)
NO_ACCESS = -1

def resolve_college_scope(current_user: Optional[User], requested_college_id: Optional[int]) -> Optional[int]:
    """
    Multi-tenant college isolation.
    - ADMIN: may see everything, or filter by requested college.
    - Authenticated users: ALWAYS locked to their own college (requested value ignored).
      If they have no college linked, they see nothing.
    - Anonymous: only an explicit college filter is honoured; otherwise nothing.
    Returns a college id to filter by, None for unrestricted (admin only), or NO_ACCESS.
    """
    if current_user is not None:
        if current_user.role == UserRole.ADMIN:
            return requested_college_id
        return current_user.college_id if current_user.college_id else NO_ACCESS
    return requested_college_id if requested_college_id else NO_ACCESS

def require_role(allowed_roles: List[UserRole]):
    """Role-Based Access Control (RBAC) Dependency Gatekeeper."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {[r.value for r in allowed_roles]}. Current role: {current_user.role.value}",
            )
        return current_user
    return role_checker

def enforce_student_owner(student_id: int, current_user: User = Depends(get_current_user)) -> User:
    """Attribute-Based Access Control (ABAC): Ensures students can only access their own records."""
    if current_user.role == UserRole.STUDENT:
        # If user is a student, ensure they are requesting their own student profile
        # Note: If student has a related student profile, check user.id or student.id
        from app.models.student import Student
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            student_rec = db.query(Student).filter(Student.id == student_id).first()
            if student_rec and student_rec.user_id and student_rec.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="ABAC Policy Violation: Access denied to other students' confidential academic and placement records."
                )
        finally:
            db.close()
    return current_user
