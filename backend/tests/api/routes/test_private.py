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
        "sub": "123-456-789",
        "email": "test@integration.com",
        "aud": "authenticated",
        "exp": time.time() + 3600,
        "iat": time.time(),
        "role": "authenticated",
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

    # B. Send it to the protected endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/private/me", headers=headers)

    # C. Verify the backend let us in
    assert response.status_code == 200
    assert response.json()["email"] == "test@integration.com"


def test_reject_invalid_token():
    """3. Negative Test: Ensure bad tokens are blocked."""
    headers = {"Authorization": "Bearer invalid-token-junk"}
    response = client.get("/api/v1/private/me", headers=headers)
    assert response.status_code == 401
