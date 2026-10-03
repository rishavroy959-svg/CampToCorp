import json

with open("db_dump.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("=== USERS (5) ===")
for u in data["users"]["rows"]:
    print(f"ID {u['id']}: {u['full_name']} | Email: {u['email']} | Role: {u['role']} | Active: {u['is_active']}")

print("\n=== DRIVES (6) ===")
for d in data["drives"]["rows"]:
    print(f"ID {d['id']}: {d['company_name']} - {d['role_title']} | CTC: {d['ctc_lpa']} LPA (Base: {d['base_salary_lpa']} LPA) | Min CGPA: {d['min_cgpa']} | Date: {d['drive_date']} ({d['slot']}) | Venue: {d['venue']} | Conflict: {bool(d['has_conflict'])}")

print("\n=== CONFLICT LOGS (1) ===")
for c in data["conflict_logs"]["rows"]:
    print(f"ID {c['id']}: Drive {c['drive_id']} vs Drive {c['conflicting_drive_id']} | Type: {c['conflict_type']} | Severity: {c['severity']} | Desc: {c['description']} | Resolved: {bool(c['is_resolved'])}")

print("\n=== OFFERS (9) ===")
for o in data["offers"]["rows"]:
    print(f"ID {o['id']}: Student ID {o['student_id']} | Company: {o['company_name']} | Role: {o['role_title']} | CTC: {o['ctc_lpa']} LPA | Status: {o['status']} | Location: {o['job_location']} | PPO: {bool(o['is_ppo'])}")

print("\n=== STUDENTS (50) ===")
for s in data["students"]["rows"][:10]:
    print(f"ID {s['id']}: {s['roll_number']} - {s['full_name']} | {s['branch']} | CGPA: {s['cgpa']} | Readiness: {s['readiness_score']} ({s['readiness_level']}) | Risk: {s['at_risk']} | Status: {s['status']}")

print(f"... and {len(data['students']['rows']) - 10} more students.")

print("\n=== STUDENT JOB MATCHES (46) - Top 5 ===")
for m in data["student_job_matches"]["rows"][:5]:
    print(f"ID {m['id']}: Student ID {m['student_id']} -> Drive ID {m['drive_id']} | Fit: {m['fit_score']}% | Eligible: {bool(m['is_eligible'])} | Shortlisted: {bool(m['is_shortlisted'])}")
print(f"... and {len(data['student_job_matches']['rows']) - 5} more matches.")
