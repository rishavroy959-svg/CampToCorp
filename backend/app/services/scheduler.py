from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from app.models.drive import Drive, SlotType, ConflictType, ConflictSeverity

ALL_VENUES = [
    "Auditorium Hall A",
    "Auditorium Hall B",
    "CS Lab Complex 1",
    "ECE Seminar Room",
    "Main Conference Hall",
]

def slots_overlap(slot1: SlotType, slot2: SlotType) -> bool:
    if slot1 == SlotType.FULL_DAY or slot2 == SlotType.FULL_DAY:
        return True
    return slot1 == slot2

def check_drive_conflicts(
    target_drive: Drive,
    existing_drives: List[Drive],
    student_shortlists: Optional[Dict[int, List[int]]] = None, # drive_id -> list of student_ids
) -> List[Dict[str, Any]]:
    """Comprehensive conflict detection matching PRD FR-E1, FR-E2, FR-E3, and FR-E4."""
    conflicts = []
    
    for other in existing_drives:
        if other.id == target_drive.id:
            continue
            
        # Only compare if on the exact same date
        if other.drive_date != target_drive.drive_date:
            continue
            
        # Check if slots overlap
        if not slots_overlap(target_drive.slot, other.slot):
            continue

        # 1. Venue Double-Booking (PRD FR-E2 - CRITICAL)
        if target_drive.venue.lower().strip() == other.venue.lower().strip():
            conflicts.append({
                "type": ConflictType.VENUE_DOUBLE_BOOKING,
                "severity": ConflictSeverity.CRITICAL,
                "conflicting_drive_id": other.id,
                "conflicting_company": other.company_name,
                "description": f"Critical Collision: Venue '{target_drive.venue}' is already reserved by '{other.company_name}' on {target_drive.drive_date} ({other.slot.value}).",
                "affected_resource": target_drive.venue,
            })

        # 2. Competing Company Branch Clashes (PRD FR-E1 - WARNING)
        target_branches = set(target_drive.allowed_branches or [])
        other_branches = set(other.allowed_branches or [])
        common_branches = target_branches.intersection(other_branches)
        
        if common_branches and target_drive.venue.lower().strip() != other.venue.lower().strip():
            conflicts.append({
                "type": ConflictType.DATE_SLOT_OVERLAP,
                "severity": ConflictSeverity.WARNING,
                "conflicting_drive_id": other.id,
                "conflicting_company": other.company_name,
                "description": f"Schedule Overlap: Competing drive with '{other.company_name}' for overlapping branches [{', '.join(common_branches)}] on {target_drive.drive_date} ({target_drive.slot.value}).",
                "affected_resource": f"Branches: {', '.join(common_branches)}",
            })

        # 3. Student Simultaneous Interview Conflict (PRD FR-E3 - CRITICAL)
        if student_shortlists and target_drive.id in student_shortlists and other.id in student_shortlists:
            target_students = set(student_shortlists[target_drive.id])
            other_students = set(student_shortlists[other.id])
            clashing_students = target_students.intersection(other_students)
            
            if clashing_students:
                conflicts.append({
                    "type": ConflictType.STUDENT_SIMULTANEOUS,
                    "severity": ConflictSeverity.CRITICAL,
                    "conflicting_drive_id": other.id,
                    "conflicting_company": other.company_name,
                    "description": f"{len(clashing_students)} student(s) shortlisted simultaneously for both '{target_drive.company_name}' and '{other.company_name}' on {target_drive.drive_date}.",
                    "affected_resource": f"{len(clashing_students)} Students",
                    "affected_student_ids": list(clashing_students),
                })

    return conflicts

def suggest_alternative_slots(
    target_drive: Drive,
    all_drives: List[Drive],
) -> List[Dict[str, Any]]:
    """Auto-propose conflict-free alternative slots and venues (PRD FR-E5)."""
    suggestions = []
    
    # Check alternate slots on the same day
    candidate_slots = [SlotType.MORNING, SlotType.AFTERNOON]
    if target_drive.slot in candidate_slots:
        alt_slot = SlotType.AFTERNOON if target_drive.slot == SlotType.MORNING else SlotType.MORNING
        # Check if alt_slot is free at current venue
        occupied = any(
            d.id != target_drive.id and
            d.drive_date == target_drive.drive_date and
            slots_overlap(alt_slot, d.slot) and
            d.venue.lower().strip() == target_drive.venue.lower().strip()
            for d in all_drives
        )
        if not occupied:
            suggestions.append({
                "type": "SAME_DAY_DIFFERENT_SLOT",
                "date": str(target_drive.drive_date),
                "slot": alt_slot.value,
                "venue": target_drive.venue,
                "confidence": "High (Zero Venue Overlap)",
                "rationale": f"Keep date {target_drive.drive_date} but shift timing to {alt_slot.value} at {target_drive.venue}.",
            })

    # Check alternate venues on the same day and slot
    for venue in ALL_VENUES:
        if venue.lower().strip() == target_drive.venue.lower().strip():
            continue
        occupied = any(
            d.id != target_drive.id and
            d.drive_date == target_drive.drive_date and
            slots_overlap(target_drive.slot, d.slot) and
            d.venue.lower().strip() == venue.lower().strip()
            for d in all_drives
        )
        if not occupied:
            suggestions.append({
                "type": "SAME_DAY_DIFFERENT_VENUE",
                "date": str(target_drive.drive_date),
                "slot": target_drive.slot.value,
                "venue": venue,
                "confidence": "Optimal",
                "rationale": f"Maintain {target_drive.slot.value} slot on {target_drive.drive_date} by switching venue to '{venue}'.",
            })
            if len(suggestions) >= 2:
                break

    # Check adjacent next day
    next_day = target_drive.drive_date + timedelta(days=1)
    # Check if target venue is free on next day
    next_day_free = not any(
        d.id != target_drive.id and
        d.drive_date == next_day and
        slots_overlap(target_drive.slot, d.slot) and
        d.venue.lower().strip() == target_drive.venue.lower().strip()
        for d in all_drives
    )
    if next_day_free:
        suggestions.append({
            "type": "NEXT_AVAILABLE_DAY",
            "date": str(next_day),
            "slot": target_drive.slot.value,
            "venue": target_drive.venue,
            "confidence": "Recommended",
            "rationale": f"Postpone drive by 24 hours to {next_day} ({target_drive.slot.value}) at {target_drive.venue}.",
        })

    return suggestions
