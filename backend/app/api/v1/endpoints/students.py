import os
import uuid
import shutil
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.student import Student, ReadinessTier, StudentStatus
from app.models.college import College
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.api.deps import get_current_user, require_role, get_optional_user, resolve_college_scope, NO_ACCESS
from app.models.user import User, UserRole, UserStatus

CERT_UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "uploads", "certificates"))
os.makedirs(CERT_UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/students", tags=["Students"])

def _enrich_student_college(student: Student, db: Session):
    if not student:
        return student
    college = None
    if student.college_id:
        college = db.query(College).filter(College.id == student.college_id).first()
    elif student.user_id:
        u = db.query(User).filter(User.id == student.user_id).first()
        if u and u.college_id:
            college = db.query(College).filter(College.id == u.college_id).first()
            if college:
                student.college_id = college.id
                db.commit()
    if college:
        setattr(student, "institution_name", college.name)
        setattr(student, "college_code", college.code)
    else:
        setattr(student, "institution_name", None)
        setattr(student, "college_code", None)
    return student

@router.get("/", response_model=List[StudentResponse])
def get_students(
    branch: Optional[str] = None,
    email: Optional[str] = None,
    user_id: Optional[int] = None,
    college_id: Optional[int] = None,
    is_verified: Optional[bool] = None,
    readiness_level: Optional[ReadinessTier] = None,
    at_risk_only: bool = False,
    min_cgpa: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve students of the caller's own college only (multi-tenant isolation)."""
    Base.metadata.create_all(bind=engine)
    scope = resolve_college_scope(current_user, college_id)
    if scope == NO_ACCESS:
        return []
    query = db.query(Student)
    
    if email:
        query = query.filter(Student.email.ilike(email.strip()))
    if user_id:
        query = query.filter(Student.user_id == user_id)
    if scope is not None:
        query = query.filter(Student.college_id == scope)
    if is_verified is not None:
        query = query.filter(Student.is_verified == is_verified)
    if branch:
        query = query.filter(Student.branch == branch)
    if readiness_level:
        query = query.filter(Student.readiness_level == readiness_level)
    if at_risk_only:
        query = query.filter(Student.at_risk == True)
    if min_cgpa is not None:
        query = query.filter(Student.cgpa >= min_cgpa)
        
    students_list = query.offset(skip).limit(limit).all()
    for s in students_list:
        _enrich_student_college(s, db)
    return students_list

@router.get("/me", response_model=StudentResponse)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the authenticated student's unique profile linked to their user account."""
    student = db.query(Student).filter(
        (Student.user_id == current_user.id) | (Student.email == current_user.email)
    ).first()
    
    if not student:
        import secrets
        roll_num = f"STU-{current_user.id:04d}"
        if db.query(Student).filter(Student.roll_number == roll_num).first():
            roll_num = f"STU-{current_user.id:04d}-{secrets.token_hex(2).upper()}"

        student = Student(
            user_id=current_user.id,
            college_id=current_user.college_id,
            email=current_user.email,
            roll_number=roll_num,
            full_name=current_user.full_name,
            phone=current_user.phone_number or "",
            branch=current_user.department or "Computer Science Engineering",
            batch_year=2026,
            cgpa=8.0,
            skills=[],
            certifications=[],
            projects=[],
            readiness_level=ReadinessTier.DEVELOPING,
            status=StudentStatus.UNPLACED,
            is_verified=False if current_user.status == UserStatus.PENDING_VERIFICATION else True,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    _enrich_student_college(student, db)
    return student

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed student profile including readiness metrics and skill gaps."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    _enrich_student_college(student, db)
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
    
    student_data = student_in.dict()
    if current_user.role != UserRole.ADMIN:
        if not current_user.college_id:
            raise HTTPException(status_code=400, detail="Your account is not linked to a college.")
        student_data["college_id"] = current_user.college_id

    student = Student(
        **student_data,
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
            elif key == "college_id":
                if value is not None and value != "":
                    college_val = int(value)
                    old_college_id = student.college_id
                    student.college_id = college_val
                    user = None
                    if student.user_id:
                        user = db.query(User).filter(User.id == student.user_id).first()
                    elif student.email:
                        user = db.query(User).filter(User.email == student.email).first()
                    if user:
                        user.college_id = college_val
                        college_obj = db.query(College).filter(College.id == college_val).first()
                        if college_obj:
                            user.institution_name = college_obj.name
                        if old_college_id and old_college_id != college_val:
                            user.status = UserStatus.PENDING_VERIFICATION
                            student.is_verified = False
                            student.rejection_reason = None
            elif key == "roll_number":
                new_roll = str(value).strip().upper()
                existing_roll = db.query(Student).filter(Student.roll_number == new_roll, Student.id != student_id).first()
                if existing_roll:
                    raise HTTPException(status_code=400, detail="A student with this roll number already exists")
                student.roll_number = new_roll
            elif key == "batch_year":
                try:
                    student.batch_year = int(value)
                except (ValueError, TypeError):
                    pass
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
    _enrich_student_college(student, db)
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

@router.post("/{student_id}/certificate/upload")
async def upload_certificate_file(
    student_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload and attach a verified certificate proof document (PDF, PNG, JPG)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in [".pdf", ".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Only PDF, PNG, JPG, or JPEG certificate files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

    clean_orig_name = "".join(c for c in (file.filename or "cert") if c.isalnum() or c in "._- ")
    unique_name = f"cert_{student_id}_{uuid.uuid4().hex[:8]}_{clean_orig_name}"
    file_path = os.path.join(CERT_UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    relative_url = f"/uploads/certificates/{unique_name}"
    full_url = f"http://127.0.0.1:8000{relative_url}"

    return {
        "file_name": file.filename,
        "file_url": full_url,
        "relative_url": relative_url,
        "file_size": len(file_bytes),
        "content_type": file.content_type,
    }

@router.post("/purge-demo-data")
def purge_demo_data_endpoint(db: Session = Depends(get_db)):
    """Wipe all messy synthetic demo records and keep only clean college database."""
    from app.db.clean_data import purge_all_demo_data
    result = purge_all_demo_data()
    return result


