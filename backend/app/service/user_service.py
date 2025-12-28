import uuid
from datetime import datetime
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    BusinessVerificationRequest,
    ForumPost,
    ModerationTarget,
    PostReply,
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
    UserReplyResponse,
    UserReviewResponse,
    UserStats,
    UserUpdate,
)
from app.service.utils import is_user_banned


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


async def _get_ban_reason(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> str | None:
    """Get the most recent ban reason from moderation targets."""
    stmt = (
        select(ModerationTarget.reason)
        .where(
            ModerationTarget.target_type == "profile",
            ModerationTarget.target_id == user_id,
            ModerationTarget.status == "approved",
        )
        .order_by(ModerationTarget.created_at.desc())
        .limit(1)
    )
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

    # Check if user is banned
    if is_user_banned(profile):
        return UserPublic(
            username="Banned User",
            full_name="Banned User",
            avatar_url=None,
            id=profile.id,
            role=profile.role,
            is_verified_business=False,
            stats=UserStats(
                reviews_count=0,
                posts_count=0,
                photos_count=0,
                public_trips_count=0,
                replies_count=0,
            ),
            created_at=profile.updated_at,
        )

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

    # Replies count
    replies_count = await session.scalar(
        select(func.count(PostReply.id)).where(PostReply.user_id == user_id)
    )

    stats = UserStats(
        reviews_count=reviews_count or 0,
        posts_count=posts_count or 0,
        photos_count=photos_count,
        public_trips_count=public_trips_count or 0,
        replies_count=replies_count or 0,
    )

    return UserPublic(
        username=profile.username or "",
        full_name=profile.full_name or "",
        avatar_url=profile.avatar_url,
        id=profile.id,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
        stats=stats,
        created_at=profile.updated_at,
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
    profile = await _get_profile(session, user_id)
    ban_reason = (
        await _get_ban_reason(session, user_id)
        if profile and profile.ban_until
        else None
    )

    return UserDetail(
        username=user_public.username,
        full_name=user_public.full_name,
        avatar_url=user_public.avatar_url,
        id=user_public.id,
        role=user_public.role,
        is_verified_business=user_public.is_verified_business,
        stats=user_public.stats,
        created_at=user_public.created_at,
        email=email,
        ban_until=profile.ban_until if profile else None,
        ban_reason=ban_reason,
    )


async def create_user(
    session: AsyncSession,
    user_id: uuid.UUID,
    user_create: UserCreate,
) -> UserDetail:
    """
    Create a user profile, after `auth.users` table has been updated.
    """
    role = "traveler" if user_create.signup_type == "traveler" else "business"
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

    # If business account, submit verification request using shared logic
    if (
        role == "business"
        and user_create.business_image_url
        and user_create.business_description
    ):
        await submit_business_verification(
            session=session,
            user_id=user_id,
            business_image_url=user_create.business_image_url,
            business_description=user_create.business_description,
        )

    email = await _get_email(session, user_id)

    # Get statistics for new user
    stats = UserStats(
        reviews_count=0,
        posts_count=0,
        photos_count=0,
        public_trips_count=0,
        replies_count=0,
    )

    return UserDetail(
        id=profile.id,
        username=profile.username or "",
        full_name=profile.full_name or "",
        avatar_url=profile.avatar_url,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
        stats=stats,
        created_at=profile.updated_at,
        email=email,
        ban_until=profile.ban_until,
        ban_reason=None,
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

    data = user_update.model_dump(exclude_unset=True, exclude_none=True)

    for field, value in data.items():
        setattr(profile, field, value)

    try:
        await session.commit()
        await session.refresh(profile)
    except IntegrityError:
        await session.rollback()
        raise RuntimeError("Profile already exists")

    email = await _get_email(session, user_id)

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

    # Replies count
    replies_count = await session.scalar(
        select(func.count(PostReply.id)).where(PostReply.user_id == user_id)
    )

    stats = UserStats(
        reviews_count=reviews_count or 0,
        posts_count=posts_count or 0,
        photos_count=photos_count,
        public_trips_count=public_trips_count or 0,
        replies_count=replies_count or 0,
    )

    ban_reason = await _get_ban_reason(session, user_id) if profile.ban_until else None

    return UserDetail(
        id=profile.id,
        username=profile.username or "",
        full_name=profile.full_name or "",
        avatar_url=profile.avatar_url,
        role=profile.role,
        is_verified_business=profile.is_verified_business,
        stats=stats,
        created_at=profile.updated_at,
        email=email,
        ban_until=profile.ban_until,
        ban_reason=ban_reason,
    )


async def get_user_reviews(
    session: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
) -> tuple[Sequence[UserReviewResponse], int]:
    """
    Get list of reviews written by a specific user.
    """
    # Get total count
    count_stmt = select(func.count(Review.id)).where(Review.user_id == user_id)
    total = await session.scalar(count_stmt) or 0

    # Get paginated results
    offset = (page - 1) * limit
    stmt = (
        select(Review)
        .options(
            selectinload(Review.place),
            selectinload(Review.images),
        )
        .where(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    reviews = result.scalars().all()

    return (
        [
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
        ],
        total,
    )


async def get_user_posts(
    session: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
) -> tuple[Sequence[UserPostResponse], int]:
    """
    Get list of forum threads created by a specific user.
    """
    # Get total count
    count_stmt = select(func.count(ForumPost.id)).where(ForumPost.author_id == user_id)
    total = await session.scalar(count_stmt) or 0

    # Get paginated results
    offset = (page - 1) * limit
    stmt = (
        select(ForumPost)
        .options(selectinload(ForumPost.replies))
        .where(ForumPost.author_id == user_id)
        .order_by(ForumPost.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    posts = result.scalars().all()

    return (
        [
            UserPostResponse(
                id=post.id,
                title=post.title,
                content_snippet=post.content[:150] + "..."
                if len(post.content) > 150
                else post.content,
                reply_count=len(post.replies),
                created_at=post.created_at,
            )
            for post in posts
        ],
        total,
    )


async def get_user_photos(
    session: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
) -> tuple[Sequence[UserPhotoResponse], int]:
    """
    Get gallery of photos uploaded by the user.
    """
    # Get total count
    count_stmt = (
        select(func.count(ReviewImage.id)).join(Review).where(Review.user_id == user_id)
    )
    total = await session.scalar(count_stmt) or 0

    # Get paginated results
    offset = (page - 1) * limit
    stmt = (
        select(ReviewImage)
        .join(Review)
        .where(Review.user_id == user_id)
        .order_by(ReviewImage.created_at.desc())
        .offset(offset)
        .limit(limit)
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

    return photos, total


async def has_pending_verification_request(
    session: AsyncSession, user_id: uuid.UUID
) -> bool:
    """
    Check if a user has a pending business verification request.

    Returns:
        True if a pending verification request exists, False otherwise.
    """
    stmt = select(BusinessVerificationRequest).where(
        BusinessVerificationRequest.profile_id == user_id,
        BusinessVerificationRequest.status == "pending",
    )
    result = await session.execute(stmt)
    existing_request = result.scalars().first()
    return existing_request is not None


async def submit_business_verification(
    session: AsyncSession,
    user_id: uuid.UUID,
    business_image_url: str,
    business_description: str,
) -> BusinessVerificationRequest:
    """
    Submit or resubmit a business verification request.

    If a verification request already exists, it will be updated
    with the new information and status reset to "pending".
    Otherwise, a new request is created.

    This supports the re-verification workflow where rejected businesses
    can update their information and resubmit.

    Note: The caller should check for pending requests before calling this function.
    """
    # Check if verification request already exists
    stmt = select(BusinessVerificationRequest).where(
        BusinessVerificationRequest.profile_id == user_id
    )
    result = await session.execute(stmt)
    existing_request = result.scalars().first()

    if existing_request:
        # Update existing request (for re-verification)
        existing_request.business_image_url = business_image_url
        existing_request.business_description = business_description
        existing_request.status = "pending"
        existing_request.created_at = datetime.utcnow()
        existing_request.reviewed_at = None
        verification_request = existing_request
    else:
        # Create new request (first time submission)
        verification_request = BusinessVerificationRequest(
            profile_id=user_id,
            business_image_url=business_image_url,
            business_description=business_description,
            status="pending",
        )
        session.add(verification_request)

    await session.commit()
    await session.refresh(verification_request)

    return verification_request


async def get_user_replies(
    session: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
) -> tuple[Sequence[UserReplyResponse], int]:
    """
    Get list of forum replies created by a specific user.
    """
    # Get total count
    count_stmt = select(func.count(PostReply.id)).where(PostReply.user_id == user_id)
    total = await session.scalar(count_stmt) or 0

    # Get paginated results
    offset = (page - 1) * limit
    stmt = (
        select(PostReply)
        .options(selectinload(PostReply.post))
        .where(PostReply.user_id == user_id)
        .order_by(PostReply.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    replies = result.scalars().all()

    return (
        [
            UserReplyResponse(
                id=reply.id,
                post_id=reply.post_id,
                post_title=reply.post.title,
                content=reply.content,
                created_at=reply.created_at,
            )
            for reply in replies
        ],
        total,
    )
