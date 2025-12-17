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
SessionDep = Annotated[AsyncSession, Depends(get_db)]


# JWT Token Dependency
TokenPayloadDep = Annotated[TokenPayload, Depends(get_token_payload)]


def get_user_id(token_payload: TokenPayloadDep) -> uuid.UUID:
    try:
        # Sub is the UUID from auth.users, which maps to Profile.id
        return uuid.UUID(token_payload.sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )


# Current User ID Dependency
CurrentUserIdDep = Annotated[uuid.UUID, Depends(get_user_id)]


async def get_current_user(
    session: SessionDep,
    user_id: CurrentUserIdDep,
) -> Profile:
    """
    Dependency to get the current authenticated user (Profile).
    """
    result = await session.execute(select(Profile).where(Profile.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return user


# Current User Dependency
CurrentUserDep = Annotated[Profile, Depends(get_current_user)]
