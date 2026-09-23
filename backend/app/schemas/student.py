from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr
from app.models.student import ReadinessTier, StudentStatus

class StudentBase(BaseModel):
    roll_number: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    branch: str
    batch_year: int = 2026
    cgpa: float = 0.0
    tenth_percentage: float = 0.0
    twelfth_percentage: float = 0.0
    active_backlogs: int = 0
    history_of_backlogs: int = 0
    skills: List[str] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []
    aptitude_score: float = 0.0
    mock_interview_score: float = 0.0
    communication_score: float = 0.0
    technical_score: float = 0.0

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    phone: Optional[str] = None
    cgpa: Optional[float] = None
    active_backlogs: Optional[int] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    aptitude_score: Optional[float] = None
    mock_interview_score: Optional[float] = None
    communication_score: Optional[float] = None
    technical_score: Optional[float] = None
    status: Optional[StudentStatus] = None

class StudentResponse(StudentBase):
    id: int
    readiness_score: int
    readiness_level: ReadinessTier
    readiness_explanation: Optional[str] = None
    skill_gaps: List[str] = []
    recommended_actions: List[str] = []
    at_risk: bool
    risk_score: float
    status: StudentStatus
    mentor_assigned: Optional[str] = None

    class Config:
        from_attributes = True
