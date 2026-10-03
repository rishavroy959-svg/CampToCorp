import sqlite3
import json

def get_db_data(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
    
    data = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [col[1] for col in cursor.fetchall()]
        
        cursor.execute(f"SELECT * FROM {table}")
        rows = [dict(row) for row in cursor.fetchall()]
        data[table] = {
            "columns": columns,
            "count": len(rows),
            "rows": rows
        }
    
    conn.close()
    return data

if __name__ == "__main__":
    db_data = get_db_data("c:/Hackathon/CampToCorp/backend/camptocorp.db")
    
    summary = {t: {"count": info["count"], "columns": info["columns"]} for t, info in db_data.items()}
    print("=== SUMMARY OF TABLES ===")
    print(json.dumps(summary, indent=2))
    
    with open("c:/Hackathon/CampToCorp/backend/db_dump.json", "w", encoding="utf-8") as f:
        json.dump(db_data, f, indent=2, default=str)
    print("\nFull data exported to db_dump.json successfully!")
