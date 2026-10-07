import urllib.request
import json

def test():
    # 1. Seed demo accounts
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/auth/seed-demo", method="POST")
    with urllib.request.urlopen(req) as resp:
        print("1. Seed Demo status:", resp.status)

    # 2. Login as TPO
    login_payload = json.dumps({"email": "tpo@campuslink.edu", "password": "password123"}).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/auth/login",
        data=login_payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        token = data["access_token"]
        refresh = data["refresh_token"]
        session_id = data["session_id"]
        print("2. Login Success! Role:", data["role"], "Session ID:", session_id[:16])

    # 3. Test Refresh Token Rotation
    refresh_payload = json.dumps({"refresh_token": refresh}).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/auth/refresh",
        data=refresh_payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        ref_data = json.loads(resp.read().decode())
        new_token = ref_data["access_token"]
        print("3. Token Refreshed! New Access Token prefix:", new_token[:20])

    # 4. Fetch Governance Stats
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/governance/stats",
        headers={"Authorization": f"Bearer {new_token}"}
    )
    with urllib.request.urlopen(req) as resp:
        stats = json.loads(resp.read().decode())
        print("4. Governance Stats:", stats)

    # 5. Fetch Security Audit Logs
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/governance/audit-logs?page_size=5",
        headers={"Authorization": f"Bearer {new_token}"}
    )
    with urllib.request.urlopen(req) as resp:
        logs = json.loads(resp.read().decode())
        print("5. Audit Logs total:", logs["total"])
        for log in logs["logs"]:
            print(f"   - [{log['created_at'][:19]}] {log['action']} by {log['actor_email']} -> {log['status']}")

if __name__ == "__main__":
    test()
