import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Dict, Tuple
import jwt
import bcrypt
from app.core.config import settings

# Real Access Token default: 30 minutes. Refresh token default: 7 days.
ACCESS_TOKEN_LIFETIME_MINUTES = 30
REFRESH_TOKEN_LIFETIME_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8')[:72], salt).decode('utf-8')

def hash_token(raw_token: str) -> str:
    """SHA-256 hash of high-entropy tokens to store safely in the database."""
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

def generate_refresh_token() -> Tuple[str, str]:
    """Generates an opaque, cryptographically secure 256-bit refresh token and its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    return raw_token, token_hash

def create_access_token(
    subject: Union[str, Any], 
    role: str, 
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_LIFETIME_MINUTES)
        
    to_encode: Dict[str, Any] = {
        "exp": expire, 
        "sub": str(subject), 
        "role": role,
        "iat": datetime.now(timezone.utc),
    }
    if extra_claims:
        to_encode.update(extra_claims)
        
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates JWT access token signature and expiration."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
