from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from app.models.offer import OfferStatus

class OfferBase(BaseModel):
    student_id: int
    drive_id: Optional[int] = None
    company_name: str
    role_title: str
    ctc_lpa: float
    base_salary_lpa: Optional[float] = None
    joining_bonus_lpa: float = 0.0
    job_location: str = "Bengaluru / Hyderabad"
    bond_period_months: int = 0
    bond_amount: float = 0.0
    offer_letter_url: Optional[str] = None
    is_ppo: bool = False
    joining_date: Optional[date] = None
    notes: Optional[str] = None

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    status: Optional[OfferStatus] = None
    docs_submitted: Optional[bool] = None
    docs_verified: Optional[bool] = None
    verified_by: Optional[str] = None
    joining_date: Optional[date] = None
    notes: Optional[str] = None

class OfferResponse(OfferBase):
    id: int
    status: OfferStatus
    status_updated_at: datetime
    docs_submitted: bool
    docs_verified: bool
    verified_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocVerificationRequest(BaseModel):
    docs_verified: bool
    verified_by: str
    notes: Optional[str] = None
