from app.db.session import SessionLocal
from app.models.drive import Drive
from app.models.student import Student
from app.models.application import DriveApplication, ApplicationStatus

def seed_applications():
    db = SessionLocal()
    try:
        # Check if applications already seeded
        count = db.query(DriveApplication).count()
        if count > 0:
            print(f"Applications already seeded: {count}")
            return

        aarav = db.query(Student).filter(Student.roll_number == "22CS001").first()
        msft = db.query(Drive).filter(Drive.company_name == "Microsoft IDC").first()
        google = db.query(Drive).filter(Drive.company_name == "Google Cloud").first()
        cisco = db.query(Drive).filter(Drive.company_name == "Cisco Systems").first()
        aws = db.query(Drive).filter(Drive.company_name == "Amazon Web Services").first()
        goldman = db.query(Drive).filter(Drive.company_name == "Goldman Sachs").first()

        apps = []
        if aarav and msft and google and cisco:
            apps.extend([
                DriveApplication(
                    drive_id=msft.id,
                    student_id=aarav.id,
                    current_status=ApplicationStatus.TECH_ROUND_2,
                    current_round_name="Technical Round 2: Architecture & Coding",
                    round_order=3,
                    round_date="2026-10-15",
                    round_slot="FULL_DAY",
                    venue_or_link="Auditorium Hall B - Cabin 2",
                    instructions="Prepare distributed system architecture and live coding in Python/C++.",
                    resume_url="Aarav_Patel_Placement_Resume.pdf"
                ),
                DriveApplication(
                    drive_id=google.id,
                    student_id=aarav.id,
                    current_status=ApplicationStatus.OA_CLEARED,
                    current_round_name="OA Cleared - Shortlisted for Tech Round 1",
                    round_order=2,
                    round_date="2026-10-18",
                    round_slot="FULL_DAY",
                    venue_or_link="CS Lab Complex 1",
                    instructions="Please arrive 15 minutes before the scheduled slot with your college ID card.",
                    resume_url="Aarav_Patel_Placement_Resume.pdf"
                ),
                DriveApplication(
                    drive_id=cisco.id,
                    student_id=aarav.id,
                    current_status=ApplicationStatus.OFFERED,
                    current_round_name="Selected - Offer Extended (18.0 LPA)",
                    round_order=4,
                    round_date="2026-09-20",
                    venue_or_link="Placement Office",
                    instructions="PPO Converted! Verify CTC breakdown and accept offer before October 15.",
                    resume_url="Aarav_Patel_Placement_Resume.pdf"
                )
            ])

        # Seed 20 additional student applications for Microsoft, AWS, and Goldman Sachs
        top_students = db.query(Student).filter(Student.cgpa >= 7.6, Student.id != aarav.id).limit(18).all()
        statuses = [
            ApplicationStatus.APPLIED,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.OA_CLEARED,
            ApplicationStatus.TECH_ROUND_1,
            ApplicationStatus.TECH_ROUND_2,
            ApplicationStatus.REJECTED
        ]
        
        target_drives = [d for d in [msft, aws, goldman, google] if d is not None]

        for idx, stu in enumerate(top_students):
            target_drive = target_drives[idx % len(target_drives)]
            st = statuses[idx % len(statuses)]
            round_names = {
                ApplicationStatus.APPLIED: "Application Received",
                ApplicationStatus.SHORTLISTED: "Resume Shortlisted by Recruiter",
                ApplicationStatus.OA_CLEARED: "Online Assessment Cleared",
                ApplicationStatus.TECH_ROUND_1: "Technical Round 1: DSA",
                ApplicationStatus.TECH_ROUND_2: "Technical Round 2: System Design",
                ApplicationStatus.REJECTED: "Round 1 Assessment Not Cleared",
            }
            round_name = round_names.get(st, "Application Submitted")
            sanitized_name = stu.full_name.replace(" ", "_")
            apps.append(DriveApplication(
                drive_id=target_drive.id,
                student_id=stu.id,
                current_status=st,
                current_round_name=round_name,
                round_order=(idx % 3) + 1,
                round_date=str(target_drive.drive_date),
                round_slot=target_drive.slot.value if hasattr(target_drive.slot, "value") else str(target_drive.slot),
                venue_or_link=target_drive.venue,
                instructions="Follow official placement guidelines and carry printed resume copies.",
                resume_url=f"{sanitized_name}_Resume.pdf"
            ))

        db.add_all(apps)
        db.commit()
        print(f"[+] Successfully seeded {len(apps)} realistic applications.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding applications: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_applications()
