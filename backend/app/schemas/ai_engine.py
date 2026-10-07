from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# NLP Profile & Job Description Schemas
# -------------------------------------------------------------

class NLPAnalyzeRequest(BaseModel):
    text: str = Field(..., description="Student resume, bio, or free-text skills statement")
    branch: Optional[str] = "CSE"
    cgpa: Optional[float] = 8.5

class NLPAnalyzeResponse(BaseModel):
    extracted_skills: List[str]
    skill_categories: Dict[str, List[str]]
    detected_domain: str
    experience_level: str
    nlp_readiness_score: float
    key_keywords: List[str]

class JobDescriptionAnalyzeRequest(BaseModel):
    job_description: str = Field(..., description="Full text of recruiter job posting")
    company_name: Optional[str] = "Company"
    role_title: Optional[str] = "Software Engineer"

class JobDescriptionAnalyzeResponse(BaseModel):
    company_name: str
    role_title: str
    extracted_required_skills: List[str]
    extracted_preferred_skills: List[str]
    extracted_min_cgpa: float
    extracted_max_backlogs: int
    detected_domain: str
    key_responsibilities: List[str]
    interview_focus_areas: List[str]

# -------------------------------------------------------------
# ML Historical Placement Predictor Schemas
# -------------------------------------------------------------

class MLPlacementPredictionRequest(BaseModel):
    student_id: Optional[int] = None
    cgpa: float = Field(..., ge=0.0, le=10.0)
    tenth_percentage: Optional[float] = 85.0
    twelfth_percentage: Optional[float] = 85.0
    active_backlogs: int = Field(0, ge=0)
    aptitude_score: float = Field(..., ge=0.0, le=100.0)
    technical_score: float = Field(..., ge=0.0, le=100.0)
    mock_interview_score: float = Field(..., ge=0.0, le=100.0)
    skills: List[str] = []
    projects_count: int = 2
    certifications_count: int = 1
    branch: str = "CSE"

class FeatureImportanceItem(BaseModel):
    feature: str
    importance_pct: float
    impact: str  # "positive" | "negative" | "neutral"
    description: str

class MLPlacementPredictionResponse(BaseModel):
    placement_probability_pct: float
    placement_likelihood: str  # "Very High", "High", "Moderate", "At Risk"
    predicted_ctc_tier: str    # "Super-Dream (20+ LPA)", "Dream (10-20 LPA)", "Regular (<10 LPA)"
    predicted_ctc_lpa_range: str
    feature_importances: List[FeatureImportanceItem]
    top_strengths: List[str]
    risk_factors: List[str]
    model_metadata: Dict[str, Any]

# -------------------------------------------------------------
# Recommendation Engine Schemas
# -------------------------------------------------------------

class DriveRecommendationItem(BaseModel):
    drive_id: int
    company_name: str
    role_title: str
    ctc_lpa: float
    venue: str
    drive_date: str
    match_score_pct: float
    nlp_semantic_similarity_pct: float
    hard_eligibility_status: bool
    ineligibility_reasons: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    recommended_reason: str

class StudentRecommendationResponse(BaseModel):
    student_id: int
    student_name: str
    student_branch: str
    student_cgpa: float
    recommendations_count: int
    top_recommended_drives: List[DriveRecommendationItem]

class CandidateRecommendationItem(BaseModel):
    student_id: int
    full_name: str
    roll_number: str
    branch: str
    cgpa: float
    match_score_pct: float
    nlp_semantic_similarity_pct: float
    is_eligible: bool
    matched_skills: List[str]
    missing_skills: List[str]
    readiness_level: str
    recommendation_tier: str  # "Strong Match", "Potential Match", "Gap Remediation"
    fit_justification: str

class RecruiterCandidateRecommendationResponse(BaseModel):
    drive_id: int
    company_name: str
    role_title: str
    candidates_analyzed: int
    shortlisted_candidates: List[CandidateRecommendationItem]
    borderline_candidates: List[CandidateRecommendationItem]

# -------------------------------------------------------------
# Generative AI Roadmaps & Interview Questions
# -------------------------------------------------------------

class GenerativeAIRoadmapRequest(BaseModel):
    student_id: Optional[int] = None
    target_drive_id: Optional[int] = None
    custom_target_role: Optional[str] = "Cloud SDE"
    custom_target_company: Optional[str] = "Google Cloud"
    api_key: Optional[str] = None

class PreparationRoadmapDay(BaseModel):
    day: str
    focus_topic: str
    key_tasks: List[str]
    recommended_resources: List[str]

class TechnicalInterviewQuestion(BaseModel):
    question: str
    topic: str
    difficulty: str
    expected_answer_points: List[str]

class GenerativeAIRoadmapResponse(BaseModel):
    student_name: str
    target_company: str
    target_role: str
    fit_summary: str
    critical_skill_gaps: List[str]
    personalized_14day_roadmap: List[PreparationRoadmapDay]
    curated_interview_questions: List[TechnicalInterviewQuestion]
    model_used: str
