from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.models.drive import Drive
from app.schemas.ai_engine import (
    NLPAnalyzeRequest,
    NLPAnalyzeResponse,
    JobDescriptionAnalyzeRequest,
    JobDescriptionAnalyzeResponse,
    MLPlacementPredictionRequest,
    MLPlacementPredictionResponse,
    StudentRecommendationResponse,
    RecruiterCandidateRecommendationResponse,
    GenerativeAIRoadmapRequest,
    GenerativeAIRoadmapResponse,
)
from app.services.placement_ai_engine import (
    nlp_analyzer,
    ml_predictor,
    recommender_engine,
    generate_generative_ai_roadmap,
)

router = APIRouter(prefix="/ai", tags=["AI, ML, NLP & Recommendation Engine"])

# -------------------------------------------------------------
# 1. NLP Profile Analysis Endpoint
# -------------------------------------------------------------
@router.post("/analyze-student", response_model=NLPAnalyzeResponse)
def analyze_student_profile_nlp(req: NLPAnalyzeRequest):
    """
    NLP Engine: Parses candidate profile, extracts tech skills using taxonomy matching,
    detects primary engineering domain, and calculates semantic readiness score.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    res = nlp_analyzer.extract_skills_nlp(req.text)
    return res

# -------------------------------------------------------------
# 2. NLP Recruiter Job Description Parser Endpoint
# -------------------------------------------------------------
@router.post("/analyze-job", response_model=JobDescriptionAnalyzeResponse)
def analyze_recruiter_jd_nlp(req: JobDescriptionAnalyzeRequest):
    """
    NLP Engine: Analyzes recruiter Job Description, extracting required tech skills,
    minimum CGPA and backlog thresholds, and key engineering focus areas.
    """
    if not req.job_description or not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    res = nlp_analyzer.parse_job_description(
        req.job_description,
        company=req.company_name or "Company",
        role=req.role_title or "Software Engineer"
    )
    return res

# -------------------------------------------------------------
# 3. Supervised Machine Learning Placement Predictor
# -------------------------------------------------------------
@router.post("/predict-placement", response_model=MLPlacementPredictionResponse)
def predict_historical_placement_ml(
    req: MLPlacementPredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Machine Learning Engine: Uses Random Forest Model trained on historical placement datasets
    to compute placement likelihood, expected CTC LPA tier, and feature importances.
    """
    # If student_id is provided, populate missing metrics from database record
    student = None
    if req.student_id:
        student = db.query(Student).filter(Student.id == req.student_id).first()

    cgpa = student.cgpa if student else req.cgpa
    tenth = student.tenth_percentage if (student and student.tenth_percentage) else (req.tenth_percentage or 85.0)
    twelfth = student.twelfth_percentage if (student and student.twelfth_percentage) else (req.twelfth_percentage or 85.0)
    backlogs = student.active_backlogs if student else req.active_backlogs
    aptitude = student.aptitude_score if student else req.aptitude_score
    technical = student.technical_score if student else req.technical_score
    mock = student.mock_interview_score if student else req.mock_interview_score
    skills = student.skills if (student and student.skills) else req.skills
    branch = student.branch if student else req.branch
    projects_cnt = len(student.projects or []) if student else req.projects_count
    certs_cnt = len(student.certifications or []) if student else req.certifications_count

    prediction = ml_predictor.predict_placement(
        cgpa=cgpa,
        tenth_pct=tenth,
        twelfth_pct=twelfth,
        active_backlogs=backlogs,
        aptitude=aptitude,
        technical=technical,
        mock_score=mock,
        skills=skills,
        projects_count=projects_cnt,
        certs_count=certs_cnt,
        branch=branch
    )
    return prediction

# -------------------------------------------------------------
# 4. Hybrid Recommendation Engine for Students
# -------------------------------------------------------------
@router.get("/recommend-drives/{student_id}", response_model=StudentRecommendationResponse)
def recommend_drives_for_student(student_id: int, db: Session = Depends(get_db)):
    """
    Recommendation Engine: Employs TF-IDF Cosine Semantic Similarity + Skill Overlap +
    Hard Eligibility Filters to rank and recommend upcoming campus recruitment drives for a student.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        # Fallback to demo hero persona
        student = db.query(Student).filter(Student.roll_number == "22CS001").first()
    if not student:
        student = db.query(Student).first()
    if not student:
        raise HTTPException(status_code=404, detail="No student record found in database.")

    drives = db.query(Drive).all()
    recommendations = recommender_engine.recommend_drives_for_student(student, drives)

    return {
        "student_id": student.id,
        "student_name": student.full_name,
        "student_branch": student.branch,
        "student_cgpa": student.cgpa,
        "recommendations_count": len(recommendations),
        "top_recommended_drives": recommendations,
    }

# -------------------------------------------------------------
# 5. Recommendation Engine for Recruiters
# -------------------------------------------------------------
@router.get("/recommend-candidates/{drive_id}", response_model=RecruiterCandidateRecommendationResponse)
def recommend_candidates_for_drive(drive_id: int, db: Session = Depends(get_db)):
    """
    Recommendation Engine: Ranks candidate pool for a recruiter's recruitment drive,
    separating into High-Probability Shortlists vs Borderline candidates with fit justifications.
    """
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail=f"Drive with ID {drive_id} not found.")

    students = db.query(Student).all()
    res = recommender_engine.recommend_candidates_for_drive(drive, students)
    return res

# -------------------------------------------------------------
# 6. Generative AI Deep Placement Roadmap & Technical Q&A
# -------------------------------------------------------------
@router.post("/generate-roadmap", response_model=GenerativeAIRoadmapResponse)
async def generate_placement_roadmap_endpoint(
    req: GenerativeAIRoadmapRequest,
    db: Session = Depends(get_db)
):
    """
    Generative AI: Uses Google Gemini LLM to generate an actionable 14-day interview
    preparation sprint and 5 customized technical interview questions with model answers.
    """
    student = None
    if req.student_id:
        student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        student = db.query(Student).filter(Student.roll_number == "22CS001").first()
    if not student:
        student = db.query(Student).first()

    company_name = req.custom_target_company or "Google Cloud"
    role_title = req.custom_target_role or "Site Reliability Engineer"
    required_skills = ["Python", "Linux", "Docker", "Kubernetes", "PostgreSQL", "System Design"]

    if req.target_drive_id:
        target_drive = db.query(Drive).filter(Drive.id == req.target_drive_id).first()
        if target_drive:
            company_name = target_drive.company_name
            role_title = target_drive.role_title
            required_skills = target_drive.required_skills or required_skills

    roadmap = await generate_generative_ai_roadmap(
        student=student,
        company_name=company_name,
        role_title=role_title,
        required_skills=required_skills,
        api_key=req.api_key
    )
    return roadmap
