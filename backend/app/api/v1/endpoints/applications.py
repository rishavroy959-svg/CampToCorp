import csv
import io
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.application import DriveApplication, ApplicationStatus
from app.models.drive import Drive, DriveStatus
from app.models.student import Student, StudentStatus
from app.models.offer import Offer, OfferStatus
from app.models.notification import Notification, NotificationType
from app.models.user import User, UserRole
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/applications", tags=["Drive Applications & Round Tracker"])

class ApplyRequest(BaseModel):
    drive_id: int
    student_id: int
    resume_url: Optional[str] = None

class RoundAdvanceRequest(BaseModel):
    new_status: ApplicationStatus
    current_round_name: str
    round_order: Optional[int] = 1
    round_date: Optional[str] = None
    round_slot: Optional[str] = None
    venue_or_link: Optional[str] = None
    instructions: Optional[str] = None
    feedback: Optional[str] = None

class BulkAdvanceRequest(BaseModel):
    application_ids: List[int]
    new_status: ApplicationStatus
    current_round_name: str
    round_date: Optional[str] = None
    round_slot: Optional[str] = None
    venue_or_link: Optional[str] = None
    instructions: Optional[str] = None

@router.get("/")
def get_applications(
    student_id: Optional[int] = None,
    drive_id: Optional[int] = None,
    status: Optional[ApplicationStatus] = None,
    db: Session = Depends(get_db),
):
    """Retrieve drive applications with student & company metadata."""
    Base.metadata.create_all(bind=engine)
    query = db.query(DriveApplication)
    if student_id:
        query = query.filter(DriveApplication.student_id == student_id)
    if drive_id:
        query = query.filter(DriveApplication.drive_id == drive_id)
    if status:
        query = query.filter(DriveApplication.current_status == status)
        
    apps = query.order_by(DriveApplication.applied_at.desc()).all()
    results = []
    for a in apps:
        student = db.query(Student).filter(Student.id == a.student_id).first()
        drive = db.query(Drive).filter(Drive.id == a.drive_id).first()
        results.append({
            "id": a.id,
            "drive_id": a.drive_id,
            "student_id": a.student_id,
            "current_status": a.current_status.value if hasattr(a.current_status, "value") else str(a.current_status),
            "current_round_name": a.current_round_name,
            "round_order": a.round_order,
            "round_date": a.round_date,
            "round_slot": a.round_slot,
            "venue_or_link": a.venue_or_link,
            "instructions": a.instructions,
            "resume_url": a.resume_url,
            "feedback": a.feedback,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "student_name": student.full_name if student else "Unknown",
            "roll_number": student.roll_number if student else "N/A",
            "student_email": student.email if student else "N/A",
            "student_branch": student.branch if student else "N/A",
            "student_cgpa": student.cgpa if student else 0.0,
            "student_skills": student.skills if student else [],
            "company_name": drive.company_name if drive else "Unknown",
            "role_title": drive.role_title if drive else "N/A",
            "ctc_lpa": drive.ctc_lpa if drive else 0.0,
            "drive_date": str(drive.drive_date) if drive else "N/A",
        })
    return results

