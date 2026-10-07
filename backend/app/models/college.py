from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.db.session import Base


class College(Base):
    """An institution (tenant). Every TPO, student and drive belongs to exactly one college."""
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)  # short unique code, e.g. "GITA"
    city = Column(String, nullable=True)
    created_by_user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
