"""Review CRUD operations."""

import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Place, Review, ReviewImage, Profile
from app.schemas import (
    ReviewCreate,
    ReviewImageSchema,
    ReviewSchema,
    ReviewUpdate,
    ReviewerSchema,
)
from app.service.utils import is_user_banned


def _sanitize_reviewer(user: Profile | None) -> ReviewerSchema | None:
    """Return sanitized reviewer data, hiding info if banned."""
    if user is None:
        return None
    if is_user_banned(user):
        return ReviewerSchema(id=user.id, username="Banned User", avatar_url=None)
    return ReviewerSchema(
        id=user.id, username=user.username, avatar_url=user.avatar_url
    )


async def _recalculate_place_rating(session: AsyncSession, place_id: uuid.UUID) -> None:
    """Recalculate average rating and review count for a place.

    Note: This should be called within a transaction to ensure consistency.
    """
    result = await session.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.place_id == place_id
        )
    )
    avg, count = result.first() or (0, 0)
    place = await session.get(Place, place_id)
    if place:
        place.average_rating = float(avg or 0.0)
        place.review_count = int(count or 0)
    else:
        raise ValueError(f"Place not found with ID: {place_id}")


async def create_review(
    session: AsyncSession, user_id: uuid.UUID, data: ReviewCreate
) -> ReviewSchema:
    """Create a new review for a place."""
    place = await session.get(Place, data.place_id)
    if not place:
        raise ValueError("Place not found")

    try:
        review = Review(
            place_id=data.place_id,
            user_id=user_id,
            rating=data.rating,
            review_text=data.review_text,
        )
        session.add(review)
        await session.flush()

        for url in data.images:
            session.add(ReviewImage(review_id=review.id, image_url=url))
    except Exception as e:
        await session.rollback()
        raise ValueError(f"Failed to create review: {str(e)}")

    await _recalculate_place_rating(session, data.place_id)
    await session.commit()
    await session.refresh(review)
    review_detail = await get_review(session, review.id)
    if not review_detail:
        raise ValueError(f"Failed to retrieve created review with ID: {review.id}")
    return review_detail


async def get_review(
    session: AsyncSession, review_id: uuid.UUID
) -> ReviewSchema | None:
    """Get a review by ID."""
    res = await session.execute(
        select(Review)
        .options(selectinload(Review.images), selectinload(Review.user))
        .where(Review.id == review_id)
    )
    review = res.scalars().first()
    if not review:
        return None

    return ReviewSchema(
        id=review.id,
        place_id=review.place_id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at,
        images=[ReviewImageSchema.model_validate(img) for img in review.images],
        user=_sanitize_reviewer(review.user),
    )


async def list_reviews_for_place(
    session: AsyncSession, place_id: uuid.UUID, page: int, limit: int
) -> tuple[list[ReviewSchema], int]:
    """List all reviews for a specific place with pagination."""
    base_query = select(Review.id).where(Review.place_id == place_id)
    total_res = await session.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = int(total_res.scalar() or 0)

    stmt = (
        select(Review)
        .options(selectinload(Review.images), selectinload(Review.user))
        .where(Review.place_id == place_id)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    res = await session.execute(stmt)
    reviews = res.scalars().all()
    data = [
        ReviewSchema(
            id=r.id,
            place_id=r.place_id,
            rating=r.rating,
            review_text=r.review_text,
            created_at=r.created_at,
            images=[ReviewImageSchema.model_validate(img) for img in r.images],
            user=_sanitize_reviewer(r.user),
        )
        for r in reviews
    ]
    return data, total


async def update_review(
    session: AsyncSession, user_id: uuid.UUID, review_id: uuid.UUID, data: ReviewUpdate
) -> ReviewSchema:
    """Update an existing review."""
    review = await session.get(Review, review_id)
    if not review:
        raise ValueError("Review not found")
    if review.user_id != user_id:
        raise PermissionError("Not authorized to update this review")

    try:
        upd = data.model_dump(exclude_unset=True)
        images = upd.pop("images", None)
        for k, v in upd.items():
            setattr(review, k, v)

        if images is not None:
            # Use ORM relationship to clear images (CASCADE handles deletion)
            review.images.clear()
            for url in images:
                session.add(ReviewImage(review_id=review.id, image_url=url))
    except Exception as e:
        await session.rollback()
        raise ValueError(f"Failed to update review: {str(e)}")

    await _recalculate_place_rating(session, review.place_id)
    await session.commit()
    review_detail = await get_review(session, review.id)
    if not review_detail:
        raise ValueError(f"Failed to retrieve updated review with ID: {review.id}")
    return review_detail


async def delete_review(
    session: AsyncSession, user_id: uuid.UUID, review_id: uuid.UUID
) -> None:
    """Delete a review."""
    review = await session.get(Review, review_id)
    if not review:
        raise ValueError("Review not found")
    if review.user_id != user_id:
        raise PermissionError("Not authorized to delete this review")
    place_id = review.place_id
    await session.delete(review)
    await _recalculate_place_rating(session, place_id)
    await session.commit()
