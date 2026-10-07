from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CollegeBase(BaseModel):
    name: str
    code: str
    city: Optional[str] = None

class CollegeCreate(CollegeBase):
    pass

class CollegeResponse(CollegeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
