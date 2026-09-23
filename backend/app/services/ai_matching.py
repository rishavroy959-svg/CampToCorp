import re
import math
from typing import List, Dict, Any, Tuple
from app.models.student import Student, ReadinessTier
from app.models.drive import Drive

# Comprehensive Skill Ontology for Normalization & Related Tech
SKILL_ONTOLOGY: Dict[str, Dict[str, Any]] = {
    "python": {"family": "languages", "aliases": ["python3", "py"], "related": ["django", "fastapi", "flask", "numpy", "pandas"]},
    "javascript": {"family": "languages", "aliases": ["js", "es6"], "related": ["typescript", "react", "node.js", "express"]},
    "typescript": {"family": "languages", "aliases": ["ts"], "related": ["javascript", "angular", "react", "next.js"]},
    "java": {"family": "languages", "aliases": ["java8", "java17"], "related": ["spring", "spring boot", "hibernate", "kotlin"]},
    "c++": {"family": "languages", "aliases": ["cpp", "cplusplus"], "related": ["c", "stl", "algorithms", "data structures"]},
    "react": {"family": "frontend", "aliases": ["reactjs", "react.js"], "related": ["javascript", "typescript", "next.js", "redux", "tailwind"]},
    "next.js": {"family": "frontend", "aliases": ["nextjs", "next"], "related": ["react", "typescript", "tailwind", "node.js"]},
    "fastapi": {"family": "backend", "aliases": ["fast api"], "related": ["python", "pydantic", "sqlalchemy", "docker", "uvicorn"]},
    "django": {"family": "backend", "aliases": ["django rest framework", "drf"], "related": ["python", "postgresql", "orm"]},
    "node.js": {"family": "backend", "aliases": ["nodejs", "node"], "related": ["express", "javascript", "typescript", "mongodb"]},
    "postgresql": {"family": "databases", "aliases": ["postgres", "pgsql"], "related": ["sql", "mysql", "databases", "sqlalchemy"]},
    "mongodb": {"family": "databases", "aliases": ["mongo", "nosql"], "related": ["node.js", "databases", "express"]},
    "docker": {"family": "devops", "aliases": ["containerization", "containers"], "related": ["kubernetes", "aws", "ci/cd", "linux"]},
    "kubernetes": {"family": "devops", "aliases": ["k8s"], "related": ["docker", "aws", "cloud", "helm"]},
    "aws": {"family": "cloud", "aliases": ["amazon web services", "cloud architecture"], "related": ["cloud", "docker", "s3", "ec2", "lambda"]},
    "machine learning": {"family": "ai", "aliases": ["ml", "scikit-learn", "sklearn"], "related": ["python", "pandas", "numpy", "tensorflow", "pytorch"]},
    "data structures": {"family": "fundamentals", "aliases": ["dsa", "algorithms"], "related": ["c++", "java", "python", "problem solving"]},
}

def normalize_skill(skill: str) -> str:
    cleaned = skill.strip().lower()
    for canonical, data in SKILL_ONTOLOGY.items():
        if cleaned == canonical or cleaned in data["aliases"]:
            return canonical
    return cleaned

def parse_text_skills(text: str) -> List[str]:
    """Extract skills from free-text using ontology matching (PRD FR-B1)."""
    text_lower = text.lower()
    found = set()
    for canonical, data in SKILL_ONTOLOGY.items():
        patterns = [re.escape(canonical)] + [re.escape(a) for a in data["aliases"]]
        for p in patterns:
            if re.search(r'\b' + p + r'\b', text_lower):
                found.add(canonical)
                break
    return list(found)

def evaluate_hard_eligibility(student: Student, drive: Drive) -> Tuple[bool, List[str]]:
    """Apply deterministic hard filters for branch, CGPA, and backlogs (PRD FR-B3)."""
    reasons = []
    
    # 1. CGPA Filter
    if student.cgpa < drive.min_cgpa:
        reasons.append(f"CGPA ({student.cgpa:.1f}) is below minimum cutoff of {drive.min_cgpa:.1f}")
        
    # 2. Branch Filter
    if drive.allowed_branches:
        normalized_allowed = [b.upper().strip() for b in drive.allowed_branches]
        if student.branch.upper().strip() not in normalized_allowed:
            reasons.append(f"Branch '{student.branch}' is not in eligible branches: {', '.join(drive.allowed_branches)}")
            
    # 3. Backlog Filter
    if student.active_backlogs > drive.max_backlogs_allowed:
        reasons.append(f"Active backlogs ({student.active_backlogs}) exceed maximum allowed ({drive.max_backlogs_allowed})")
        
    is_eligible = len(reasons) == 0
    return is_eligible, reasons

