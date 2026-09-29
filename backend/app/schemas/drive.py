from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.drive import SlotType, DriveStatus, ConflictType, ConflictSeverity

class DriveBase(BaseModel):
    company_name: str
    role_title: str
    job_description: Optional[str] = None
    ctc_lpa: float
    base_salary_lpa: Optional[float] = None
    min_cgpa: float = 6.0
    allowed_branches: List[str] = ["CSE", "ECE", "IT"]
    max_backlogs_allowed: int = 0
    required_skills: List[str] = []
    preferred_certifications: List[str] = []
    drive_date: date
    slot: SlotType = SlotType.FULL_DAY
    venue: str = "Auditorium Hall A"
    interview_panels_count: int = 3
    job_type: Optional[str] = "FULL_TIME"
    category: Optional[str] = "CORE"
    location: Optional[str] = "Bengaluru / Hyderabad"
    deadline: Optional[str] = "2026-10-14"
    min_tenth_percentage: Optional[float] = 60.0
    min_twelfth_percentage: Optional[float] = 60.0
    batch_year: Optional[int] = 2026
    rounds: Optional[List[dict]] = []

class DriveCreate(DriveBase):
    pass

class DriveUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    job_description: Optional[str] = None
    ctc_lpa: Optional[float] = None
    base_salary_lpa: Optional[float] = None
    min_cgpa: Optional[float] = None
    allowed_branches: Optional[List[str]] = None
    max_backlogs_allowed: Optional[int] = None
    required_skills: Optional[List[str]] = None
    preferred_certifications: Optional[List[str]] = None
    drive_date: Optional[date] = None
    slot: Optional[SlotType] = None
    venue: Optional[str] = None
    job_type: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    deadline: Optional[str] = None
    min_tenth_percentage: Optional[float] = None
    min_twelfth_percentage: Optional[float] = None
    batch_year: Optional[int] = None
    rounds: Optional[List[dict]] = None
    status: Optional[DriveStatus] = None

class JDParseRequest(BaseModel):
    text: str

class JDParseResponse(BaseModel):
    detected_skills: List[str]
    suggested_min_cgpa: float
    suggested_branches: List[str]
    suggested_backlogs: int
    detected_role: Optional[str] = None
    character_count: int
    word_count: int

class ConflictLogResponse(BaseModel):
    id: int
    drive_id: int
    conflicting_drive_id: Optional[int] = None
    conflict_type: ConflictType
    severity: ConflictSeverity
    description: str
    affected_resource: Optional[str] = None
    affected_student_ids: List[int] = []
    is_resolved: bool
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConflictResolveRequest(BaseModel):
    resolution_notes: str
    resolved_by: str

class DriveResponse(DriveBase):
    id: int
    status: DriveStatus
    has_conflict: bool
    conflict_summary: Optional[str] = None
    conflicts: List[ConflictLogResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
