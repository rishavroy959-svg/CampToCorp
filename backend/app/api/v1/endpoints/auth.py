from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.session import get_db, Base, engine
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

@router.post("/seed-demo", response_model=List[UserResponse])
def seed_demo_users(db: Session = Depends(get_db)):
    """Initialize the 4 core persona accounts in the database for testing and demonstration."""
    Base.metadata.create_all(bind=engine)
    created_users = []
    
    for account in DEMO_ACCOUNTS:
        existing = db.query(User).filter(User.email == account["email"]).first()
        if not existing:
            user = User(
                email=account["email"],
                full_name=account["full_name"],
                role=account["role"],
                hashed_password=get_password_hash(account["password"]),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            created_users.append(user)
        else:
            created_users.append(existing)
            
    return created_users

@router.get("/demo-accounts")
def get_demo_accounts():
    """Return available demo personas and quick-login details."""
    return DEMO_ACCOUNTS

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    Base.metadata.create_all(bind=engine)
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    Base.metadata.create_all(bind=engine)
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account"
        )
        
    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user,
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/seed-database")
def trigger_seed_database():
    """Trigger programmatic database seeding (PRD Deliverable 10)."""
    from app.db.seed_data import seed_database
    seed_database()
    return {"message": "CampusLink database primed successfully with 50 students, 6 drives, and offers."}
