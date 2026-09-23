from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.services.interview_analyzer import get_role_questions, evaluate_interview_response
from app.services.ai_matching import parse_text_skills, calculate_student_readiness

router = APIRouter(prefix="/interview", tags=["AI Mock Interview & Diagnostics"])

class InterviewEvalRequest(BaseModel):
    student_id: Optional[int] = None
    role_title: str = "Site Reliability Engineer"
    question: str
    response_text: str

class ResumeParseRequest(BaseModel):
    student_id: Optional[int] = None
    resume_text: str

@router.get("/questions")
def get_questions(role: str = "Site Reliability Engineer") -> List[Dict[str, str]]:
    """Retrieve curated technical & scenario mock interview questions for a target role."""
    return get_role_questions(role)

@router.post("/evaluate")
def evaluate_response(
    req: InterviewEvalRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Score candidate interview response and dynamically update readiness rating."""
    eval_result = evaluate_interview_response(
        question=req.question,
        response_text=req.response_text,
        target_role=req.role_title,
    )

    # If student_id provided, update student's mock interview score in database
    if req.student_id:
        student = db.query(Student).filter(Student.id == req.student_id).first()
        if student:
            # Update running average of mock interview score
            student.mock_interview_score = round(
                (student.mock_interview_score * 0.4) + (eval_result["overall_score"] * 0.6), 1
            )
            student.communication_score = round(
                (student.communication_score * 0.4) + (eval_result["communication_score"] * 0.6), 1
            )
            # Recompute readiness profile
            profile = calculate_student_readiness(student)
            student.readiness_score = profile["overall_readiness_score"]
            student.readiness_level = profile["readiness_level"]
            db.commit()
            db.refresh(student)

            eval_result["updated_readiness_score"] = student.readiness_score
            eval_result["updated_readiness_level"] = student.readiness_level.value

    return eval_result

@router.post("/parse-resume")
def parse_resume_text(
    req: ResumeParseRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Extract technical skills and predict employability readiness boost from free-text resume."""
    extracted_skills = parse_text_skills(req.resume_text)

    # Detect projects from text
    lines = req.resume_text.splitlines()
    detected_projects = [
        line.strip() for line in lines
        if any(kw in line.lower() for kw in ["project", "developed", "built", "implemented", "engineered"])
        and len(line.strip()) > 15
    ][:4]

    # Calculate simulated readiness boost
    current_score = 72
    new_score = min(100, current_score + (len(extracted_skills) * 2) + (len(detected_projects) * 3))

    if req.student_id:
        student = db.query(Student).filter(Student.id == req.student_id).first()
        if student:
            # Merge verified skills
            existing = set(student.skills or [])
            merged = list(existing.union(set(extracted_skills)))
            student.skills = merged
            profile = calculate_student_readiness(student)
            student.readiness_score = profile["overall_readiness_score"]
            student.readiness_level = profile["readiness_level"]
            db.commit()
            new_score = student.readiness_score

    return {
        "extracted_skills": extracted_skills,
        "skills_count": len(extracted_skills),
        "detected_projects": detected_projects,
        "estimated_readiness_score": new_score,
        "readiness_boost": max(0, new_score - current_score),
    }
