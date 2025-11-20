from typing import AsyncGenerator

import pytest
from app.core.db import sessionmanager
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession


# 1. The Client Fixture (Sync)
# Used for API Integration Tests (e.g., client.get("/items"))
# This automatically triggers the app's startup/shutdown events.
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# 2. The Session Fixture (Async)
# Used for Database Unit Tests (e.g., await crud.create_item(session, ...))
# This gives you a fresh, direct connection to the DB for each test.
@pytest.fixture(scope="function")
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with sessionmanager.session() as session:
        yield session
