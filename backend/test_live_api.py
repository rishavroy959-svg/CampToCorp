import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

endpoints = [
    ("/api/v1/health", "System Health"),
    ("/api/v1/auth/demo-accounts", "Demo Accounts"),
    ("/api/v1/students/?limit=3", "Students (first 3)"),
    ("/api/v1/drives/", "Recruitment Drives"),
    ("/api/v1/drives/conflicts/all", "Detected Calendar Conflicts"),
    ("/api/v1/offers/?limit=3", "Job Offers"),
    ("/api/v1/analytics/overview", "Institutional Analytics")
]

print("="*65)
print("TESTING LIVE HTTP API: http://127.0.0.1:8000")
print("="*65)

for path, label in endpoints:
    url = f"http://127.0.0.1:8000{path}"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            status = response.status
            if isinstance(data, list):
                count_str = f"{len(data)} items returned"
            elif isinstance(data, dict):
                count_str = f"Keys: {list(data.keys())[:4]}"
            else:
                count_str = str(data)
            print(f"[OK 200] {label:30} -> {count_str}")
    except Exception as e:
        print(f"[FAIL]   {label:30} -> Error: {e}")

print("="*65)
