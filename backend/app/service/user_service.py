import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    ForumPost,
    Profile,
    Review,
    ReviewImage,
    Trip,
    auth_users,
)
from app.schemas import (
    PlaceMinimal,
    ReviewImageSchema,
    UserCreate,
    UserDetail,
    UserPhotoResponse,
    UserPostResponse,
    UserPublic,
    UserReviewResponse,
    UserStats,
    UserTripResponse,
    UserUpdate,
)


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


async def get_user_public_with_stats(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> UserPublic | None:
    """
    Get public user profile with activity statistics.
    """
    profile = await _get_profile(session, user_id)

    if not profile:
        return None

    # Get statistics
    reviews_count = await session.scalar(
        select(func.count(Review.id)).where(Review.user_id == user_id)
    )
    posts_count = await session.scalar(
        select(func.count(ForumPost.id)).where(ForumPost.author_id == user_id)
    )

    # Photos count from reviews
    photos_from_reviews = await session.scalar(
        select(func.count(ReviewImage.id)).join(Review).where(Review.user_id == user_id)
    )

    photos_count = photos_from_reviews or 0

    # Public trips count
    public_trips_count = await session.scalar(
        select(func.count(Trip.id)).where(Trip.user_id == user_id)
    )

    stats = UserStats(
        reviews_count=reviews_count or 0,
        posts_count=posts_count or 0,
        photos_count=photos_count,
        public_trips_count=public_trips_count or 0,
    )

    joined_at = profile.updated_at

    return UserPublic(
        username=profile.username,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        id=profile.id,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
        stats=stats,
        joined_at=joined_at,
    )


async def get_user_reviews(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Sequence[UserReviewResponse]:
    """
    Get list of reviews written by a specific user.
    """
    stmt = (
        select(Review)
        .options(
            selectinload(Review.place),
            selectinload(Review.images),
        )
        .where(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
    )
    result = await session.execute(stmt)
    reviews = result.scalars().all()

    return [
        UserReviewResponse(
            id=review.id,
            place=PlaceMinimal(
                id=review.place.id,
                name=review.place.name,
                main_image_url=review.place.main_image_url,
            ),
            rating=review.rating,
            review_text=review.review_text,
            created_at=review.created_at,
            images=[
                ReviewImageSchema(
                    id=img.id, image_url=img.image_url, created_at=img.created_at
                )
                for img in review.images
            ],
        )
        for review in reviews
    ]


async def get_user_posts(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Sequence[UserPostResponse]:
    """
    Get list of forum threads created by a specific user.
    """
    stmt = (
        select(ForumPost)
        .options(selectinload(ForumPost.comments))
        .where(ForumPost.author_id == user_id)
        .order_by(ForumPost.created_at.desc())
    )
    result = await session.execute(stmt)
    posts = result.scalars().all()

    return [
        UserPostResponse(
            id=post.id,
            title=post.title,
            content_snippet=post.content[:150] + "..."
            if len(post.content) > 150
            else post.content,
            reply_count=len(post.comments),
            created_at=post.created_at,
        )
        for post in posts
    ]


async def get_user_trips(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Sequence[UserTripResponse]:
    """
    Get list of public trips created by a specific user.
    """
    stmt = (
        select(Trip)
        .options(selectinload(Trip.stops))
        .where(Trip.user_id == user_id)
        .order_by(Trip.start_date.desc().nullsfirst())
    )
    result = await session.execute(stmt)
    trips = result.scalars().all()

    return [
        UserTripResponse(
            id=trip.id,
            trip_name=trip.trip_name,
            start_date=trip.start_date,
            end_date=trip.end_date,
            stop_count=len(trip.stops),
        )
        for trip in trips
    ]


async def get_user_photos(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Sequence[UserPhotoResponse]:
    """
    Get gallery of photos uploaded by the user.
    """
    stmt = (
        select(ReviewImage)
        .join(Review)
        .where(Review.user_id == user_id)
        .order_by(ReviewImage.created_at.desc())
    )
    result = await session.execute(stmt)
    review_images = result.scalars().all()

    photos = [
        UserPhotoResponse(
            id=img.id,
            image_url=img.image_url,
            source_type="review",
            source_id=img.review_id,
        )
        for img in review_images
    ]

    return photos
