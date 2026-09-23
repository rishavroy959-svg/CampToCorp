# CampusLink (CampToCorp) — AI-Powered Campus-to-Corporate Placement Platform

CampusLink is an end-to-end placement management and analytics ecosystem designed to digitise, automate, and intelligently optimise the university placement lifecycle.

## Architectural Overview

* **Frontend (`/frontend`)**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, `shadcn/ui`, TanStack Query, Lucide React, and Recharts. Designed with Squarespace-inspired minimalism, high contrast, and editorial typography.
* **Backend (`/backend`)**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Celery + Redis, and JWT role-based access control.
* **AI & NLP Engine**: Hybrid Rule + AI architecture utilizing Sentence-Transformers (`all-MiniLM-L6-v2`), scikit-learn, and explainable AI (SHAP/LLM justifications).
* **Database & Storage**: PostgreSQL 16+ with `pgvector` for candidate semantic vector search, Redis for caching/broker, and S3-compatible storage.

## Roles & Personas Supported
1. **Placement Officer (TPO)**: Real-time command dashboard, conflict-free drive scheduling, and at-risk candidate monitoring.
2. **Student**: Readiness profiling (4-tier scale), automated skill-gap analysis, and interview tracking.
3. **Recruiter / HR**: Automated JD parsing, candidate ranking with match scores, and transparent shortlisting justifications.
4. **Faculty Mentor**: Early alerts for at-risk students and branch-wise placement conversion analytics.

## Running Locally

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web Application: `http://localhost:3000`