@router.post("/apply")
def apply_for_drive(
    req: ApplyRequest,
    db: Session = Depends(get_db),
):
    """One-click apply for a drive with strict deterministic eligibility checking."""
    Base.metadata.create_all(bind=engine)
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    drive = db.query(Drive).filter(Drive.id == req.drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found.")

    # 1. Check existing application
    existing_app = db.query(DriveApplication).filter(
        DriveApplication.drive_id == req.drive_id,
        DriveApplication.student_id == req.student_id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this placement drive.")

    # 2. Deterministic Eligibility Rules
    # Rule A: Minimum CGPA
    if student.cgpa < drive.min_cgpa:
        raise HTTPException(
            status_code=400,
            detail=f"Ineligible: Minimum CGPA required is {drive.min_cgpa}, your CGPA is {student.cgpa}."
        )

    # Rule B: Allowed Branches
    if drive.allowed_branches and len(drive.allowed_branches) > 0:
        if student.branch.upper() not in [b.upper() for b in drive.allowed_branches]:
            raise HTTPException(
                status_code=400,
                detail=f"Ineligible: Drive is restricted to branches: {', '.join(drive.allowed_branches)}. Your branch is {student.branch}."
            )

    # Rule C: Maximum Active Backlogs
    if student.active_backlogs > drive.max_backlogs_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Ineligible: Maximum active backlogs allowed is {drive.max_backlogs_allowed}. You have {student.active_backlogs} active backlogs."
        )

    # Rule D: 10th and 12th Percentage
    if drive.min_tenth_percentage and student.tenth_percentage < drive.min_tenth_percentage:
        raise HTTPException(
            status_code=400,
            detail=f"Ineligible: 10th standard minimum percentage is {drive.min_tenth_percentage}%. Your score: {student.tenth_percentage}%."
        )
    if drive.min_twelfth_percentage and student.twelfth_percentage < drive.min_twelfth_percentage:
        raise HTTPException(
            status_code=400,
            detail=f"Ineligible: 12th standard minimum percentage is {drive.min_twelfth_percentage}%. Your score: {student.twelfth_percentage}%."
        )

    # Rule E: College Placement Policy (1-student-1-job rule unless Dream/Super-Dream upgrade)
    accepted_offer = db.query(Offer).filter(
        Offer.student_id == student.id,
        Offer.status == OfferStatus.ACCEPTED
    ).first()
    if accepted_offer:
        # Internships are exempt from the 1-student-1-fulltime-job lock policy
        job_type_str = str(getattr(drive, "job_type", "")).upper()
        category_str = str(getattr(drive, "category", "")).upper()
        is_internship = "INTERNSHIP" in job_type_str or "INTERNSHIP" in category_str

        if not is_internship and drive.ctc_lpa <= accepted_offer.ctc_lpa:
            raise HTTPException(
                status_code=400,
                detail=f"Policy Restriction: You have already accepted an offer from {accepted_offer.company_name} ({accepted_offer.ctc_lpa} LPA). College placement policy permits applying only to Super Dream drives with higher CTC."
            )

    # Create application
    app = DriveApplication(
        drive_id=req.drive_id,
        student_id=req.student_id,
        current_status=ApplicationStatus.APPLIED,
        current_round_name="Application Submitted",
        round_order=1,
        round_date=str(drive.drive_date),
        round_slot=drive.slot.value if hasattr(drive.slot, "value") else str(drive.slot),
        venue_or_link=drive.venue,
        instructions="Your application has been received by the Placement Cell.",
        resume_url=req.resume_url or student.resume_url,
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    return {
        "status": "success",
        "message": f"Successfully applied for {drive.company_name} - {drive.role_title}!",
        "application_id": app.id,
    }

@router.patch("/{app_id}/advance")
def advance_candidate_round(
    app_id: int,
    req: RoundAdvanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """TPO advances candidate round or updates selection status."""
    app = db.query(DriveApplication).filter(DriveApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.current_status = req.new_status
    app.current_round_name = req.current_round_name
    if req.round_order:
        app.round_order = req.round_order
    if req.round_date:
        app.round_date = req.round_date
    if req.round_slot:
        app.round_slot = req.round_slot
    if req.venue_or_link:
        app.venue_or_link = req.venue_or_link
    if req.instructions:
        app.instructions = req.instructions
    if req.feedback:
        app.feedback = req.feedback

    db.commit()
    db.refresh(app)

    # Trigger student notification
    student = db.query(Student).filter(Student.id == app.student_id).first()
    drive = db.query(Drive).filter(Drive.id == app.drive_id).first()
    if student and drive:
        notif = Notification(
            title=f"{drive.company_name} Update: {req.current_round_name}",
            message=f"Status: {req.new_status.value}. {req.instructions or ''} Venue: {req.venue_or_link or 'TBD'}",
            notification_type=NotificationType.SHORTLIST_ALERT,
            target_role=UserRole.STUDENT,
            recipient_email=student.email,
        )
        db.add(notif)
        db.commit()

    return {"status": "success", "message": "Candidate status updated successfully."}

@router.post("/bulk-advance")
def bulk_advance_candidates(
    req: BulkAdvanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Bulk mark students as Shortlisted, Cleared OA, Moved to Round 2, Selected, or Rejected."""
    apps = db.query(DriveApplication).filter(DriveApplication.id.in_(req.application_ids)).all()
    for app in apps:
        app.current_status = req.new_status
        app.current_round_name = req.current_round_name
        if req.round_date:
            app.round_date = req.round_date
        if req.round_slot:
            app.round_slot = req.round_slot
        if req.venue_or_link:
            app.venue_or_link = req.venue_or_link
        if req.instructions:
            app.instructions = req.instructions

    db.commit()
    return {"status": "success", "updated_count": len(apps), "message": f"Updated {len(apps)} candidates to '{req.current_round_name}'"}

@router.get("/export/csv")
def export_applicants_csv(
    drive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Export filtered registered candidate list to formatted CSV for recruiters (PRD Module 2-B)."""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    apps = db.query(DriveApplication).filter(DriveApplication.drive_id == drive_id).all()
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Roll Number",
        "Full Name",
        "Official Email",
        "Phone Number",
        "Branch",
        "CGPA",
        "10th %",
        "12th %",
        "Active Backlogs",
        "Technical Skills",
        "Application Status",
        "Current Round",
        "Applied At",
    ])

    for a in apps:
        student = db.query(Student).filter(Student.id == a.student_id).first()
        if student:
            writer.writerow([
                student.roll_number,
                student.full_name,
                student.email,
                student.phone or "N/A",
                student.branch,
                student.cgpa,
                student.tenth_percentage,
                student.twelfth_percentage,
                student.active_backlogs,
                ", ".join(student.skills) if student.skills else "None",
                a.current_status.value if hasattr(a.current_status, "value") else str(a.current_status),
                a.current_round_name,
                a.applied_at.strftime("%Y-%m-%d %H:%M") if a.applied_at else "N/A",
            ])

    output.seek(0)
    filename = f"{drive.company_name.replace(' ', '_')}_{drive.role_title.replace(' ', '_')}_Applicants.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
