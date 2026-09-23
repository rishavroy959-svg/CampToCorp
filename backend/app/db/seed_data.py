import random
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.student import Student, ReadinessTier, StudentStatus
from app.models.drive import Drive, SlotType, DriveStatus, ConflictLog, ConflictType, ConflictSeverity
from app.models.matching import StudentJobMatch
from app.models.offer import Offer, OfferStatus
from app.services.scheduler import check_drive_conflicts
from app.services.ai_matching import calculate_composite_fit

def seed_database():
    """Seed comprehensive realistic simulated dataset (PRD Deliverable 10)."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("[*] Seeding CampusLink database...")

        # 1. Clean existing records if any
        db.query(ConflictLog).delete()
        db.query(StudentJobMatch).delete()
        db.query(Offer).delete()
        db.query(Drive).delete()
        db.query(Student).delete()
        db.query(User).delete()
        db.commit()

        # 2. Seed Demo Users (4 PRD Stakeholder Personas)
        users = [
            User(
                email="tpo@campuslink.edu",
                full_name="Dr. Rajesh Sharma",
                hashed_password=get_password_hash("tpo123"),
                role=UserRole.PLACEMENT_OFFICER,
            ),
            User(
                email="aarav.patel@campuslink.edu",
                full_name="Aarav Patel",
                hashed_password=get_password_hash("student123"),
                role=UserRole.STUDENT,
            ),
            User(
                email="priya.sen@google.com",
                full_name="Priya Sen",
                hashed_password=get_password_hash("recruiter123"),
                role=UserRole.RECRUITER,
            ),
            User(
                email="anita.desai@campuslink.edu",
                full_name="Prof. Anita Desai",
                hashed_password=get_password_hash("mentor123"),
                role=UserRole.MENTOR,
            ),
            User(
                email="admin@campuslink.edu",
                full_name="CampusLink System Admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
            ),
        ]
        db.add_all(users)
        db.commit()
        print("[+] 5 Stakeholder Personas seeded.")

        # 3. Seed 50 Students across CSE, IT, ECE, MECH
        first_names = ["Aarav", "Divya", "Rahul", "Sneha", "Vikram", "Ananya", "Rohan", "Devika", "Sahil", "Pooja", "Arjun", "Kavya", "Siddharth", "Neha", "Aditya", "Riya", "Karan", "Tanvi", "Varun", "Isha"]
        last_names = ["Patel", "Krishnan", "Verma", "Mukherjee", "Malhotra", "Iyer", "Reddy", "Nair", "Qureshi", "Sharma", "Gupta", "Joshi", "Chawla", "Bose", "Roy", "Deshmukh", "Johar", "Menon", "Saxena", "Kapoor"]

        students_data = []

        # Handcrafted Student #1: Aarav Patel (PRD Hero Persona)
        aarav = Student(
            roll_number="22CS001",
            full_name="Aarav Patel",
            email="aarav.patel@campuslink.edu",
            phone="+91 98765 43210",
            branch="CSE",
            batch_year=2026,
            cgpa=8.8,
            tenth_percentage=92.5,
            twelfth_percentage=90.0,
            active_backlogs=0,
            history_of_backlogs=0,
            skills=["Python", "FastAPI", "PostgreSQL", "Docker", "React", "Git", "Kubernetes", "AWS Lambda", "Redis"],
            aptitude_score=94.0,
            mock_interview_score=85.0,
            communication_score=88.0,
            technical_score=92.0,
            certifications=["AWS Certified Cloud Practitioner", "Docker Essentials"],
            projects=[
                {"title": "Microservices Event Pipeline", "tech": "Python, Docker, FastAPI", "stars": 42},
                {"title": "Antigravity Cloud Scaler", "tech": "PostgreSQL, Redis, Kubernetes", "stars": 28},
            ],
            readiness_score=88,
            readiness_level=ReadinessTier.HIGHLY_EMPLOYABLE,
            status=StudentStatus.OFFER_EXTENDED,
            at_risk=False,
            risk_score=0.05,
        )
        students_data.append(aarav)

        # Generate remaining 49 realistic students
        branches = ["CSE"] * 17 + ["IT"] * 12 + ["ECE"] * 12 + ["MECH"] * 8
        branch_counts = {"CSE": 2, "IT": 1, "ECE": 1, "MECH": 1}
        skill_catalog = {
            "CSE": ["Python", "Java", "C++", "FastAPI", "React", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis", "Kafka", "Data Structures", "Algorithms", "System Design"],
            "IT": ["JavaScript", "TypeScript", "Node.js", "React", "Python", "SQL", "Cloud Computing", "AWS", "Git", "Linux", "REST APIs", "Microservices"],
            "ECE": ["C", "Embedded C", "C++", "Python", "Verilog", "Microcontrollers", "IoT", "MATLAB", "Linux", "VHDL", "Digital Signal Processing"],
            "MECH": ["AutoCAD", "SolidWorks", "ANSYS", "Python", "MATLAB", "CATIA", "Manufacturing Processes", "Thermodynamics", "Robotics Basics"],
        }

        for i, branch in enumerate(branches, start=2):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            name = f"{fname} {lname}"
            b_num = branch_counts[branch]
            branch_counts[branch] += 1
            roll_no = f"22{branch}{b_num:03d}"
            email = f"{fname.lower()}.{lname.lower()}{b_num}@campuslink.edu"

            # Distribution: 35% Tier 1, 35% Tier 2, 20% Tier 3, 10% Tier 4 (At-risk)
            tier_rand = random.random()
            if tier_rand < 0.35: # Highly Employable
                cgpa = round(random.uniform(8.4, 9.7), 2)
                backlogs = 0
                skills_count = random.randint(6, 9)
                aptitude = round(random.uniform(85, 98), 1)
                mock_score = round(random.uniform(80, 95), 1)
                readiness = random.randint(86, 98)
                tier = ReadinessTier.HIGHLY_EMPLOYABLE
                at_risk = False
                risk_score = 0.08
                status = random.choice([StudentStatus.PLACED, StudentStatus.OFFER_EXTENDED, StudentStatus.UNPLACED])
            elif tier_rand < 0.70: # Ready
                cgpa = round(random.uniform(7.2, 8.3), 2)
                backlogs = 0
                skills_count = random.randint(4, 7)
                aptitude = round(random.uniform(70, 85), 1)
                mock_score = round(random.uniform(70, 82), 1)
                readiness = random.randint(71, 85)
                tier = ReadinessTier.READY
                at_risk = False
                risk_score = 0.18
                status = StudentStatus.UNPLACED
            elif tier_rand < 0.90: # Developing
                cgpa = round(random.uniform(6.3, 7.1), 2)
                backlogs = random.choice([0, 0, 1])
                skills_count = random.randint(3, 5)
                aptitude = round(random.uniform(55, 72), 1)
                mock_score = round(random.uniform(50, 70), 1)
                readiness = random.randint(41, 70)
                tier = ReadinessTier.DEVELOPING
                at_risk = False
                risk_score = 0.42
                status = StudentStatus.UNPLACED
            else: # Not Ready / At-Risk
                cgpa = round(random.uniform(5.4, 6.2), 2)
                backlogs = random.randint(1, 2)
                skills_count = random.randint(1, 3)
                aptitude = round(random.uniform(35, 52), 1)
                mock_score = round(random.uniform(30, 48), 1)
                readiness = random.randint(22, 39)
                tier = ReadinessTier.NOT_READY
                at_risk = True
                risk_score = 0.88
                status = StudentStatus.UNPLACED

            selected_skills = random.sample(skill_catalog[branch], min(skills_count, len(skill_catalog[branch])))

            student = Student(
                roll_number=roll_no,
                full_name=name,
                email=email,
                phone=f"+91 {random.randint(90000, 99999)} {random.randint(10000, 99999)}",
                branch=branch,
                batch_year=2026,
                cgpa=cgpa,
                tenth_percentage=round(random.uniform(75, 96), 1),
                twelfth_percentage=round(random.uniform(70, 95), 1),
                active_backlogs=backlogs,
                history_of_backlogs=backlogs,
                skills=selected_skills,
                aptitude_score=aptitude,
                mock_interview_score=mock_score,
                communication_score=round(random.uniform(60, 90), 1),
                technical_score=round(random.uniform(55, 95), 1),
                certifications=[f"{branch} Certified Associate"] if tier in [ReadinessTier.HIGHLY_EMPLOYABLE, ReadinessTier.READY] else [],
                projects=[{"title": f"{branch} Automated System", "tech": ", ".join(selected_skills[:2])}],
                readiness_score=readiness,
                readiness_level=tier,
                status=status,
                at_risk=at_risk,
                risk_score=risk_score,
            )
            students_data.append(student)

        db.add_all(students_data)
        db.commit()
        print(f"[+] {len(students_data)} Students seeded across CSE, IT, ECE, MECH.")

        # 4. Seed 6 Real-World Placement Drives (Triggering intentional collision for PRD Module E)
        drives_data = [
            Drive(
                company_name="Google Cloud",
                role_title="Site Reliability Engineer",
                job_description="Architect, scale, and maintain high-performance cloud infrastructure across global Kubernetes clusters. Strong background in Linux, Python/Go, and distributed networks required.",
                ctc_lpa=32.0,
                base_salary_lpa=24.0,
                min_cgpa=8.0,
                max_backlogs_allowed=0,
                allowed_branches=["CSE", "IT", "ECE"],
                required_skills=["Python", "Linux", "Docker", "Kubernetes", "PostgreSQL", "System Design"],
                preferred_certifications=["Google Cloud Associate", "CKA"],
                drive_date=date(2026, 10, 18),
                slot=SlotType.FULL_DAY,
                venue="Auditorium Hall A",
                interview_panels_count=4,
                status=DriveStatus.UPCOMING,
                has_conflict=True,
                conflict_summary="Critical Venue Collision: Auditorium Hall A is simultaneously booked by Amazon Web Services on 2026-10-18 (FULL_DAY).",
            ),
            Drive(
                company_name="Amazon Web Services",
                role_title="Cloud Support Associate",
                job_description="Provide architectural guidance and troubleshooting for enterprise cloud customers on AWS. Focus on networking, Linux systems, and database clustering.",
                ctc_lpa=22.0,
                base_salary_lpa=18.0,
                min_cgpa=7.5,
                max_backlogs_allowed=0,
                allowed_branches=["CSE", "IT", "ECE"],
                required_skills=["Linux", "Cloud Computing", "AWS", "Python", "SQL"],
                preferred_certifications=["AWS Solutions Architect"],
                drive_date=date(2026, 10, 18),
                slot=SlotType.FULL_DAY,
                venue="Auditorium Hall A", # Venue double-booking collision!
                interview_panels_count=3,
                status=DriveStatus.UPCOMING,
                has_conflict=True,
                conflict_summary="Critical Venue Collision: Auditorium Hall A is simultaneously booked by Google Cloud on 2026-10-18 (FULL_DAY).",
            ),
            Drive(
                company_name="Microsoft IDC",
                role_title="Cloud Software Engineer",
                job_description="Build modern distributed backend services and developer tooling powering Microsoft Azure. Strong algorithms and system design required.",
                ctc_lpa=28.5,
                base_salary_lpa=21.0,
                min_cgpa=8.0,
                max_backlogs_allowed=0,
                allowed_branches=["CSE", "IT"],
                required_skills=["C++", "Java", "Python", "Data Structures", "Algorithms", "System Design"],
                preferred_certifications=["Azure Fundamentals"],
                drive_date=date(2026, 10, 15),
                slot=SlotType.FULL_DAY,
                venue="Auditorium Hall B",
                interview_panels_count=5,
                status=DriveStatus.ACTIVE,
                has_conflict=False,
            ),
            Drive(
                company_name="Goldman Sachs",
                role_title="Quantitative Technology Analyst",
                job_description="Develop algorithmic trading models, high-frequency execution pipelines, and risk analytics engines.",
                ctc_lpa=26.0,
                base_salary_lpa=20.0,
                min_cgpa=8.2,
                max_backlogs_allowed=0,
                allowed_branches=["CSE", "IT", "ECE"],
                required_skills=["Python", "C++", "Algorithms", "SQL", "Data Structures"],
                preferred_certifications=[],
                drive_date=date(2026, 10, 22),
                slot=SlotType.MORNING,
                venue="Main Conference Hall",
                interview_panels_count=3,
                status=DriveStatus.UPCOMING,
                has_conflict=False,
            ),
            Drive(
                company_name="Qualcomm India",
                role_title="Embedded Software Engineer",
                job_description="Low-level firmware development, DSP kernel optimizations, and RTOS driver engineering for 5G mobile chipsets.",
                ctc_lpa=21.5,
                base_salary_lpa=17.5,
                min_cgpa=7.5,
                max_backlogs_allowed=0,
                allowed_branches=["ECE", "CSE"],
                required_skills=["C", "Embedded C", "C++", "Linux", "Microcontrollers"],
                preferred_certifications=[],
                drive_date=date(2026, 10, 24),
                slot=SlotType.AFTERNOON,
                venue="ECE Seminar Room",
                interview_panels_count=4,
                status=DriveStatus.UPCOMING,
                has_conflict=False,
            ),
            Drive(
                company_name="Cisco Systems",
                role_title="Associate Software Engineer",
                job_description="Enterprise networking software, software-defined WAN controllers, and secure API gateways.",
                ctc_lpa=18.0,
                base_salary_lpa=14.5,
                min_cgpa=7.0,
                max_backlogs_allowed=0,
                allowed_branches=["CSE", "IT", "ECE"],
                required_skills=["Python", "FastAPI", "Networking", "Git", "REST APIs"],
                preferred_certifications=["CCNA"],
                drive_date=date(2026, 10, 26),
                slot=SlotType.FULL_DAY,
                venue="CS Lab Complex 1",
                interview_panels_count=4,
                status=DriveStatus.UPCOMING,
                has_conflict=False,
            ),
        ]
        db.add_all(drives_data)
        db.commit()
        print(f"[+] {len(drives_data)} Placement Drives seeded with intentional conflict scenario.")

        # 5. Seed Conflict Log for Google Cloud vs AWS double booking
        google_drive = db.query(Drive).filter(Drive.company_name == "Google Cloud").first()
        aws_drive = db.query(Drive).filter(Drive.company_name == "Amazon Web Services").first()
        
        conflict_log = ConflictLog(
            drive_id=google_drive.id,
            conflicting_drive_id=aws_drive.id,
            conflict_type=ConflictType.VENUE_DOUBLE_BOOKING,
            severity=ConflictSeverity.CRITICAL,
            description="Critical Collision: Venue 'Auditorium Hall A' is simultaneously reserved by 'Amazon Web Services' on 2026-10-18 (FULL_DAY).",
            affected_resource="Auditorium Hall A",
            is_resolved=False,
        )
        db.add(conflict_log)
        db.commit()
        print("[+] Conflict Log audit record seeded.")

        # 6. Run AI Matching Engine for Google Cloud, Microsoft, AWS
        all_students = db.query(Student).all()
        matches_count = 0
        for drive in [google_drive, aws_drive]:
            for stu in all_students:
                fit_data = calculate_composite_fit(stu, drive)
                if fit_data["is_eligible"]:
                    db_match = StudentJobMatch(
                        student_id=stu.id,
                        drive_id=drive.id,
                        fit_score=fit_data["fit_score"],
                        is_eligible=fit_data["is_eligible"],
                        matched_skills=fit_data["matched_skills"],
                        partial_skills=fit_data["partial_skills"],
                        missing_skills=fit_data["missing_skills"],
                        factor_breakdown=fit_data["factor_breakdown"],
                        explanation=fit_data["explanation"],
                        is_shortlisted=fit_data["fit_score"] >= 80,
                    )
                    db.add(db_match)
                    matches_count += 1
        db.commit()
        print(f"[+] AI Matching Engine executed: {matches_count} Student-Drive matches generated with SHAP factors.")

        # 7. Seed Verified Offers & PPOs (PRD Module F)
        cisco_drive = db.query(Drive).filter(Drive.company_name == "Cisco Systems").first()
        aarav_student = db.query(Student).filter(Student.roll_number == "22CS001").first()

        offers_data = [
            Offer(
                student_id=aarav_student.id,
                drive_id=cisco_drive.id,
                company_name="Cisco Systems",
                role_title="Associate Software Engineer",
                ctc_lpa=18.0,
                base_salary_lpa=14.5,
                joining_bonus_lpa=3.5,
                bond_period_months=0,
                status=OfferStatus.ACCEPTED,
                is_ppo=True,
                docs_verified=True,
                docs_submitted=True,
                verified_by="Dr. Rajesh Sharma",
                offer_letter_url="https://campuslink.edu/docs/offers/cisco_22cs001.pdf",
                notes="Summer internship converted to full-time Pre-Placement Offer (PPO).",
            )
        ]

        # Add 8 additional accepted/offered records for other top students
        top_students = db.query(Student).filter(Student.cgpa >= 8.5, Student.id != aarav_student.id).limit(8).all()
        for idx, stu in enumerate(top_students):
            company = ["Microsoft IDC", "Amazon Web Services", "Qualcomm India", "Goldman Sachs"][idx % 4]
            ctc = [28.5, 22.0, 21.5, 26.0][idx % 4]
            offers_data.append(
                Offer(
                    student_id=stu.id,
                    company_name=company,
                    role_title="Software Development Engineer",
                    ctc_lpa=ctc,
                    base_salary_lpa=round(ctc * 0.8, 1),
                    joining_bonus_lpa=round(ctc * 0.2, 1),
                    bond_period_months=0,
                    status=OfferStatus.ACCEPTED if idx < 5 else OfferStatus.PENDING,
                    is_ppo=(idx % 3 == 0),
                    docs_submitted=True,
                    docs_verified=(idx < 5),
                    verified_by="Dr. Rajesh Sharma" if idx < 5 else None,
                    notes=f"Selected in Round 3 technical interview by {company}.",
                )
            )

        db.add_all(offers_data)
        db.commit()
        print(f"[+] {len(offers_data)} Student Offers & PPOs seeded with document verification.")

        print("\n[+] Seed complete! CampusLink is fully primed with 50 students, 6 drives, AI scores, and offers.")

    except Exception as e:
        db.rollback()
        print(f"[-] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
