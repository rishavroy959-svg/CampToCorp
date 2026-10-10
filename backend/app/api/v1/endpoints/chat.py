import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.models.drive import Drive
from app.models.application import DriveApplication
from app.models.offer import Offer
from app.services.chat_assistant import generate_contextual_response, call_gemini_api

router = APIRouter(prefix="/chat", tags=["AI Student Placement ChatBot"])

class ChatMessageRequest(BaseModel):
    student_id: Optional[int] = None
    message: str
    history: Optional[List[Dict[str, Any]]] = []
    api_key: Optional[str] = None

class ChatMessageResponse(BaseModel):
    reply: str
    suggested_prompts: List[str]
    action_recommendations: Optional[List[Dict[str, Any]]] = []
    readiness_impact: Optional[str] = None
    student_name: Optional[str] = None
    student_cgpa: Optional[float] = None
    student_branch: Optional[str] = None
    model_used: Optional[str] = "camptocorp-ai"

@router.post("/message", response_model=ChatMessageResponse)
async def process_chat_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Process interactive student chatbot message with live database grounding
    and full general LLM reasoning capabilities.
    """
    # 1. Fetch Student from DB if student_id is provided, else fallback to first student
    student = None
    if req.student_id:
        student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        student = db.query(Student).filter(Student.roll_number == "22CS001").first()
    if not student:
        student = db.query(Student).first()

    # 2. Fetch active drives
    drives = db.query(Drive).all()

    # 3. Fetch applications & offers
    applications = []
    offers = []
    if student:
        applications = db.query(DriveApplication).filter(DriveApplication.student_id == student.id).all()
        offers = db.query(Offer).filter(Offer.student_id == student.id).all()

    # 4. Check for API Key (from request header/body or server environment)
    effective_api_key = (
        (req.api_key and req.api_key.strip())
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_API_KEY")
    )

    model_used = "camptocorp-ai"
    final_reply = None
    suggested_prompts = []
    action_recs = []
    readiness_impact = None

    # 5. If an API key is available, leverage Google Gemini LLM for unlimited general reasoning
    if effective_api_key:
        student_context = (
            f"Active Student Profile:\n"
            f"- Name: {student.full_name if student else 'Candidate'}\n"
            f"- Branch: {student.branch if student else 'CSE'}, CGPA: {student.cgpa if student else '8.0'}\n"
            f"- Verified Skills: {', '.join(student.skills or []) if student else 'None'}\n"
            f"- Readiness Score: {student.readiness_score if student else '75'}/100\n"
            f"- Active Campus Drives in DB: {len(drives)} scheduled drives (including Google Cloud, AWS, Microsoft, Goldman Sachs).\n"
        )
        system_prompt = (
            "You are the CampToCorp AI Placement & Technical Mentor.\n"
            "You must answer ANY doubt, question, or inquiry the student asks with complete accuracy, "
            "clarity, and depth (including technical concepts, coding, DSA, system design, OS, DBMS, networking, "
            "frameworks, company-specific rounds, HR questions, or general career queries in English or Hindi/Hinglish).\n"
            "Always format your response cleanly in GitHub markdown with bold headers, bullet points, and code snippets when relevant.\n\n"
            f"{student_context}"
        )
        llm_reply = await call_gemini_api(
            api_key=effective_api_key,
            system_prompt=system_prompt,
            user_prompt=req.message,
            history=req.history or []
        )
        if llm_reply:
            final_reply = llm_reply
            model_used = "gemini-llm"
            suggested_prompts = [
                "Which campus drives am I eligible for?",
                "How can I improve my placement readiness score?",
                "Give me another interview scenario"
            ]
            action_recs = [
                {"title": "View Eligible Drives", "action": "VIEW_DRIVES"},
                {"title": "AI Mock Interview", "action": "START_MOCK_INTERVIEW"}
            ]

    # 6. If no LLM key was provided or LLM query timed out, use our rich local knowledge & doubt engine
    if not final_reply:
        grounded_res = generate_contextual_response(
            message=req.message,
            student=student,
            drives=drives,
            applications=applications,
            offers=offers
        )
        final_reply = grounded_res["reply"]
        suggested_prompts = grounded_res.get("suggested_prompts", [])
        action_recs = grounded_res.get("action_recommendations", [])
        readiness_impact = grounded_res.get("readiness_impact")

    return ChatMessageResponse(
        reply=final_reply,
        suggested_prompts=suggested_prompts,
        action_recommendations=action_recs,
        readiness_impact=readiness_impact,
        student_name=student.full_name if student else "Candidate",
        student_cgpa=student.cgpa if student else None,
        student_branch=student.branch if student else None,
        model_used=model_used
    )
