import time

import jwt
from app.core.config import settings
from app.main import app
from fastapi.testclient import TestClient

# Use a TestClient context manager
client = TestClient(app)


def test_health_check():
    """1. Sanity Check: Is the app running?"""
    response = client.get("/api/v1/private/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_jwt_security_integration():
    """
    2. Security Configuration Check:
    We use the local-only '/me' endpoint to prove that
    our backend can correctly decode tokens signed with our Secret.

    If this passes, we know Auth is working for ALL routes.
    """

    # A. Generate a fake "Supabase" token using our backend's secret
    payload = {
        "iss": "https://project-ref.supabase.co/auth/v1",
        "aud": "authenticated",
        "exp": time.time() + 3600,
        "iat": time.time(),
        "sub": "123e4567-e89b-12d3-a456-426614174000",
        "role": "authenticated",
        "aal": "aal1",
        "session_id": "session-uuid",
        "email": "user@example.com",
        "phone": "+1234567890",
        "is_anonymous": False,
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

    # B. Send it to the protected endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/private/me", headers=headers)

    # C. Verify the backend let us in
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"


def test_reject_invalid_token():
    """3. Negative Test: Ensure bad tokens are blocked."""
    headers = {"Authorization": "Bearer invalid-token-junk"}
    response = client.get("/api/v1/private/me", headers=headers)
    assert response.status_code == 401
