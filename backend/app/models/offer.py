import enum
from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class OfferStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DEFERRED = "DEFERRED"
    WITHDRAWN = "WITHDRAWN"

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id"), nullable=True, index=True)
    
    company_name = Column(String, nullable=False, index=True)
    role_title = Column(String, nullable=False)
    
    # Financial Terms (PRD FR-F1)
    ctc_lpa = Column(Float, nullable=False)
    base_salary_lpa = Column(Float, nullable=True)
    joining_bonus_lpa = Column(Float, default=0.0)
    job_location = Column(String, default="Bengaluru / Hyderabad")
    
    # Joining & Bond Terms (PRD FR-F2)
    bond_period_months = Column(Integer, default=0)
    bond_amount = Column(Float, default=0.0)
    offer_letter_url = Column(String, nullable=True)
    
    # Lifecycle & Verification Tracking (PRD FR-F2, FR-F3, FR-F4)
    status = Column(Enum(OfferStatus), default=OfferStatus.PENDING, index=True)
    status_updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_ppo = Column(Boolean, default=False)  # Pre-placement offer
    
    docs_submitted = Column(Boolean, default=False)
    docs_verified = Column(Boolean, default=False)
    verified_by = Column(String, nullable=True)
    
    joining_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="offers")
    drive = relationship("Drive", back_populates="offers")
