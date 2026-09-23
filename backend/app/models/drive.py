import enum
from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Enum, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class SlotType(str, enum.Enum):
    MORNING = "MORNING"         # 09:00 - 13:00
    AFTERNOON = "AFTERNOON"     # 14:00 - 18:00
    FULL_DAY = "FULL_DAY"       # 09:00 - 18:00

class DriveStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ConflictType(str, enum.Enum):
    DATE_SLOT_OVERLAP = "DATE_SLOT_OVERLAP"
    VENUE_DOUBLE_BOOKING = "VENUE_DOUBLE_BOOKING"
    STUDENT_SIMULTANEOUS = "STUDENT_SIMULTANEOUS"
    PANEL_UNAVAILABLE = "PANEL_UNAVAILABLE"

class ConflictSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    RESOLVED = "RESOLVED"

class Drive(Base):
    __tablename__ = "drives"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)
    role_title = Column(String, nullable=False)
    job_description = Column(Text, nullable=True)
    
    # Financials (PRD FR-F1)
    ctc_lpa = Column(Float, nullable=False)  # in Lakhs Per Annum
    base_salary_lpa = Column(Float, nullable=True)
    
    # Hard Eligibility Filters (PRD FR-B3)
    min_cgpa = Column(Float, default=6.0, nullable=False)
    allowed_branches = Column(JSON, default=list)  # ["CSE", "ECE", "IT"]
    max_backlogs_allowed = Column(Integer, default=0)
    required_skills = Column(JSON, default=list)    # ["Python", "FastAPI", "PostgreSQL"]
    preferred_certifications = Column(JSON, default=list)
    
    # Scheduling & Resources (PRD FR-E1 to FR-E4)
    drive_date = Column(Date, nullable=False, index=True)
    slot = Column(Enum(SlotType), default=SlotType.FULL_DAY, nullable=False)
    venue = Column(String, default="Auditorium Hall A", nullable=False)
    interview_panels_count = Column(Integer, default=3)
    
    # Status & Conflict Flags (PRD FR-I2)
    status = Column(Enum(DriveStatus), default=DriveStatus.UPCOMING, index=True)
    has_conflict = Column(Boolean, default=False, index=True)
    conflict_summary = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    matches = relationship("StudentJobMatch", back_populates="drive", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="drive", cascade="all, delete-orphan")
    conflicts = relationship("ConflictLog", foreign_keys="ConflictLog.drive_id", back_populates="drive", cascade="all, delete-orphan")

class ConflictLog(Base):
    __tablename__ = "conflict_logs"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id"), nullable=False)
    conflicting_drive_id = Column(Integer, ForeignKey("drives.id"), nullable=True)
    conflict_type = Column(Enum(ConflictType), nullable=False)
    severity = Column(Enum(ConflictSeverity), default=ConflictSeverity.CRITICAL)
    
    description = Column(String, nullable=False)
    affected_resource = Column(String, nullable=True)  # Venue name or Panel or Student Count
    affected_student_ids = Column(JSON, default=list)  # IDs of students with simultaneous interviews
    
    is_resolved = Column(Boolean, default=False, index=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    drive = relationship("Drive", foreign_keys=[drive_id], back_populates="conflicts")
    conflicting_drive = relationship("Drive", foreign_keys=[conflicting_drive_id])
