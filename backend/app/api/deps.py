from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import sessionmanager


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with sessionmanager.session() as session:
        yield session
