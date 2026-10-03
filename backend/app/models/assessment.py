import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class AssessmentType(str, enum.Enum):
    MOCK_INTERVIEW = "MOCK_INTERVIEW"
    CODING_TEST = "CODING_TEST"
    APTITUDE = "APTITUDE"
    COMMUNICATION = "COMMUNICATION"
    TECHNICAL_MCQ = "TECHNICAL_MCQ"

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    assessment_type = Column(Enum(AssessmentType), default=AssessmentType.MOCK_INTERVIEW, nullable=False, index=True)
    title = Column(String, nullable=False)
    score = Column(Float, nullable=False, default=0.0)  # 0.0 to 100.0
    max_score = Column(Float, default=100.0)
    percentile = Column(Float, default=0.0)
    
    # Detailed feedback & metrics (PRD FR-A5, FR-C3, Module I)
    feedback = Column(Text, nullable=True)
    metrics = Column(JSON, default=dict)  # e.g., {"technical_depth": 85, "clarity": 90, "keyword_match": 80}
    
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="assessments")
