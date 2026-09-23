from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.student import Student, ReadinessTier, StudentStatus
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.api.deps import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/", response_model=List[StudentResponse])
def get_students(
    branch: Optional[str] = None,
    readiness_level: Optional[ReadinessTier] = None,
    at_risk_only: bool = False,
    min_cgpa: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve students with filters for branch, readiness tier, CGPA, and at-risk status."""
    Base.metadata.create_all(bind=engine)
    query = db.query(Student)
    
    if branch:
        query = query.filter(Student.branch == branch)
    if readiness_level:
        query = query.filter(Student.readiness_level == readiness_level)
    if at_risk_only:
        query = query.filter(Student.at_risk == True)
    if min_cgpa is not None:
        query = query.filter(Student.cgpa >= min_cgpa)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed student profile including readiness metrics and skill gaps."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/", response_model=StudentResponse)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Create a new student record (TPO or Admin only)."""
    existing = db.query(Student).filter(
        (Student.roll_number == student_in.roll_number) | (Student.email == student_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this roll number or email already exists")
    
    # Calculate initial readiness score from inputs
    score = int(min(100, max(10, (student_in.cgpa * 7.0) + (len(student_in.skills) * 3.5) + (student_in.aptitude_score * 0.3))))
    tier = (
        ReadinessTier.HIGHLY_EMPLOYABLE if score >= 86 else
        ReadinessTier.READY if score >= 71 else
        ReadinessTier.DEVELOPING if score >= 41 else
        ReadinessTier.NOT_READY
    )
    
    student = Student(
        **student_in.dict(),
        readiness_score=score,
        readiness_level=tier,
        at_risk=(score < 45 or student_in.active_backlogs > 0),
        risk_score=round(max(0.1, (100 - score) / 100), 2),
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student
