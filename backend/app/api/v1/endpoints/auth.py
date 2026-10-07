from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import (
    get_password_hash,
    ACCESS_TOKEN_LIFETIME_MINUTES,
    REFRESH_TOKEN_LIFETIME_DAYS,
)
from app.db.session import get_db, Base, engine
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    UserLogin,
    RefreshTokenRequest,
    PasswordChangeRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Identity Governance"])

# Pre-defined Demo Personas per PRD Section 4
DEMO_ACCOUNTS = [
    {
        "email": "tpo@campuslink.edu",
        "full_name": "Dr. Rajesh Sharma (Head TPO)",
        "role": UserRole.PLACEMENT_OFFICER,
        "password": "password123",
        "description": "Full placement cell administration, drive scheduling & conflicts, command analytics.",
    },
    {
        "email": "aarav.patel@campuslink.edu",
        "full_name": "Aarav Patel (Computer Science)",
        "role": UserRole.STUDENT,
        "password": "password123",
        "description": "Student readiness ring, skill gap diagnostics, and active drive applications.",
    },
    {
        "email": "recruiter@microsoft.com",
        "full_name": "Priya Sen (Tech Recruiting Lead)",
        "role": UserRole.RECRUITER,
        "password": "password123",
        "description": "Job description upload, automated AI matching, candidate pool ranking.",
    },
    {
        "email": "mentor.cs@campuslink.edu",
        "full_name": "Prof. Anita Desai (Department Mentor)",
        "role": UserRole.MENTOR,
        "password": "password123",
        "description": "Branch-level conversion tracking and intervention for top 20% at-risk students.",
    },
]

def _set_auth_cookies(response: Response, auth_data: dict, role_value: str) -> None:
    """Helper to set secure, role-aware HttpOnly cookies for Edge middleware."""
    cookie_kwargs = {
        "httponly": True,
        "samesite": "lax",
        "secure": False,  # True in production HTTPS
        "path": "/",
    }
    response.set_cookie(
        "camptocorp_access_token",
        auth_data["access_token"],
        max_age=ACCESS_TOKEN_LIFETIME_MINUTES * 60,
        **cookie_kwargs,
    )
    response.set_cookie(
        "camptocorp_refresh_token",
        auth_data["refresh_token"],
        max_age=REFRESH_TOKEN_LIFETIME_DAYS * 86400,
        **cookie_kwargs,
    )
    response.set_cookie(
        "camptocorp_session",
        auth_data["session_id"],
        max_age=REFRESH_TOKEN_LIFETIME_DAYS * 86400,
        **cookie_kwargs,
    )
    # Role cookie readable by Edge Middleware for zero-latency routing
    response.set_cookie(
        "camptocorp_role",
        role_value,
        max_age=REFRESH_TOKEN_LIFETIME_DAYS * 86400,
        httponly=False,
        samesite="lax",
        path="/",
    )

def _clear_auth_cookies(response: Response) -> None:
    """Purge all identity cookies upon session termination."""
    for cookie_name in [
        "camptocorp_access_token",
        "camptocorp_refresh_token",
        "camptocorp_session",
        "camptocorp_role",
    ]:
        response.delete_cookie(cookie_name, path="/")

@router.post("/seed-demo", response_model=List[UserResponse])
def seed_demo_users(db: Session = Depends(get_db)):
    """Initialize core persona accounts in the database with active identity governance state."""
    Base.metadata.create_all(bind=engine)
    created_users = []

    for account in DEMO_ACCOUNTS:
        existing = db.query(User).filter(User.email == account["email"]).first()
        if not existing:
            user = User(
                email=account["email"],
                full_name=account["full_name"],
                role=account["role"],
                status=UserStatus.ACTIVE,
                institution_name="National Institute of Technology",
                hashed_password=get_password_hash(account["password"]),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            created_users.append(user)
        else:
            existing.hashed_password = get_password_hash(account["password"])
            existing.is_active = True
            existing.status = UserStatus.ACTIVE
            existing.failed_login_attempts = 0
            existing.locked_until = None
            db.commit()
            db.refresh(existing)
            created_users.append(existing)

    return created_users

@router.get("/demo-accounts")
def get_demo_accounts():
    """Return available demo personas and quick-login details."""
    return DEMO_ACCOUNTS

@router.post("/register", response_model=Token)
def register(
    user_in: UserCreate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Real Identity Onboarding (Joiner workflow):
    Registers user, assigns tenant metadata, provisions Student profile if applicable,
    issues dual JWT/refresh tokens and persists security audit log.
    """
    Base.metadata.create_all(bind=engine)
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Device")

    auth_data = AuthService.register_user(
        db=db,
        user_in=user_in,
        client_ip=client_ip,
        user_agent=user_agent,
    )

    _set_auth_cookies(response, auth_data, auth_data["user"].role.value)
    return auth_data

@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Enterprise Authentication & Access Governance Gate:
    1. Validates brute-force lockout threshold.
    2. Salted bcrypt cryptographic verification.
    3. Issues rotating refresh token and in-memory access token.
    4. Sets secure HttpOnly cookies for Edge route protection.
    5. Writes an immutable security audit event.
    """
    Base.metadata.create_all(bind=engine)
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Device")

    auth_data = AuthService.authenticate_user(
        db=db,
        login_data=login_data,
        client_ip=client_ip,
        user_agent=user_agent,
    )

    _set_auth_cookies(response, auth_data, auth_data["user"].role.value)
    return auth_data

@router.post("/refresh", response_model=Token)
def refresh_session_token(
    request: Request,
    response: Response,
    payload: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Refresh Token Rotation (Zero-Trust Session Extension):
    Validates cryptographic refresh token, rotates it, revokes the predecessor,
    issues a fresh access token, and sets new secure cookies.
    """
    Base.metadata.create_all(bind=engine)
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Device")

    raw_token = payload.refresh_token if payload and payload.refresh_token else request.cookies.get("camptocorp_refresh_token")

    auth_data = AuthService.rotate_refresh_token(
        db=db,
        raw_refresh_token=raw_token,
        client_ip=client_ip,
        user_agent=user_agent,
    )

    _set_auth_cookies(response, auth_data, auth_data["user"].role.value)
    return auth_data

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Session Termination (Leaver / Signout workflow):
    Revokes the active database session and purges all authentication cookies.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Device")
    session_id = request.cookies.get("camptocorp_session")

    AuthService.terminate_session(
        db=db,
        session_id=session_id,
        current_user=current_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )

    _clear_auth_cookies(response)
    return {"message": "Logged out successfully. Identity session securely terminated."}

@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Credential Lifecycle:
    Secure password rotation with brute-force defense and active session invalidation.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Device")

    return AuthService.change_password(
        db=db,
        user=current_user,
        payload=payload,
        client_ip=client_ip,
        user_agent=user_agent,
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/seed-database")
def trigger_seed_database():
    """Trigger programmatic database seeding (PRD Deliverable 10)."""
    from app.db.seed_data import seed_database
    seed_database()
    return {"message": "CampusLink database primed successfully with 50 students, 6 drives, and offers."}
