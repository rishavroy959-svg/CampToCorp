import sqlite3
import os

def run_migration():
    db_path = os.path.join(os.path.dirname(__file__), "camptocorp.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Create colleges table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS colleges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR NOT NULL,
        code VARCHAR UNIQUE NOT NULL,
        city VARCHAR,
        created_by_user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("Checked/Created colleges table.")

    # 2. Add columns to users if missing
    cur.execute("PRAGMA table_info(users)")
    user_cols = [row[1] for row in cur.fetchall()]
    if "college_id" not in user_cols:
        cur.execute("ALTER TABLE users ADD COLUMN college_id INTEGER REFERENCES colleges(id)")
        print("Added college_id to users.")
    if "rejection_reason" not in user_cols:
        cur.execute("ALTER TABLE users ADD COLUMN rejection_reason VARCHAR")
        print("Added rejection_reason to users.")

    # 3. Add columns to students if missing
    cur.execute("PRAGMA table_info(students)")
    student_cols = [row[1] for row in cur.fetchall()]
    if "college_id" not in student_cols:
        cur.execute("ALTER TABLE students ADD COLUMN college_id INTEGER REFERENCES colleges(id)")
        print("Added college_id to students.")
    if "rejection_reason" not in student_cols:
        cur.execute("ALTER TABLE students ADD COLUMN rejection_reason VARCHAR")
        print("Added rejection_reason to students.")

    # 4. Add columns to drives if missing
    cur.execute("PRAGMA table_info(drives)")
    drive_cols = [row[1] for row in cur.fetchall()]
    if "college_id" not in drive_cols:
        cur.execute("ALTER TABLE drives ADD COLUMN college_id INTEGER REFERENCES colleges(id)")
        print("Added college_id to drives.")

    # 5. Seed default colleges
    cur.execute("SELECT COUNT(*) FROM colleges WHERE code = 'NIT'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO colleges (id, name, code, city) VALUES (1, 'National Institute of Technology', 'NIT', 'New Delhi')")
        print("Seeded NIT college.")

    cur.execute("SELECT COUNT(*) FROM colleges WHERE code = 'GITA'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO colleges (name, code, city) VALUES ('Gandhi Institute for Technological Advancement (GITA)', 'GITA', 'Bhubaneswar')")
        print("Seeded GITA college.")

    # 6. Assign existing demo users, students, drives to college_id = 1 (NIT) if null
    cur.execute("UPDATE users SET college_id = 1 WHERE college_id IS NULL")
    cur.execute("UPDATE students SET college_id = 1 WHERE college_id IS NULL")
    cur.execute("UPDATE drives SET college_id = 1 WHERE college_id IS NULL")
    print("Linked existing demo data to College ID 1 (NIT).")

    conn.commit()
    conn.close()
    print("College migration completed successfully!")

if __name__ == "__main__":
    run_migration()
