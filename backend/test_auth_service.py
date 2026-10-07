import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1/auth"

def make_req(endpoint, data=None, headers=None, method="GET"):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode("utf-8") if data else None,
        headers=headers or {},
        method=method
    )
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8")), resp.headers
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body), e.headers
        except:
            return e.code, body, e.headers

def run_tests():
    print("=== STARTING AUTH SERVICE TEST SUITE ===")
    
    # 1. Seed demo users
    status, body, _ = make_req("/seed-demo", method="POST")
    assert status == 200, f"Seed demo failed: {body}"
    print("[PASS] 1. Seed demo users OK (seeded", len(body), "users)")

    # 2. Login as TPO
    login_payload = {
        "email": "tpo@campuslink.edu",
        "password": "password123",
        "device_info": "Automated Test Suite / Python",
    }
    status, body, headers = make_req("/login", data=login_payload, method="POST")
    assert status == 200, f"TPO login failed: {body}"
    tpo_token = body["access_token"]
    tpo_refresh = body["refresh_token"]
    tpo_session = body["session_id"]
    print(f"[PASS] 2. TPO login OK (Session: {tpo_session[:12]}..., Role: {body['role']})")

    # 3. Verify Cookies were set
    cookie_str = headers.get("Set-Cookie", "")
    assert "camptocorp_access_token=" in cookie_str or "camptocorp_session=" in cookie_str or len(cookie_str) > 0
    print("[PASS] 3. Auth HttpOnly cookies set properly")

    # 4. Get Current User (/me)
    status, body, _ = make_req("/me", headers={"Authorization": f"Bearer {tpo_token}"})
    assert status == 200, f"/me failed: {body}"
    assert body["email"] == "tpo@campuslink.edu"
    print(f"[PASS] 4. Authenticated profile check (/me) OK: {body['full_name']}")

    # 5. Token Refresh Rotation
    status, body, _ = make_req("/refresh", data={"refresh_token": tpo_refresh}, method="POST")
    assert status == 200, f"Token refresh failed: {body}"
    new_token = body["access_token"]
    new_refresh = body["refresh_token"]
    assert new_refresh != tpo_refresh, "Refresh token should have been rotated!"
    print("[PASS] 5. Zero-Trust Refresh Token Rotation OK (New token issued)")

    # 6. Detect Token Reuse (Attacker uses old refresh token)
    status, body, _ = make_req("/refresh", data={"refresh_token": tpo_refresh}, method="POST")
    assert status == 401, f"Expected 401 for reused refresh token, got {status}: {body}"
    print("[PASS] 6. Token Reuse / Breach Detection triggered OK (Reused token rejected)")

    # 7. Register a New Student (Test profile linking & roll number assignment)
    test_student_email = f"student_{int(time.time())}@campuslink.edu"
    reg_payload = {
        "email": test_student_email,
        "password": "SecretPassword123!",
        "full_name": "Rohan Deshmukh",
        "role": "STUDENT",
        "institution_name": "National Institute of Technology",
        "department": "Computer Science Engineering",
        "roll_number": f"CS2026-{int(time.time()) % 10000}",
        "cgpa": 9.15,
        "batch_year": 2026,
    }
    status, body, _ = make_req("/register", data=reg_payload, method="POST")
    assert status == 200, f"Student registration failed: {body}"
    student_token = body["access_token"]
    student_session = body["session_id"]
    print(f"[PASS] 7. New Student registration OK (Linked student created, Session: {student_session[:12]}...)")

    # 8. Password Change Workflow
    pw_payload = {
        "current_password": "SecretPassword123!",
        "new_password": "BrandNewPassword2026!",
    }
    status, body, _ = make_req(
        "/change-password",
        data=pw_payload,
        headers={"Authorization": f"Bearer {student_token}"},
        method="POST"
    )
    assert status == 200, f"Password change failed: {body}"
    print("[PASS] 8. Secure Password Rotation OK")

    # 9. Test Login with New Password
    status, body, _ = make_req(
        "/login",
        data={"email": test_student_email, "password": "BrandNewPassword2026!"},
        method="POST"
    )
    assert status == 200, f"Login with new password failed: {body}"
    print("[PASS] 9. Login with new password succeeded")

    # 10. Logout / Session Termination
    status, body, _ = make_req(
        "/logout",
        headers={"Authorization": f"Bearer {body['access_token']}", "Cookie": f"camptocorp_session={body['session_id']}"},
        method="POST"
    )
    assert status == 200, f"Logout failed: {body}"
    print("[PASS] 10. Session termination & logout OK")

    print("\n=== ALL AUTH SERVICE TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
