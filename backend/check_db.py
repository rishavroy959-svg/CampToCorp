import sqlite3

conn = sqlite3.connect('camptocorp.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]

print("Active Database: camptocorp.db")
print("="*55)
for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {t}")
    count = cursor.fetchone()[0]
    print(f"Table: {t:22} | Rows: {count:>3}")

print("="*55)

# Show sample students
cursor.execute("SELECT id, roll_number, full_name, branch, cgpa, readiness_score, readiness_level, at_risk FROM students LIMIT 5;")
print("\nSample Students:")
for row in cursor.fetchall():
    print(f"  ID {row[0]}: {row[1]} - {row[2]} ({row[3]}), CGPA: {row[4]}, Readiness: {row[5]} ({row[6]}), At-Risk: {row[7]}")

# Show sample drives
cursor.execute("SELECT id, company_name, role_title, ctc_lpa, drive_date, slot, venue, has_conflict FROM drives;")
print("\nSample Placement Drives:")
for row in cursor.fetchall():
    conflict_str = f"CONFLICT: {row[7]}" if row[7] else "OK"
    print(f"  Drive {row[0]}: {row[1]} - {row[2]} ({row[3]} LPA), Date: {row[4]}, Slot: {row[5]}, Venue: {row[6]} [{conflict_str}]")

# Show sample users
cursor.execute("SELECT id, email, full_name, role FROM users;")
print("\nUsers / Stakeholder Personas:")
for row in cursor.fetchall():
    print(f"  User {row[0]}: {row[1]} ({row[2]}) - Role: {row[3]}")

conn.close()
