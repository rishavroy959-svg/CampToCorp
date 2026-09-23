from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db, Base, engine
from app.models.offer import Offer, OfferStatus
from app.models.student import Student, StudentStatus
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse, DocVerificationRequest
from app.api.deps import require_role, get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/offers", tags=["Offer & Documentation Tracking"])

@router.get("/", response_model=List[OfferResponse])
def get_offers(
    status: Optional[OfferStatus] = None,
    docs_verified: Optional[bool] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Retrieve offers with optional filters (PRD Module F)."""
    Base.metadata.create_all(bind=engine)
    query = db.query(Offer)
    if status:
        query = query.filter(Offer.status == status)
    if docs_verified is not None:
        query = query.filter(Offer.docs_verified == docs_verified)
    if student_id:
        query = query.filter(Offer.student_id == student_id)
    return query.order_by(Offer.created_at.desc()).all()

@router.post("/", response_model=OfferResponse)
def create_offer(
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.RECRUITER, UserRole.ADMIN])),
):
    """Record an offer letter with CTC, role, and bond terms (PRD FR-F1)."""
    Base.metadata.create_all(bind=engine)
    student = db.query(Student).filter(Student.id == offer_in.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    offer = Offer(**offer_in.dict())
    db.add(offer)
    
    # Update student status to OFFER_EXTENDED
    student.status = StudentStatus.OFFER_EXTENDED
    
    db.commit()
    db.refresh(offer)
    return offer

@router.patch("/{offer_id}/status", response_model=OfferResponse)
def update_offer_status(
    offer_id: int,
    status_update: OfferUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update offer acceptance, deferral, or withdrawal (PRD FR-F4)."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    if status_update.status:
        offer.status = status_update.status
        offer.status_updated_at = datetime.now(timezone.utc)
        
        # If accepted, mark student as PLACED
        if status_update.status == OfferStatus.ACCEPTED:
            student = db.query(Student).filter(Student.id == offer.student_id).first()
            if student:
                student.status = StudentStatus.PLACED
                
    if status_update.notes:
        offer.notes = status_update.notes
        
    db.commit()
    db.refresh(offer)
    return offer

@router.post("/{offer_id}/verify-docs", response_model=OfferResponse)
def verify_offer_documents(
    offer_id: int,
    req: DocVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PLACEMENT_OFFICER, UserRole.ADMIN])),
):
    """Verify submitted joining bonds and documentation (PRD FR-F2)."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    offer.docs_verified = req.docs_verified
    offer.verified_by = req.verified_by
    if req.notes:
        offer.notes = req.notes
        
    db.commit()
    db.refresh(offer)
    return offer
