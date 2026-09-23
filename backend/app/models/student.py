import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.user import UserRole

class ReadinessTier(str, enum.Enum):
    NOT_READY = "NOT_READY"
    DEVELOPING = "DEVELOPING"
    READY = "READY"
    HIGHLY_EMPLOYABLE = "HIGHLY_EMPLOYABLE"

class StudentStatus(str, enum.Enum):
    UNPLACED = "UNPLACED"
    PLACED = "PLACED"
    OFFER_EXTENDED = "OFFER_EXTENDED"

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    branch = Column(String, index=True, nullable=False)  # CSE, ECE, MECH, etc.
    batch_year = Column(Integer, default=2026)
    
    # Academic Metrics (PRD FR-A1)
    cgpa = Column(Float, nullable=False, default=0.0)
    tenth_percentage = Column(Float, default=0.0)
    twelfth_percentage = Column(Float, default=0.0)
    active_backlogs = Column(Integer, default=0)
    history_of_backlogs = Column(Integer, default=0)
    
    # Skills & Projects (PRD FR-A2)
    skills = Column(JSON, default=list)  # ["Python", "Docker", "PostgreSQL", ...]
    certifications = Column(JSON, default=list)  # ["AWS Certified Cloud Practitioner", ...]
    projects = Column(JSON, default=list)  # List of project objects with title, tech stack, summary
    resume_url = Column(String, nullable=True)
    
    # Assessment & Soft-Skill Scores (PRD FR-A5)
    aptitude_score = Column(Float, default=0.0)  # 0 to 100
    mock_interview_score = Column(Float, default=0.0)  # 0 to 100
    communication_score = Column(Float, default=0.0)  # 0 to 100
    technical_score = Column(Float, default=0.0)  # 0 to 100
    
    # Employability & Readiness Scoring (PRD Module C)
    readiness_score = Column(Integer, default=0)  # 0 to 100
    readiness_level = Column(Enum(ReadinessTier), default=ReadinessTier.NOT_READY)
    readiness_explanation = Column(Text, nullable=True)
    skill_gaps = Column(JSON, default=list)  # Missing skills required for target roles
    recommended_actions = Column(JSON, default=list)  # Personalized prep steps
    
    # At-Risk Model (PRD FR-G3)
    at_risk = Column(Boolean, default=False, index=True)
    risk_score = Column(Float, default=0.0)  # 0.0 to 1.0 (prediction probability)
    status = Column(Enum(StudentStatus), default=StudentStatus.UNPLACED, index=True)
    mentor_assigned = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    matches = relationship("StudentJobMatch", back_populates="student", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="student", cascade="all, delete-orphan")
