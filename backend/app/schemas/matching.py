from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from app.models.student import ReadinessTier

class FactorImpact(BaseModel):
    factor: str
    impact: str  # positive | negative | neutral
    detail: str

class MatchResultResponse(BaseModel):
    id: int
    student_id: int
    drive_id: int
    student_name: str
    branch: str
    cgpa: float
    fit_score: float
    readiness_level: ReadinessTier
    is_eligible: bool
    matched_skills: List[str]
    partial_skills: List[str]
    missing_skills: List[str]
    explanation: str
    factor_breakdown: List[Dict[str, Any]]
    is_shortlisted: bool
    override_applied: bool
    override_reason: Optional[str] = None
    override_by: Optional[str] = None
    override_timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class ShortlistRequest(BaseModel):
    student_ids: List[int]
    is_shortlisted: bool = True

class OverrideRequest(BaseModel):
    match_id: int
    override_reason: str
    override_by: str
    new_shortlist_status: bool
