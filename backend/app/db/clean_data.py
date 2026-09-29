from datetime import date
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.student import Student, ReadinessTier, StudentStatus
from app.models.drive import Drive, SlotType, DriveStatus, ConflictLog
from app.models.matching import StudentJobMatch
from app.models.offer import Offer

def purge_all_demo_data():
    """Purge all messy synthetic demo data and leave only clean TPO and Student accounts."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("[*] Purging demo data from CampusLink database...")

        # 1. Clean matches, offers, conflict logs
        db.query(ConflictLog).delete()
        db.query(StudentJobMatch).delete()
        db.query(Offer).delete()

        # 2. Clean synthetic students
        db.query(Student).delete()

        # 3. Clean users, retain only Placement Officer and Student
        db.query(User).delete()
        db.commit()

        # 4. Insert clean TPO user
        tpo_user = User(
            email="tpo@campuslink.edu",
            full_name="Dr. Rajesh Sharma",
            hashed_password=get_password_hash("tpo123"),
            role=UserRole.PLACEMENT_OFFICER,
            is_active=True,
        )
        db.add(tpo_user)

        # 5. Insert clean Student user
        student_user = User(
            email="aarav.patel@campuslink.edu",
            full_name="Aarav Patel",
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT,
            is_active=True,
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)

        # 6. Insert clean Student profile for Aarav Patel
        clean_student = Student(
            user_id=student_user.id,
            roll_number="22CS014",
            full_name="Aarav Patel",
            email="aarav.patel@campuslink.edu",
            phone="+91 98765 43210",
            branch="CSE",
            batch_year=2026,
            cgpa=8.8,
            tenth_percentage=94.5,
            twelfth_percentage=92.0,
            active_backlogs=0,
            history_of_backlogs=0,
            skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
            certifications=["AWS Certified Cloud Practitioner"],
            projects=[{"title": "Campus Placement AI Platform", "tech": "Python, FastAPI, Next.js"}],
            aptitude_score=85.0,
            mock_interview_score=88.0,
            communication_score=82.0,
            technical_score=90.0,
            readiness_score=88,
            readiness_level=ReadinessTier.HIGHLY_EMPLOYABLE,
            at_risk=False,
            risk_score=0.10,
            status=StudentStatus.UNPLACED,
        )
        db.add(clean_student)

        # 7. Clean drives table - keep only 2 standard college drives
        db.query(Drive).delete()
        db.commit()

        drives = [
            Drive(
                company_name="Microsoft IDC",
                role_title="Cloud Software Engineer",
                job_description="Design, develop, and operate hyperscale cloud services for Microsoft Azure. Focus on distributed systems and API architectures.",
                ctc_lpa=28.5,
                base_salary_lpa=22.0,
                min_cgpa=7.5,
                allowed_branches=["CSE", "IT", "ECE"],
                max_backlogs_allowed=0,
                required_skills=["Python", "FastAPI", "Docker", "PostgreSQL"],
                preferred_certifications=["Azure Fundamentals"],
                drive_date=date(2026, 10, 15),
                slot=SlotType.FULL_DAY,
                venue="Auditorium Hall A",
                interview_panels_count=5,
                status=DriveStatus.ACTIVE,
                has_conflict=False,
            ),
            Drive(
                company_name="Google Cloud",
                role_title="Site Reliability Engineer",
                job_description="Ensure reliability and performance of core cloud infrastructure. Automate deployment and monitor services.",
                ctc_lpa=32.0,
                base_salary_lpa=25.0,
                min_cgpa=8.0,
                allowed_branches=["CSE", "IT"],
                max_backlogs_allowed=0,
                required_skills=["Python", "Linux", "Kubernetes", "Docker"],
                preferred_certifications=["GCP Associate"],
                drive_date=date(2026, 10, 18),
                slot=SlotType.FULL_DAY,
                venue="CS Lab Complex 1",
                interview_panels_count=4,
                status=DriveStatus.UPCOMING,
                has_conflict=False,
            ),
        ]
        db.add_all(drives)
        db.commit()

        print("[OK] Successfully purged messy demo data. Kept only clean TPO & Student records.")
        return {"status": "success", "message": "Demo data successfully wiped. Clean records initialized."}

    except Exception as e:
        db.rollback()
        print(f"[!] Error purging data: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    purge_all_demo_data()
