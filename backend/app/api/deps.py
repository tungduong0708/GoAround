import uuid
from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import sessionmanager
from app.core.security import TokenPayload, get_token_payload
from app.models import Profile


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with sessionmanager.session() as session:
        yield session


# Session Dependency
type SessionDep = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    session: SessionDep,
    token_payload: TokenPayload = Depends(get_token_payload),
) -> Profile:
    """
    Dependency to get the current authenticated user (Profile).
    """
    try:
        # Sub is the UUID from auth.users, which maps to Profile.id
        user_id = uuid.UUID(token_payload.sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )

    result = await session.execute(select(Profile).where(Profile.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return user


# Current User Dependency
type CurrentUser = Annotated[Profile, Depends(get_current_user)]
