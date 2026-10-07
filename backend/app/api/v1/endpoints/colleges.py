from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.college import College
from app.models.user import User, UserRole, UserStatus
from app.models.student import Student
from app.schemas.college import CollegeCreate, CollegeResponse
from app.schemas.student import StudentResponse
from app.api.deps import get_current_user, require_role
from app.services.audit_service import log_security_event

router = APIRouter(prefix="/colleges", tags=["Colleges & Institutional Tenancy"])

class VerificationActionRequest(BaseModel):
    action: str  # "APPROVE" or "REJECT"
    reason: Optional[str] = None

@router.get("/", response_model=List[CollegeResponse])
def get_colleges(db: Session = Depends(get_db)):
    """Public endpoint to list registered colleges for student/TPO onboarding dropdown."""
    Base.metadata.create_all(bind=engine)
    return db.query(College).order_by(College.name.asc()).all()

@router.post("/", response_model=CollegeResponse)
def create_college(
    college_in: CollegeCreate,
    db: Session = Depends(get_db),
):
    """Register a new College/Institute."""
    Base.metadata.create_all(bind=engine)
    code_clean = college_in.code.strip().upper()
    existing = db.query(College).filter((College.code == code_clean) | (College.name == college_in.name.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"College with code '{code_clean}' or name already exists."
        )

    new_college = College(
        name=college_in.name.strip(),
        code=code_clean,
        city=college_in.city.strip() if college_in.city else None
    )
    db.add(new_college)
    db.commit()
    db.refresh(new_college)
    return new_college

@router.get("/my-college", response_model=Optional[CollegeResponse])
def get_my_college(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the college linked to the authenticated user."""
    if not current_user.college_id:
        return None
    college = db.query(College).filter(College.id == current_user.college_id).first()
    return college

@router.get("/pending-students")
def get_pending_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """
    TPO Officer Endpoint:
    Retrieve all students from the TPO's college who are in PENDING_VERIFICATION status.
    """
    if not current_user.college_id and current_user.role != UserRole.ADMIN:
        return []

    query = db.query(User).filter(
        User.role == UserRole.STUDENT,
        User.status == UserStatus.PENDING_VERIFICATION
    )
    if current_user.role != UserRole.ADMIN:
        query = query.filter(User.college_id == current_user.college_id)

    pending_users = query.all()
    results = []
    for u in pending_users:
        st = db.query(Student).filter((Student.user_id == u.id) | (Student.email == u.email)).first()
        results.append({
            "user_id": u.id,
            "student_id": st.id if st else None,
            "full_name": u.full_name,
            "email": u.email,
            "roll_number": st.roll_number if st else "N/A",
            "branch": st.branch if st else u.department or "N/A",
            "cgpa": st.cgpa if st else 0.0,
            "batch_year": st.batch_year if st else 2026,
            "status": u.status.value,
            "registered_at": u.created_at.isoformat() if u.created_at else None,
            "phone": u.phone_number or (st.phone if st else None),
            "rejection_reason": u.rejection_reason,
        })
    return results

@router.post("/verify-student/{user_id}")
def verify_student(
    user_id: int,
    payload: VerificationActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """
    TPO Officer Action:
    Approve or Reject a student's verification for this college.
    """
    target_user = db.query(User).filter(User.id == user_id, User.role == UserRole.STUDENT).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Student user not found.")

    if current_user.role != UserRole.ADMIN and target_user.college_id != current_user.college_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot verify students from other colleges.")

    student_rec = db.query(Student).filter((Student.user_id == target_user.id) | (Student.email == target_user.email)).first()

    action_upper = payload.action.strip().upper()
    if action_upper == "APPROVE":
        target_user.status = UserStatus.ACTIVE
        target_user.is_active = True
        target_user.rejection_reason = None
        if student_rec:
            student_rec.is_verified = True
            student_rec.rejection_reason = None
        
        log_security_event(
            db=db,
            actor_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value,
            action="STUDENT_VERIFICATION_APPROVED",
            resource_type="USER",
            resource_id=str(target_user.id),
            status="SUCCESS",
            details=f"TPO {current_user.full_name} approved student {target_user.full_name} ({target_user.email})"
        )
        msg = f"Student {target_user.full_name} has been verified and granted active campus placement access."
    elif action_upper == "REJECT":
        target_user.status = UserStatus.REJECTED
        target_user.rejection_reason = payload.reason or "Information could not be verified by the Placement Cell."
        if student_rec:
            student_rec.is_verified = False
            student_rec.rejection_reason = target_user.rejection_reason

        log_security_event(
            db=db,
            actor_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value,
            action="STUDENT_VERIFICATION_REJECTED",
            resource_type="USER",
            resource_id=str(target_user.id),
            status="SUCCESS",
            details={"reason": target_user.rejection_reason}
        )
        msg = f"Student {target_user.full_name} registration was rejected."
    else:
        raise HTTPException(status_code=400, detail="Action must be either 'APPROVE' or 'REJECT'")

    db.commit()
    return {
        "status": "success",
        "message": msg,
        "new_status": target_user.status.value,
        "rejection_reason": target_user.rejection_reason
    }
