from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id"), nullable=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    title = Column(String, nullable=False, index=True)
    department = Column(String, default="Engineering", index=True)
    description = Column(Text, nullable=False)  # Free-text JD for NLP parsing (PRD FR-B1)
    
    # Eligibility & Criteria
    min_cgpa = Column(Float, default=6.0, nullable=False)
    allowed_branches = Column(JSON, default=list)  # ["CSE", "ECE", "IT"]
    max_backlogs = Column(Integer, default=0)
    
    # Skill Criteria
    required_skills = Column(JSON, default=list)    # Mandatory skills
    preferred_skills = Column(JSON, default=list)   # Nice-to-have skills
    experience_level = Column(String, default="Fresher")
    openings_count = Column(Integer, default=1)
    status = Column(String, default="ACTIVE", index=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    drive = relationship("Drive", back_populates="requirements")
    recruiter = relationship("User", foreign_keys=[recruiter_id])
