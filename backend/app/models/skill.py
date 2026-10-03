import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class SkillCategory(str, enum.Enum):
    PROGRAMMING_LANGUAGE = "PROGRAMMING_LANGUAGE"
    FRAMEWORK = "FRAMEWORK"
    DATABASE = "DATABASE"
    CLOUD_DEVOPS = "CLOUD_DEVOPS"
    CORE_CS = "CORE_CS"
    AI_ML = "AI_ML"
    SOFT_SKILL = "SOFT_SKILL"
    TOOL = "TOOL"

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(Enum(SkillCategory), default=SkillCategory.PROGRAMMING_LANGUAGE, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student_associations = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")
    students = relationship("Student", secondary="student_skills", back_populates="skills_rel", viewonly=True, overlaps="student_associations")

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    proficiency = Column(String, default="INTERMEDIATE")  # BEGINNER, INTERMEDIATE, ADVANCED
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="student_skills")
    skill = relationship("Skill", back_populates="student_associations")
