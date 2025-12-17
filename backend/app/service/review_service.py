"""Review CRUD operations."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Place, Review, ReviewImage
from app.schemas import (
    ReviewCreate,
    ReviewImageSchema,
    ReviewSchema,
    ReviewUpdate,
    ReviewerSchema,
)


async def _recalculate_place_rating(
    session: AsyncSession, place_id: uuid.UUID
) -> None:
    """Recalculate average rating and review count for a place."""
    result = await session.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.place_id == place_id
        )
    )
    avg, count = result.first() or (0, 0)
    place = await session.get(Place, place_id)
    if place:
        place.average_rating = float(avg or 0)
        place.review_count = int(count or 0)


async def create_review(
    session: AsyncSession, user_id: uuid.UUID, data: ReviewCreate
) -> ReviewSchema:
    """Create a new review for a place."""
    place = await session.get(Place, data.place_id)
    if not place:
        raise ValueError("Place not found")

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

    await _recalculate_place_rating(session, data.place_id)
    await session.commit()
    await session.refresh(review)
    return await get_review(session, review.id)  # type: ignore


async def get_review(session: AsyncSession, review_id: uuid.UUID) -> ReviewSchema | None:
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
        user=ReviewerSchema.model_validate(review.user) if review.user else None,
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
            user=ReviewerSchema.model_validate(r.user) if r.user else None,
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
        raise PermissionError("Not allowed")

    upd = data.model_dump(exclude_unset=True)
    images = upd.pop("images", None)
    for k, v in upd.items():
        setattr(review, k, v)

    if images is not None:
        for img in list(review.images):
            await session.delete(img)
        for url in images:
            session.add(ReviewImage(review_id=review.id, image_url=url))

    await _recalculate_place_rating(session, review.place_id)
    await session.commit()
    return await get_review(session, review.id)  # type: ignore


async def delete_review(
    session: AsyncSession, user_id: uuid.UUID, review_id: uuid.UUID
) -> None:
    """Delete a review."""
    review = await session.get(Review, review_id)
    if not review:
        raise ValueError("Review not found")
    if review.user_id != user_id:
        raise PermissionError("Not allowed")
    place_id = review.place_id
    await session.delete(review)
    await _recalculate_place_rating(session, place_id)
    await session.commit()