def classify_skills(student_skills: List[str], required_skills: List[str]) -> Tuple[List[str], List[str], List[str], float]:
    """Classify candidate skills into matched, partial, and missing categories (PRD FR-B2, Design Doc 7.4)."""
    normalized_student = {normalize_skill(s) for s in student_skills}
    
    matched = []
    partial = []
    missing = []
    
    for req in required_skills:
        canon_req = normalize_skill(req)
        if canon_req in normalized_student:
            matched.append(req)
        else:
            # Check for partial / related skills in ontology
            req_info = SKILL_ONTOLOGY.get(canon_req)
            is_partial = False
            if req_info:
                for rel in req_info["related"]:
                    if rel in normalized_student:
                        partial.append(f"{req} (via {rel.title()})")
                        is_partial = True
                        break
            if not is_partial:
                missing.append(req)
                
    total_req = max(1, len(required_skills))
    skill_score = ((len(matched) * 1.0) + (len(partial) * 0.5)) / total_req
    return matched, partial, missing, min(1.0, skill_score)

def calculate_composite_fit(student: Student, drive: Drive) -> Dict[str, Any]:
    """Compute hybrid fit score and natural-language explainable justification (PRD Module B & D)."""
    # 1. Hard Eligibility Check
    is_eligible, ineligibility_reasons = evaluate_hard_eligibility(student, drive)
    
    # 2. Skill Classification & Match Score
    req_skills = drive.required_skills or ["Python", "Problem Solving"]
    matched, partial, missing, skill_score_ratio = classify_skills(student.skills or [], req_skills)
    
    # 3. Normalized Component Scores
    cgpa_score = min(1.0, student.cgpa / 10.0)
    avg_assessment = ((student.aptitude_score or 70.0) + (student.mock_interview_score or 70.0)) / 200.0
    project_score = min(1.0, len(student.projects or []) * 0.35 + 0.3)
    
    # 4. Weighted Composite Fit Score Formula (PRD FR-B5):
    # Skill Match: 50% | CGPA: 20% | Assessments: 15% | Projects: 15%
    raw_fit = (
        (skill_score_ratio * 50.0) +
        (cgpa_score * 20.0) +
        (avg_assessment * 15.0) +
        (project_score * 15.0)
    )
    
    # Penalty if not eligible
    final_fit_score = round(raw_fit if is_eligible else max(20.0, raw_fit * 0.5), 1)
    
    # 5. Determine Readiness Tier for this role
    if final_fit_score >= 86:
        readiness_tier = ReadinessTier.HIGHLY_EMPLOYABLE
    elif final_fit_score >= 71:
        readiness_tier = ReadinessTier.READY
    elif final_fit_score >= 41:
        readiness_tier = ReadinessTier.DEVELOPING
    else:
        readiness_tier = ReadinessTier.NOT_READY
        
    # 6. Build Factor Contributions (SHAP-Style Feature Influences)
    factors = []
    if is_eligible:
        factors.append({
            "factor": f"CGPA ({student.cgpa:.1f})",
            "impact": "positive",
            "detail": f"Exceeds requirement of {drive.min_cgpa:.1f}",
        })
    else:
        factors.append({
            "factor": "Academic Criteria",
            "impact": "negative",
            "detail": ineligibility_reasons[0] if ineligibility_reasons else "Below cutoff",
        })
        
    if matched:
        factors.append({
            "factor": "Core Technical Skills",
            "impact": "positive",
            "detail": f"Directly matched: {', '.join(matched[:3])}",
        })
        
    if missing:
        factors.append({
            "factor": "Skill Gaps",
            "impact": "negative",
            "detail": f"Missing requirements: {', '.join(missing[:2])}",
        })
        
    if student.mock_interview_score and student.mock_interview_score >= 75:
        factors.append({
            "factor": "Interview Readiness",
            "impact": "positive",
            "detail": f"Mock score {student.mock_interview_score:.0f}/100",
        })
    elif student.mock_interview_score and student.mock_interview_score < 60:
        factors.append({
            "factor": "Interview Readiness",
            "impact": "negative",
            "detail": f"Low mock score ({student.mock_interview_score:.0f}/100)",
        })

    # 7. Generate Natural Language Explainable Reason (PRD FR-D1)
    if not is_eligible:
        explanation = f"Ineligible for Shortlist: {'; '.join(ineligibility_reasons)}. Candidate possesses skills in {', '.join((student.skills or [])[:3])}, but fails primary eligibility filter."
    elif final_fit_score >= 80:
        missing_text = f" However, slight gap noted in {', '.join(missing)}." if missing else " Complete skill alignment observed."
        explanation = f"Strong Match ({final_fit_score}%): Student's CGPA ({student.cgpa:.1f}) comfortably clears the {drive.min_cgpa:.1f} benchmark. Verified proficiency in {', '.join(matched)}.{missing_text}"
    elif final_fit_score >= 60:
        explanation = f"Moderate Alignment ({final_fit_score}%): Student meets academic eligibility ({student.cgpa:.1f} CGPA), but exhibits notable skill gaps in {', '.join(missing or ['advanced role requirements'])}. Further preparation recommended."
    else:
        explanation = f"Below Threshold ({final_fit_score}%): CGPA meets minimum requirements, but core technical stack exhibits substantial gaps in {', '.join(missing or req_skills)}."

    return {
        "fit_score": final_fit_score,
        "is_eligible": is_eligible,
        "readiness_level": readiness_tier,
        "matched_skills": matched,
        "partial_skills": partial,
        "missing_skills": missing,
        "explanation": explanation,
        "factor_breakdown": factors,
        "ineligibility_reasons": ineligibility_reasons,
    }

