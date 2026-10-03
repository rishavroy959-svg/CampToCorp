import sqlite3
import shutil
import os

db_path = "camptocorp.db"
backup_path = "camptocorp_demo_backup.db"

# 1. Create a safe backup of the demo database
if not os.path.exists(backup_path):
    shutil.copyfile(db_path, backup_path)
    print(f"[BACKUP] Created {backup_path} as safety copy.")
else:
    print(f"[BACKUP] {backup_path} already exists.")

# 2. Connect and wipe all tables
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Disable foreign keys temporarily
cursor.execute("PRAGMA foreign_keys = OFF;")

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_') and row[0] != 'alembic_version']

for t in tables:
    cursor.execute(f"DELETE FROM {t};")
    print(f"Cleared table: {t}")

# Reset auto-increment sequences
try:
    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('users', 'students', 'drives', 'offers', 'student_job_matches', 'conflict_logs');")
except Exception as e:
    print("Sequence reset notice:", e)

conn.commit()
cursor.execute("PRAGMA foreign_keys = ON;")

print("\n[VERIFICATION] Current table counts in camptocorp.db:")
for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {t};")
    print(f"  {t:22}: {cursor.fetchone()[0]} rows")

conn.close()
print("\n[SUCCESS] Database is completely fresh and ready for real users!")
