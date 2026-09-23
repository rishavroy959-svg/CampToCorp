from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.student import Student, ReadinessTier
from app.models.drive import Drive
from app.models.matching import StudentJobMatch
from app.schemas.matching import MatchResultResponse, ShortlistRequest, OverrideRequest
from app.services.ai_matching import calculate_composite_fit, calculate_student_readiness
from app.api.deps import require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/matching", tags=["AI Matching & Explainability"])

@router.post("/drives/{drive_id}/run", response_model=List[MatchResultResponse])
def run_drive_matching(
    drive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.RECRUITER, UserRole.ADMIN])),
):
    """Execute AI matching & ranking algorithm across all students for a recruitment drive (PRD Module B)."""
    Base.metadata.create_all(bind=engine)
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    students = db.query(Student).all()
    results = []

    for s in students:
        # Run hybrid composite calculation
        match_data = calculate_composite_fit(s, drive)
        
        # Check if record already exists
        existing_match = db.query(StudentJobMatch).filter(
            StudentJobMatch.student_id == s.id,
            StudentJobMatch.drive_id == drive.id,
        ).first()

        if existing_match:
            # Update scores if no manual override was locked
            if not existing_match.override_applied:
                existing_match.fit_score = match_data["fit_score"]
                existing_match.is_eligible = match_data["is_eligible"]
                existing_match.matched_skills = match_data["matched_skills"]
                existing_match.partial_skills = match_data["partial_skills"]
                existing_match.missing_skills = match_data["missing_skills"]
                existing_match.explanation = match_data["explanation"]
                existing_match.factor_breakdown = match_data["factor_breakdown"]
                # Auto-shortlist if score >= 75 and eligible
                existing_match.is_shortlisted = match_data["is_eligible"] and match_data["fit_score"] >= 75.0
            match_record = existing_match
        else:
            match_record = StudentJobMatch(
                student_id=s.id,
                drive_id=drive.id,
                fit_score=match_data["fit_score"],
                is_eligible=match_data["is_eligible"],
                matched_skills=match_data["matched_skills"],
                partial_skills=match_data["partial_skills"],
                missing_skills=match_data["missing_skills"],
                explanation=match_data["explanation"],
                factor_breakdown=match_data["factor_breakdown"],
                is_shortlisted=match_data["is_eligible"] and match_data["fit_score"] >= 75.0,
            )
            db.add(match_record)

        db.commit()
        db.refresh(match_record)

        results.append(
            MatchResultResponse(
                id=match_record.id,
                student_id=s.id,
                drive_id=drive.id,
                student_name=s.full_name,
                branch=s.branch,
                cgpa=s.cgpa,
                fit_score=match_record.fit_score,
                readiness_level=match_data["readiness_level"],
                is_eligible=match_record.is_eligible,
                matched_skills=match_record.matched_skills or [],
                partial_skills=match_record.partial_skills or [],
                missing_skills=match_record.missing_skills or [],
                explanation=match_record.explanation,
                factor_breakdown=match_record.factor_breakdown or [],
                is_shortlisted=match_record.is_shortlisted,
                override_applied=match_record.override_applied,
                override_reason=match_record.override_reason,
                override_by=match_record.override_by,
                override_timestamp=match_record.override_timestamp,
            )
        )

    # Sort descending by fit score (PRD FR-B5)
    results.sort(key=lambda x: (x.is_eligible, x.fit_score), reverse=True)
    return results

@router.get("/drives/{drive_id}/results", response_model=List[MatchResultResponse])
def get_drive_matching_results(
    drive_id: int,
    eligible_only: bool = False,
    shortlisted_only: bool = False,
    db: Session = Depends(get_db),
):
    """Retrieve ranked candidate pool for a drive with explainable justifications (PRD Module D)."""
    Base.metadata.create_all(bind=engine)
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    matches = db.query(StudentJobMatch, Student).join(
        Student, StudentJobMatch.student_id == Student.id
    ).filter(StudentJobMatch.drive_id == drive_id)

    if eligible_only:
        matches = matches.filter(StudentJobMatch.is_eligible == True)
    if shortlisted_only:
        matches = matches.filter(StudentJobMatch.is_shortlisted == True)

    matches_list = matches.all()
    results = []

    for match, student in matches_list:
        results.append(
            MatchResultResponse(
                id=match.id,
                student_id=student.id,
                drive_id=drive_id,
                student_name=student.full_name,
                branch=student.branch,
                cgpa=student.cgpa,
                fit_score=match.fit_score,
                readiness_level=student.readiness_level,
                is_eligible=match.is_eligible,
                matched_skills=match.matched_skills or [],
                partial_skills=match.partial_skills or [],
                missing_skills=match.missing_skills or [],
                explanation=match.explanation,
                factor_breakdown=match.factor_breakdown or [],
                is_shortlisted=match.is_shortlisted,
                override_applied=match.override_applied,
                override_reason=match.override_reason,
                override_by=match.override_by,
                override_timestamp=match.override_timestamp,
            )
        )

    results.sort(key=lambda x: (x.is_eligible, x.fit_score), reverse=True)
    return results

@router.post("/override", response_model=MatchResultResponse)
def apply_officer_override(
    req: OverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Allow Placement Officers to override an AI shortlisting decision with logged audit reason (PRD FR-D3)."""
    match = db.query(StudentJobMatch).filter(StudentJobMatch.id == req.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match record not found")
        
    student = db.query(Student).filter(Student.id == match.student_id).first()
    
    match.is_shortlisted = req.new_shortlist_status
    match.override_applied = True
    match.override_reason = req.override_reason
    match.override_by = req.override_by
    match.override_timestamp = datetime.now(timezone.utc)
    match.explanation = f"[Officer Override by {req.override_by}: '{req.override_reason}'] — Original AI Evaluation: {match.explanation}"
    
    db.commit()
    db.refresh(match)

    return MatchResultResponse(
        id=match.id,
        student_id=match.student_id,
        drive_id=match.drive_id,
        student_name=student.full_name,
        branch=student.branch,
        cgpa=student.cgpa,
        fit_score=match.fit_score,
        readiness_level=student.readiness_level,
        is_eligible=match.is_eligible,
        matched_skills=match.matched_skills or [],
        partial_skills=match.partial_skills or [],
        missing_skills=match.missing_skills or [],
        explanation=match.explanation,
        factor_breakdown=match.factor_breakdown or [],
        is_shortlisted=match.is_shortlisted,
        override_applied=match.override_applied,
        override_reason=match.override_reason,
        override_by=match.override_by,
        override_timestamp=match.override_timestamp,
    )

@router.post("/students/{student_id}/readiness")
def evaluate_student_readiness(student_id: int, db: Session = Depends(get_db)):
    """Re-compute global employability readiness score and gap analysis for a student (PRD Module C)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    readiness = calculate_student_readiness(student)
    
    student.readiness_score = readiness["readiness_score"]
    student.readiness_level = readiness["readiness_level"]
    student.skill_gaps = readiness["skill_gaps"]
    student.recommended_actions = readiness["recommended_actions"]
    student.at_risk = readiness["at_risk"]
    student.risk_score = readiness["risk_score"]
    
    db.commit()
    db.refresh(student)
    return readiness