def calculate_student_readiness(student: Student) -> Dict[str, Any]:
    """Compute holistic employability readiness score, tier, and gap roadmap (PRD Module C)."""
    # 1. Academic Weight (30%)
    cgpa_pts = (student.cgpa / 10.0) * 25.0
    backlog_penalty = min(20.0, student.active_backlogs * 10.0)
    academic_score = max(0.0, cgpa_pts - backlog_penalty)
    
    # 2. Skills & Certifications Weight (35%)
    skill_count = len(student.skills or [])
    cert_count = len(student.certifications or [])
    skills_score = min(35.0, (skill_count * 3.5) + (cert_count * 5.0))
    
    # 3. Assessment & Mock Interview Weight (20%)
    aptitude = student.aptitude_score or 65.0
    mock = student.mock_interview_score or 60.0
    assessment_score = ((aptitude * 0.5) + (mock * 0.5)) * 0.20
    
    # 4. Project & Experience Weight (15%)
    project_score = min(15.0, len(student.projects or []) * 5.0 + 5.0)
    
    total_score = int(round(academic_score + skills_score + assessment_score + project_score))
    total_score = min(100, max(15, total_score))
    
    # 5. Tier mapping
    if total_score >= 86:
        tier = ReadinessTier.HIGHLY_EMPLOYABLE
    elif total_score >= 71:
        tier = ReadinessTier.READY
    elif total_score >= 41:
        tier = ReadinessTier.DEVELOPING
    else:
        tier = ReadinessTier.NOT_READY
        
    # 6. Skill gaps & Action recommendations
    gaps = []
    actions = []
    
    user_skills_lower = [s.lower() for s in (student.skills or [])]
    if "docker" not in user_skills_lower and "kubernetes" not in user_skills_lower:
        gaps.append("Containerization & DevOps (Docker/K8s)")
        actions.append("Complete hands-on containerization tutorial deploying a microservice with Docker")
        
    if "aws" not in user_skills_lower and "cloud" not in user_skills_lower:
        gaps.append("Cloud Platforms (AWS / GCP)")
        actions.append("Earn AWS Certified Cloud Practitioner or deploy project to AWS S3/EC2")
        
    if (student.mock_interview_score or 0) < 65:
        gaps.append("Mock Technical Interview Performance")
        actions.append("Schedule 2 peer mock interviews focusing on System Design and behavioral STAR responses")
        
    if student.active_backlogs > 0:
        gaps.append(f"Clear {student.active_backlogs} Active Backlog(s)")
        actions.append("Prioritize upcoming supplementary semester exams to restore full recruiter eligibility")

    is_at_risk = total_score < 45 or student.active_backlogs > 0
    risk_score = round(max(0.05, min(0.95, (100 - total_score) / 100.0)), 2)

    return {
        "readiness_score": total_score,
        "readiness_level": tier,
        "skill_gaps": gaps,
        "recommended_actions": actions,
        "at_risk": is_at_risk,
        "risk_score": risk_score,
    }
