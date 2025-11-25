from tests.conftest import client


def test_health_check():
    """1. Sanity Check: Is the app running?"""
    response = client().get("/api/v1/utils/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
