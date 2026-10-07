from typing import Dict, Any, List, Optional
from statistics import median
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.student import Student, ReadinessTier, StudentStatus
from app.models.offer import Offer, OfferStatus
from app.models.drive import Drive, DriveStatus
from app.models.user import User
from app.api.deps import get_optional_user, resolve_college_scope, NO_ACCESS

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])


def _pct(part: int, whole: int) -> float:
    return round((part / whole) * 100, 1) if whole else 0.0


@router.get("/overview")
def get_placement_overview(
    college_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
) -> Dict[str, Any]:
    """Real placement analytics computed only from the caller's college data (PRD Module G)."""
    Base.metadata.create_all(bind=engine)
    scope = resolve_college_scope(current_user, college_id)

    if scope == NO_ACCESS:
        students: List[Student] = []
        drives: List[Drive] = []
    else:
        sq = db.query(Student)
        dq = db.query(Drive)
        if scope is not None:
            sq = sq.filter(Student.college_id == scope)
            dq = dq.filter(Drive.college_id == scope)
        students = sq.all()
        drives = dq.all()

    student_ids = [s.id for s in students]
    offers: List[Offer] = (
        db.query(Offer).filter(Offer.student_id.in_(student_ids)).all() if student_ids else []
    )

    total_students = len(students)
    placed_students = sum(1 for s in students if s.status == StudentStatus.PLACED)
    at_risk_count = sum(1 for s in students if s.at_risk)
    total_offers = len(offers)

    valid_ctcs = [o.ctc_lpa for o in offers if o.status in (OfferStatus.ACCEPTED, OfferStatus.PENDING) and o.ctc_lpa]
    all_ctcs = [o.ctc_lpa for o in offers if o.ctc_lpa]
    avg_ctc = round(sum(valid_ctcs) / len(valid_ctcs), 2) if valid_ctcs else 0.0
    highest_ctc = float(max(all_ctcs)) if all_ctcs else 0.0
    median_ctc = round(float(median(valid_ctcs)), 2) if valid_ctcs else 0.0

    # Readiness distribution
    tiers = {t: 0 for t in ReadinessTier}
    for s in students:
        if s.readiness_level in tiers:
            tiers[s.readiness_level] += 1

    # Department conversions
    by_branch: Dict[str, Dict[str, Any]] = {}
    for s in students:
        b = by_branch.setdefault(s.branch or "N/A", {"total": 0, "placed": 0, "ctcs": []})
        b["total"] += 1
        if s.status == StudentStatus.PLACED:
            b["placed"] += 1
    for o in offers:
        st = next((s for s in students if s.id == o.student_id), None)
        if st and o.ctc_lpa:
            by_branch.setdefault(st.branch or "N/A", {"total": 0, "placed": 0, "ctcs": []})["ctcs"].append(o.ctc_lpa)
    department_conversions = [
        {
            "branch": br,
            "total": d["total"],
            "placed": d["placed"],
            "rate_pct": _pct(d["placed"], d["total"]),
            "avg_ctc": round(sum(d["ctcs"]) / len(d["ctcs"]), 2) if d["ctcs"] else 0.0,
        }
        for br, d in sorted(by_branch.items())
    ]

    # CTC bands
    bands = [
        ("Super Dream (> 20 LPA)", lambda c: c > 20),
        ("Dream (10 - 20 LPA)", lambda c: 10 <= c <= 20),
        ("Regular (5 - 10 LPA)", lambda c: 5 <= c < 10),
        ("Foundation (< 5 LPA)", lambda c: c < 5),
    ]
    ctc_bands = []
    for name, fn in bands:
        cnt = sum(1 for c in all_ctcs if fn(c))
        ctc_bands.append({"name": name, "count": cnt, "pct": _pct(cnt, len(all_ctcs))})

    placement_rate = _pct(placed_students, total_students)

    return {
        "academic_year": "2025-2026",
        "cohort": "B.Tech Final Year",
        "kpis": {
            "total_students": total_students,
            "placed_students": placed_students,
            "placement_rate_pct": placement_rate,
            "total_offers": total_offers,
            "avg_ctc_lpa": avg_ctc,
            "highest_ctc_lpa": highest_ctc,
            "at_risk_count": at_risk_count,
            "active_drives_count": sum(1 for d in drives if d.status in (DriveStatus.UPCOMING, DriveStatus.ACTIVE)),
        },
        "readiness_distribution": {
            "tier_1_highly_employable": tiers[ReadinessTier.HIGHLY_EMPLOYABLE],
            "tier_2_job_ready": tiers[ReadinessTier.READY],
            "tier_3_developing": tiers[ReadinessTier.DEVELOPING],
            "tier_4_at_risk": tiers[ReadinessTier.NOT_READY],
        },
        "department_conversions": department_conversions,
        "ctc_bands": ctc_bands,
        "compliance": {
            "nirf_metric_5_2_1": f"{placement_rate}% placed",
            "median_salary_lpa": median_ctc,
            "higher_studies_count": 0,
            "entrepreneurship_count": 0,
        },
    }
