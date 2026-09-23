from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, students, drives, offers, matching, analytics, interview, notifications

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(drives.router)
api_router.include_router(matching.router)
api_router.include_router(offers.router)
api_router.include_router(analytics.router)
api_router.include_router(interview.router)
api_router.include_router(notifications.router)
