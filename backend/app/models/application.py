import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    OA_SCHEDULED = "OA_SCHEDULED"
    OA_CLEARED = "OA_CLEARED"
    TECH_ROUND_1 = "TECH_ROUND_1"
    TECH_ROUND_2 = "TECH_ROUND_2"
    HR_ROUND = "HR_ROUND"
    OFFERED = "OFFERED"
    REJECTED = "REJECTED"

class DriveApplication(Base):
    __tablename__ = "drive_applications"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    
    current_status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, index=True)
    current_round_name = Column(String, default="Application Submitted")
    round_order = Column(Integer, default=1)
    
    round_date = Column(String, nullable=True)
    round_slot = Column(String, nullable=True)
    venue_or_link = Column(String, nullable=True)
    instructions = Column(Text, nullable=True)
    
    resume_url = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="applications")
    drive = relationship("Drive", back_populates="applications")
