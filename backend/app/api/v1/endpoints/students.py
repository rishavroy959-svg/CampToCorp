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

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_update: dict,
    db: Session = Depends(get_db),
):
    """Update student profile, technical skills, domain, and projects."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in student_update.items():
        if hasattr(student, key) and value is not None:
            if key == "email":
                new_email = str(value).strip().lower()
                existing = db.query(Student).filter(Student.email == new_email, Student.id != student_id).first()
                if existing:
                    raise HTTPException(status_code=400, detail="A student with this email address already exists")
                old_email = student.email
                student.email = new_email
                
                # Synchronize associated User account
                user = None
                if student.user_id:
                    user = db.query(User).filter(User.id == student.user_id).first()
                if not user and old_email:
                    user = db.query(User).filter(User.email == old_email).first()
                    if user:
                        student.user_id = user.id
                if user:
                    user_conflict = db.query(User).filter(User.email == new_email, User.id != user.id).first()
                    if not user_conflict:
                        user.email = new_email
            elif key == "full_name":
                student.full_name = str(value).strip()
                user = None
                if student.user_id:
                    user = db.query(User).filter(User.id == student.user_id).first()
                elif student.email:
                    user = db.query(User).filter(User.email == student.email).first()
                    if user:
                        student.user_id = user.id
                if user:
                    user.full_name = student.full_name
            # Handle float conversions for academic fields if passed as strings/numbers
            elif key in ["cgpa", "tenth_percentage", "twelfth_percentage", "aptitude_score"]:
                try:
                    setattr(student, key, float(value))
                except (ValueError, TypeError):
                    pass
            elif key in ["active_backlogs", "history_of_backlogs"]:
                try:
                    setattr(student, key, int(value))
                except (ValueError, TypeError):
                    pass
            else:
                setattr(student, key, value)

    # Re-calculate readiness score dynamically
    skills_len = len(student.skills) if student.skills else 0
    apt_score = student.aptitude_score if student.aptitude_score else 75.0
    score = int(min(100, max(10, (student.cgpa * 7.0) + (skills_len * 3.5) + (apt_score * 0.3))))
    student.readiness_score = score
    student.readiness_level = (
        ReadinessTier.HIGHLY_EMPLOYABLE if score >= 86 else
        ReadinessTier.READY if score >= 71 else
        ReadinessTier.DEVELOPING if score >= 41 else
        ReadinessTier.NOT_READY
    )
    student.at_risk = (score < 45 or student.active_backlogs > 0)
    student.risk_score = round(max(0.02, (100 - score) / 100), 2)

    # Re-calculate profile completeness percentage
    pct = 0
    if student.full_name and student.roll_number and student.email:
        pct += 30
    if student.cgpa and student.tenth_percentage and student.twelfth_percentage:
        pct += 25
    if student.skills and len(student.skills) >= 3:
        pct += 20
    if student.projects and len(student.projects) >= 1:
        pct += 15
    if student.resume_url:
        pct += 10
    student.profile_completed_pct = pct

    db.commit()
    db.refresh(student)
    return student

@router.post("/{student_id}/resume", response_model=StudentResponse)
def update_student_resume(
    student_id: int,
    payload: dict,
    db: Session = Depends(get_db),
):
    """Directly update or upgrade student resume file and refresh ATS linkage."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    resume_url = payload.get("resume_url") or payload.get("resume_name") or "Placement_Resume.pdf"
    student.resume_url = resume_url

    # Check if completeness needs update
    if not student.profile_completed_pct or student.profile_completed_pct < 100:
        student.profile_completed_pct = min(100, (student.profile_completed_pct or 90) + 10)

    db.commit()
    db.refresh(student)
    return student

@router.post("/purge-demo-data")
def purge_demo_data_endpoint(db: Session = Depends(get_db)):
    """Wipe all messy synthetic demo records and keep only clean college database."""
    from app.db.clean_data import purge_all_demo_data
    result = purge_all_demo_data()
    return result


