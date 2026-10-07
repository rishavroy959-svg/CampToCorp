from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole, UserStatus

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.STUDENT
    status: Optional[UserStatus] = UserStatus.ACTIVE
    college_id: Optional[int] = None
    institution_name: Optional[str] = "National Institute of Technology"
    institution_code: Optional[str] = None
    department: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = True
    rejection_reason: Optional[str] = None

class UserCreate(UserBase):
    password: str
    college_id: Optional[int] = None
    college_name: Optional[str] = None
    college_code: Optional[str] = None
    roll_number: Optional[str] = None
    cgpa: Optional[float] = None
    batch_year: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    device_info: Optional[str] = "Web Browser"

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    college_id: Optional[int] = None
    rejection_reason: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user: UserResponse
    refresh_token: Optional[str] = None
    session_id: Optional[str] = None
    expires_in_minutes: int = 30

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[UserRole] = None
    session_id: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None
