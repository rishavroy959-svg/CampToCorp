import sqlite3

def migrate():
    conn = sqlite3.connect("camptocorp.db")
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(users)")
    existing_cols = [row[1] for row in cur.fetchall()]
    print("Existing columns in users:", existing_cols)

    new_columns = [
        ("status", "VARCHAR DEFAULT 'ACTIVE'"),
        ("institution_name", "VARCHAR DEFAULT 'National Institute of Technology'"),
        ("institution_code", "VARCHAR"),
        ("department", "VARCHAR"),
        ("phone_number", "VARCHAR"),
        ("failed_login_attempts", "INTEGER DEFAULT 0"),
        ("locked_until", "DATETIME"),
        ("last_login_at", "DATETIME"),
        ("last_password_change", "DATETIME"),
    ]

    for col_name, col_type in new_columns:
        if col_name not in existing_cols:
            try:
                cur.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column: {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}:", e)

    conn.commit()
    conn.close()
    print("Users table governance migration complete!")

if __name__ == "__main__":
    migrate()
