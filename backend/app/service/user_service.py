import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Profile, auth_users
from app.schemas import UserCreate, UserDetail, UserPublic, UserUpdate


async def _get_profile(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Profile | None:
    result = await session.execute(select(Profile).where(Profile.id == user_id))
    return result.scalars().first()


async def _get_email(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> str | None:
    stmt = select(auth_users.c.email).where(auth_users.c.id == user_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_public(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> UserPublic | None:
    """
    Get public user profile by ID.
    """
    profile = await _get_profile(session, user_id)

    if not profile:
        return None

    return UserPublic(
        username=profile.username,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        id=profile.id,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
    )


async def get_user_detail(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> UserDetail | None:
    """
    Get detail user profile by ID.
    """
    user_public = await get_user_public(session, user_id)

    if not user_public:
        return None

    email = await _get_email(session, user_id)

    return UserDetail(
        username=user_public.username,
        full_name=user_public.full_name,
        avatar_url=user_public.avatar_url,
        id=user_public.id,
        role=user_public.role,
        is_verified_business=user_public.is_verified_business,
        email=email,
    )


async def create_user(
    session: AsyncSession,
    user_id: uuid.UUID,
    user_create: UserCreate,
) -> UserDetail:
    """
    Create a user profile, after `auth.users` table has been updated.
    """
    role = "Traveler" if user_create.signup_type == "Traveler" else "Business"
    profile = Profile(
        id=user_id,
        username=user_create.username,
        full_name=user_create.full_name,
        avatar_url=user_create.avatar_url,
        role=role,
    )

    session.add(profile)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise RuntimeError("Profile already exists")

    email = await _get_email(session, user_id)

    return UserDetail(
        id=profile.id,
        username=profile.username,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
        email=email,
    )


async def update_user(
    session: AsyncSession,
    user_id: uuid.UUID,
    user_update: UserUpdate,
) -> UserDetail | None:
    """
    Update a user profile.
    """
    profile = await _get_profile(session, user_id)

    if not profile:
        return None

    data = user_update.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(profile, field, value)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise RuntimeError("Profile already exists")

    email = await _get_email(session, user_id)

    return UserDetail(
        id=profile.id,
        username=profile.username,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
        email=email,
    )
