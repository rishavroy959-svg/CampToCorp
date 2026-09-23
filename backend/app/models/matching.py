from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class StudentJobMatch(Base):
    __tablename__ = "student_job_matches"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id"), nullable=False, index=True)
    
    # Matching Scores (PRD FR-B2, FR-B5)
    fit_score = Column(Float, nullable=False, index=True)  # 0.0 to 100.0
    is_eligible = Column(Boolean, nullable=False, default=True, index=True)  # Hard eligibility rules
    
    # Skill Match Analysis (PRD FR-B2, Design Doc 7.4)
    matched_skills = Column(JSON, default=list)  # ["Python", "FastAPI"]
    partial_skills = Column(JSON, default=list)  # ["Docker"]
    missing_skills = Column(JSON, default=list)  # ["Kubernetes", "AWS Lambda"]
    
    # Explainable AI Output (PRD Module D, Design Doc 7.5)
    explanation = Column(Text, nullable=False)
    factor_breakdown = Column(JSON, default=list)  # [{"factor": "CGPA", "impact": "positive", "detail": "..."}]
    
    # Shortlisting & Overrides (PRD FR-D3)
    is_shortlisted = Column(Boolean, default=False, index=True)
    override_applied = Column(Boolean, default=False)
    override_reason = Column(String, nullable=True)
    override_by = Column(String, nullable=True)
    override_timestamp = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="matches")
    drive = relationship("Drive", back_populates="matches")
