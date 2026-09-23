from datetime import datetime, timezone, date
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.drive import Drive, DriveStatus, SlotType, ConflictLog, ConflictType, ConflictSeverity
from app.schemas.drive import DriveCreate, DriveUpdate, DriveResponse, ConflictResolveRequest, ConflictLogResponse
from app.services.scheduler import check_drive_conflicts, suggest_alternative_slots
from app.api.deps import require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/drives", tags=["Drives & Scheduling"])

class RescheduleRequest(BaseModel):
    new_date: date
    new_slot: SlotType
    new_venue: str
    reason: str

@router.get("/", response_model=List[DriveResponse])
def get_drives(
    status: Optional[DriveStatus] = None,
    has_conflict: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Retrieve placement drives with optional status and conflict filters."""
    Base.metadata.create_all(bind=engine)
    query = db.query(Drive)
    if status:
        query = query.filter(Drive.status == status)
    if has_conflict is not None:
        query = query.filter(Drive.has_conflict == has_conflict)
    return query.order_by(Drive.drive_date.asc()).all()

@router.get("/conflicts/all", response_model=List[ConflictLogResponse])
def get_all_conflicts(
    unresolved_only: bool = True,
    db: Session = Depends(get_db),
):
    """Retrieve all detected calendar and venue collisions (PRD FR-E1 to FR-E4)."""
    Base.metadata.create_all(bind=engine)
    query = db.query(ConflictLog)
    if unresolved_only:
        query = query.filter(ConflictLog.is_resolved == False)
    return query.order_by(ConflictLog.created_at.desc()).all()

@router.get("/{drive_id}", response_model=DriveResponse)
def get_drive(drive_id: int, db: Session = Depends(get_db)):
    """Retrieve specific drive with its assigned slots and conflicts."""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    return drive

@router.get("/{drive_id}/alternatives")
def get_alternative_slots(drive_id: int, db: Session = Depends(get_db)):
    """Auto-propose conflict-free alternative slots and venues for a conflicted drive (PRD FR-E5)."""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    all_drives = db.query(Drive).filter(Drive.status != DriveStatus.CANCELLED).all()
    suggestions = suggest_alternative_slots(drive, all_drives)
    return {
        "drive_id": drive.id,
        "company_name": drive.company_name,
        "current_date": str(drive.drive_date),
        "current_slot": drive.slot.value,
        "current_venue": drive.venue,
        "has_conflict": drive.has_conflict,
        "alternative_suggestions": suggestions,
    }

@router.post("/{drive_id}/reschedule", response_model=DriveResponse)
def reschedule_drive(
    drive_id: int,
    req: RescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Reschedule a drive to resolve conflicts with automated audit logging (PRD FR-E5, FR-E6)."""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    old_date = drive.drive_date
    old_slot = drive.slot
    old_venue = drive.venue

    drive.drive_date = req.new_date
    drive.slot = req.new_slot
    drive.venue = req.new_venue

    # Re-evaluate conflicts for new schedule
    all_drives = db.query(Drive).filter(Drive.status != DriveStatus.CANCELLED).all()
    new_conflicts = check_drive_conflicts(drive, all_drives)

    # Mark old conflicts as resolved
    existing_conflicts = db.query(ConflictLog).filter(
        ConflictLog.drive_id == drive.id,
        ConflictLog.is_resolved == False
    ).all()

    for ec in existing_conflicts:
        ec.is_resolved = True
        ec.resolution_notes = f"Rescheduled from {old_date} ({old_slot.value}, {old_venue}) to {req.new_date} ({req.new_slot.value}, {req.new_venue}). Reason: {req.reason}"
        ec.resolved_by = current_user.full_name
        ec.resolved_at = datetime.now(timezone.utc)
        ec.severity = ConflictSeverity.RESOLVED

    if not new_conflicts:
        drive.has_conflict = False
        drive.conflict_summary = None
    else:
        drive.has_conflict = True
        drive.conflict_summary = new_conflicts[0]["description"]
        for nc in new_conflicts:
            db.add(ConflictLog(
                drive_id=drive.id,
                conflicting_drive_id=nc.get("conflicting_drive_id"),
                conflict_type=nc["type"],
                severity=nc["severity"],
                description=nc["description"],
                affected_resource=nc.get("affected_resource"),
            ))

    db.commit()
    db.refresh(drive)
    return drive

@router.post("/", response_model=DriveResponse)
def create_drive(
    drive_in: DriveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Create a new recruitment drive and automatically detect date/venue overlaps."""
    Base.metadata.create_all(bind=engine)
    existing_drives = db.query(Drive).filter(Drive.status != DriveStatus.CANCELLED).all()

    temp_drive = Drive(**drive_in.dict())
    conflicts = check_drive_conflicts(temp_drive, existing_drives)

    has_conflict = len(conflicts) > 0
    conflict_summary = conflicts[0]["description"] if has_conflict else None

    drive = Drive(
        **drive_in.dict(),
        has_conflict=has_conflict,
        conflict_summary=conflict_summary,
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)

    for c in conflicts:
        db.add(ConflictLog(
            drive_id=drive.id,
            conflicting_drive_id=c.get("conflicting_drive_id"),
            conflict_type=c["type"],
            severity=c["severity"],
            description=c["description"],
            affected_resource=c.get("affected_resource"),
        ))
    db.commit()

    return drive

@router.post("/conflicts/{conflict_id}/resolve", response_model=ConflictLogResponse)
def resolve_conflict(
    conflict_id: int,
    req: ConflictResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Mark a detected drive conflict as resolved with recorded audit notes (PRD FR-E6)."""
    conflict = db.query(ConflictLog).filter(ConflictLog.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")
        
    conflict.is_resolved = True
    conflict.resolution_notes = req.resolution_notes
    conflict.resolved_by = req.resolved_by
    conflict.resolved_at = datetime.now(timezone.utc)
    conflict.severity = ConflictSeverity.RESOLVED
    
    drive = db.query(Drive).filter(Drive.id == conflict.drive_id).first()
    if drive:
        remaining = db.query(ConflictLog).filter(
            ConflictLog.drive_id == drive.id,
            ConflictLog.is_resolved == False
        ).count()
        if remaining == 0:
            drive.has_conflict = False
            drive.conflict_summary = None
            
    db.commit()
    db.refresh(conflict)
    return conflict
