import unittest
from datetime import date
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, Base, engine
from app.models.student import Student, ReadinessTier, StudentStatus
from app.models.drive import Drive, SlotType, DriveStatus, ConflictType, ConflictSeverity, ConflictLog
from app.models.offer import Offer, OfferStatus
from app.services.ai_matching import (
    evaluate_hard_eligibility,
    classify_skills,
    calculate_composite_fit,
    calculate_student_readiness,
)
from app.services.scheduler import (
    check_drive_conflicts,
    suggest_alternative_slots,
    slots_overlap,
)
from app.services.interview_analyzer import evaluate_interview_response

class TestCampusLinkAIPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db: Session = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_hard_eligibility_filtering(self):
        """PRD FR-B3: Deterministic eligibility criteria (CGPA, Branch, Backlogs)."""
        drive = Drive(
            company_name="Google Cloud",
            role_title="Site Reliability Engineer",
            min_cgpa=8.0,
            allowed_branches=["CSE", "IT"],
            max_backlogs_allowed=0,
            ctc_lpa=32.0,
            drive_date=date(2026, 10, 18),
            slot=SlotType.FULL_DAY,
            venue="Auditorium Hall A",
        )

        # Candidate 1: Perfect eligibility
        eligible_student = Student(
            full_name="Aarav Patel",
            branch="CSE",
            cgpa=8.8,
            active_backlogs=0,
            skills=["Python", "Docker", "PostgreSQL"],
        )
        is_ok, reasons = evaluate_hard_eligibility(eligible_student, drive)
        self.assertTrue(is_ok)
        self.assertEqual(len(reasons), 0)

        # Candidate 2: Below CGPA cutoff
        low_cgpa_student = Student(
            full_name="Low CGPA Candidate",
            branch="CSE",
            cgpa=7.2,
            active_backlogs=0,
            skills=["Python"],
        )
        is_ok, reasons = evaluate_hard_eligibility(low_cgpa_student, drive)
        self.assertFalse(is_ok)
        self.assertTrue(any("CGPA" in r for r in reasons))

        # Candidate 3: Wrong Branch
        wrong_branch_student = Student(
            full_name="Mech Candidate",
            branch="MECH",
            cgpa=8.5,
            active_backlogs=0,
            skills=["Python"],
        )
        is_ok, reasons = evaluate_hard_eligibility(wrong_branch_student, drive)
        self.assertFalse(is_ok)
        self.assertTrue(any("Branch" in r for r in reasons))

    def test_02_composite_fit_scoring_and_explainability(self):
        """PRD FR-B5 & Module D: Weighted composite fit score & SHAP explanation."""
        drive = Drive(
            company_name="Google Cloud",
            role_title="Site Reliability Engineer",
            min_cgpa=8.0,
            allowed_branches=["CSE", "IT", "ECE"],
            max_backlogs_allowed=0,
            required_skills=["Python", "Docker", "Kubernetes", "PostgreSQL"],
            ctc_lpa=32.0,
            drive_date=date(2026, 10, 18),
            slot=SlotType.FULL_DAY,
            venue="Auditorium Hall A",
        )

        student = Student(
            full_name="Aarav Patel",
            branch="CSE",
            cgpa=8.8,
            active_backlogs=0,
            skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"],
            aptitude_score=94.0,
            mock_interview_score=85.0,
            projects=[{"title": "Kubernetes Cloud Pipeline"}],
        )

        fit_result = calculate_composite_fit(student, drive)
        self.assertTrue(fit_result["is_eligible"])
        self.assertGreaterEqual(fit_result["fit_score"], 85.0)
        self.assertIn("Python", fit_result["matched_skills"])
        self.assertIn("Docker", fit_result["matched_skills"])
        self.assertTrue(len(fit_result["factor_breakdown"]) >= 2)
        self.assertTrue(len(fit_result["explanation"]) > 30)

    def test_03_drive_scheduling_conflict_engine(self):
        """PRD Module E: Multi-drive conflict detection & venue double-booking."""
        drive_a = Drive(
            id=101,
            company_name="Google Cloud",
            drive_date=date(2026, 10, 18),
            slot=SlotType.FULL_DAY,
            venue="Auditorium Hall A",
            allowed_branches=["CSE", "IT"],
            ctc_lpa=32.0,
            role_title="SRE",
        )

        drive_b_collision = Drive(
            id=102,
            company_name="Amazon Web Services",
            drive_date=date(2026, 10, 18),
            slot=SlotType.FULL_DAY,
            venue="Auditorium Hall A", # Venue double-booking!
            allowed_branches=["CSE", "IT"],
            ctc_lpa=22.0,
            role_title="CSA",
        )

        conflicts = check_drive_conflicts(drive_a, [drive_b_collision])
        self.assertTrue(len(conflicts) > 0)
        self.assertEqual(conflicts[0]["severity"], ConflictSeverity.CRITICAL)
        self.assertEqual(conflicts[0]["type"], ConflictType.VENUE_DOUBLE_BOOKING)

    def test_04_conflict_free_alternative_recommender(self):
        """PRD FR-E5: Auto-proposing alternative conflict-free slots and venues."""
        drive_a = Drive(
            id=101,
            company_name="Google Cloud",
            drive_date=date(2026, 10, 18),
            slot=SlotType.FULL_DAY,
            venue="Auditorium Hall A",
            allowed_branches=["CSE", "IT"],
            ctc_lpa=32.0,
            role_title="SRE",
        )

        drive_b_collision = Drive(
            id=102,
            company_name="Amazon Web Services",
            drive_date=date(2026, 10, 18),
            slot=SlotType.FULL_DAY,
            venue="Auditorium Hall A",
            allowed_branches=["CSE", "IT"],
            ctc_lpa=22.0,
            role_title="CSA",
        )

        suggestions = suggest_alternative_slots(drive_a, [drive_a, drive_b_collision])
        self.assertTrue(len(suggestions) > 0)
        self.assertTrue(any(s["type"] in ["SAME_DAY_DIFFERENT_VENUE", "NEXT_AVAILABLE_DAY"] for s in suggestions))

    def test_05_mock_interview_evaluation_engine(self):
        """PRD Module B & Innovation Opportunity: Technical & Communication Scoring."""
        question = "How would you design a multi-region failover mechanism on Kubernetes to ensure zero-downtime during a regional cloud outage?"
        response_text = "I would deploy an active-active architecture across two cloud regions using global Anycast DNS with health probes. Cluster states are synchronized using CockroachDB with low RPO. A global load balancer directs traffic to healthy regions based on latency."

        eval_res = evaluate_interview_response(question, response_text, "Site Reliability Engineer")
        self.assertGreaterEqual(eval_res["technical_score"], 80.0)
        self.assertGreaterEqual(eval_res["communication_score"], 70.0)
        self.assertTrue(len(eval_res["matched_keywords"]) >= 3)
        self.assertTrue(len(eval_res["actionable_feedback"]) >= 1)

    def test_06_database_seed_integrity(self):
        """PRD Deliverable 10: Verify 50 students, 6 drives, and active offers."""
        students_count = self.db.query(Student).count()
        drives_count = self.db.query(Drive).count()
        offers_count = self.db.query(Offer).count()
        conflicts_count = self.db.query(ConflictLog).count()

        self.assertGreaterEqual(students_count, 50)
        self.assertGreaterEqual(drives_count, 6)
        self.assertGreaterEqual(offers_count, 5)
        self.assertGreaterEqual(conflicts_count, 1)

        # Verify Aarav Patel's profile
        aarav = self.db.query(Student).filter(Student.roll_number == "22CS001").first()
        self.assertIsNotNone(aarav)
        self.assertEqual(aarav.full_name, "Aarav Patel")
        self.assertGreaterEqual(aarav.readiness_score, 85)

if __name__ == "__main__":
    unittest.main()
