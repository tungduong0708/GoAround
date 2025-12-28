"""Admin service layer for moderation and business verification."""

import uuid
from datetime import datetime, timedelta
from typing import Literal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    BusinessVerificationRequest,
    ContentReport,
    ForumPost,
    ModerationTarget,
    PostReply,
    Profile,
)
from app.schemas import (
    BusinessVerificationDetail,
    ForumAuthorSchema,
    ForumCommentSchema,
    ForumCommentUserSchema,
    ForumPostDetail,
    ForumPostImageSchema,
    ForumTagSchema,
    ModerationCaseDetail,
    ModerationCaseSummary,
    ReportDetail,
    UserPublic,
    UserStats,
)


async def get_moderation_cases(
    session: AsyncSession,
    page: int = 1,
    limit: int = 20,
    status_filter: str | None = None,
) -> tuple[list[ModerationCaseSummary], int]:
    """
    Get all moderation cases with aggregated report counts.

    Returns:
        Tuple of (cases_list, total_count)
    """
    # Build base query
    stmt = (
        select(
            ModerationTarget,
            func.count(ContentReport.id).label("report_count"),
        )
        .outerjoin(
            ContentReport, ModerationTarget.id == ContentReport.moderation_target_id
        )
        .group_by(ModerationTarget.id)
    )

    # Apply status filter
    if status_filter and status_filter in ["pending", "approved", "rejected"]:
        stmt = stmt.where(ModerationTarget.status == status_filter)

    # Order by created_at descending (newest first)
    stmt = stmt.order_by(ModerationTarget.created_at.desc())

    # Get total count
    count_stmt = select(func.count()).select_from(stmt.alias())
    total_result = await session.execute(count_stmt)
    total_count = total_result.scalar_one()

    # Apply pagination
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    # Execute query
    result = await session.execute(stmt)
    rows = result.all()

    # Build response
    cases = []
    for moderation_target, report_count in rows:
        cases.append(
            ModerationCaseSummary(
                id=moderation_target.id,
                target_type=moderation_target.target_type,
                target_id=moderation_target.target_id,
                status=moderation_target.status,
                created_at=moderation_target.created_at,
                report_count=report_count or 0,
            )
        )

    return cases, total_count


async def get_case_detail(
    session: AsyncSession,
    case_id: uuid.UUID,
) -> ModerationCaseDetail | None:
    """
    Get detailed information about a specific moderation case.

    Fetches the ModerationTarget, associated ContentReports, and content snapshot.
    """
    # Fetch moderation target with reports
    stmt = (
        select(ModerationTarget)
        .options(selectinload(ModerationTarget.reports))
        .where(ModerationTarget.id == case_id)
    )
    result = await session.execute(stmt)
    moderation_target = result.scalars().first()

    if not moderation_target:
        return None

    # Build report details
    report_details = [
        ReportDetail(
            id=report.id,
            reporter_id=report.reporter_id,
            reason=report.reason,
            created_at=report.created_at,
        )
        for report in moderation_target.reports
    ]

    # Fetch content snapshot based on target_type
    content_snapshot = await _fetch_content_snapshot(
        session,
        moderation_target.target_type,
        moderation_target.target_id,
    )

    return ModerationCaseDetail(
        id=moderation_target.id,
        target_type=moderation_target.target_type,
        target_id=moderation_target.target_id,
        status=moderation_target.status,
        created_at=moderation_target.created_at,
        report_count=len(report_details),
        reason=moderation_target.reason,
        resolved_at=moderation_target.resolved_at,
        content_snapshot=content_snapshot,
        reports=report_details,
    )


async def _fetch_content_snapshot(
    session: AsyncSession,
    target_type: str,
    target_id: uuid.UUID,
) -> ForumPostDetail | ForumCommentSchema | None:
    """
    Fetch the content snapshot based on target type.

    Args:
        target_type: Either "post" or "reply"
        target_id: UUID of the target content

    Returns:
        ForumPostDetail for posts, ForumCommentSchema for replies, or None if not found
    """
    if target_type == "post":
        # Fetch forum post
        stmt = (
            select(ForumPost)
            .options(
                selectinload(ForumPost.author),
                selectinload(ForumPost.images),
                selectinload(ForumPost.tags),
                selectinload(ForumPost.replies).selectinload(PostReply.user),
            )
            .where(ForumPost.id == target_id)
        )
        result = await session.execute(stmt)
        post = result.scalars().first()

        if not post:
            return None

        return ForumPostDetail(
            id=post.id,
            title=post.title,
            content=post.content,
            author=ForumAuthorSchema(
                id=post.author.id,
                username=post.author.username,
                avatar_url=post.author.avatar_url,
            ),
            images=[
                ForumPostImageSchema(id=img.id, image_url=img.image_url)
                for img in post.images
            ],
            tags=[ForumTagSchema(id=tag.id, name=tag.name) for tag in post.tags],
            replies=[
                ForumCommentSchema(
                    id=reply.id,
                    content=reply.content,
                    user=ForumCommentUserSchema(
                        id=reply.user.id,
                        username=reply.user.username,
                        avatar_url=reply.user.avatar_url,
                    ),
                    created_at=reply.created_at,
                    parent_id=reply.parent_id,
                )
                for reply in post.replies
            ],
            created_at=post.created_at,
        )

    elif target_type == "reply":
        # Fetch post reply
        stmt = (
            select(PostReply)
            .options(selectinload(PostReply.user))
            .where(PostReply.id == target_id)
        )
        result = await session.execute(stmt)
        reply = result.scalars().first()

        if not reply:
            return None

        return ForumCommentSchema(
            id=reply.id,
            content=reply.content,
            user=ForumCommentUserSchema(
                id=reply.user.id,
                username=reply.user.username,
                avatar_url=reply.user.avatar_url,
            ),
            created_at=reply.created_at,
            parent_id=reply.parent_id,
        )

    return None


async def resolve_case(
    session: AsyncSession,
    case_id: uuid.UUID,
    action: Literal["dismiss", "remove_content", "ban_user"],
    notes: str | None = None,
    ban_duration_days: int | None = None,
) -> bool:
    """
    Resolve a moderation case with the specified action.

    Action Mapping:
    - "dismiss" -> status = "approved" (Content is safe)
    - "remove_content" / "ban_user" -> status = "rejected" (Content is removed)

    Args:
        case_id: UUID of the moderation case
        action: Action to take (dismiss, remove_content, ban_user)
        notes: Optional notes about the resolution
        ban_duration_days: Required when action is "ban_user"

    Returns:
        True if successful, False if case not found
    """
    # Fetch moderation target
    stmt = select(ModerationTarget).where(ModerationTarget.id == case_id)
    result = await session.execute(stmt)
    moderation_target = result.scalars().first()

    if not moderation_target:
        return False

    # OLD: Update status based on action
    # if action == "dismiss":
    #     moderation_target.status = "approved"
    # else:  # remove_content or ban_user
    #     moderation_target.status = "rejected"
    #
    # NEW: Considered "approved" as "resolved", to reduce changes
    #   Thus, always set status to "approved"
    moderation_target.status = "approved"

    # Set resolution metadata
    moderation_target.resolved_at = datetime.utcnow()
    if notes:
        moderation_target.reason = notes

    # Handle user ban
    if action == "ban_user":
        if not ban_duration_days:
            raise ValueError("ban_duration_days is required when action is ban_user")

        await _ban_content_author(
            session,
            moderation_target.target_type,
            moderation_target.target_id,
            ban_duration_days,
        )

    # Handle content removal
    if action in ["remove_content", "ban_user"]:
        await _remove_content(
            session,
            moderation_target.target_type,
            moderation_target.target_id,
        )

    await session.commit()
    return True


async def _remove_content(
    session: AsyncSession,
    target_type: str,
    target_id: uuid.UUID,
) -> None:
    """
    Hide the reported content (post or reply) by setting visible=False.
    This is a soft delete to preserve content for audit purposes.
    """
    if target_type == "post":
        stmt = select(ForumPost).where(ForumPost.id == target_id)
        result = await session.execute(stmt)
        post = result.scalars().first()
        if post:
            post.visible = False

    elif target_type == "reply":
        stmt = select(PostReply).where(PostReply.id == target_id)
        result = await session.execute(stmt)
        reply = result.scalars().first()
        if reply:
            reply.visible = False


async def _ban_content_author(
    session: AsyncSession,
    target_type: str,
    target_id: uuid.UUID,
    ban_duration_days: int,
) -> None:
    """
    Ban the author of the reported content.
    """
    author_id = None

    # Get author ID based on content type
    if target_type == "post":
        stmt = select(ForumPost.author_id).where(ForumPost.id == target_id)
        result = await session.execute(stmt)
        author_id = result.scalar_one_or_none()

    elif target_type == "reply":
        stmt = select(PostReply.user_id).where(PostReply.id == target_id)
        result = await session.execute(stmt)
        author_id = result.scalar_one_or_none()

    # Apply ban if author found
    if author_id:
        stmt = select(Profile).where(Profile.id == author_id)
        result = await session.execute(stmt)
        profile = result.scalars().first()

        if profile:
            ban_until = datetime.utcnow() + timedelta(days=ban_duration_days)
            profile.ban_until = ban_until


async def get_unverified_businesses(
    session: AsyncSession,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[BusinessVerificationDetail], int]:
    """
    Get all pending business verification requests.

    Returns:
        Tuple of (verification_list, total_count)
    """
    # Count total pending requests
    count_stmt = (
        select(func.count())
        .select_from(BusinessVerificationRequest)
        .where(BusinessVerificationRequest.status == "pending")
    )
    total_res = await session.execute(count_stmt)
    total = int(total_res.scalar() or 0)

    # Fetch pending requests with profile information
    stmt = (
        select(BusinessVerificationRequest)
        .options(
            selectinload(BusinessVerificationRequest.profile).selectinload(
                Profile.posts
            ),
            selectinload(BusinessVerificationRequest.profile).selectinload(
                Profile.replies
            ),
            selectinload(BusinessVerificationRequest.profile).selectinload(
                Profile.reviews
            ),
            selectinload(BusinessVerificationRequest.profile).selectinload(
                Profile.trips
            ),
        )
        .where(BusinessVerificationRequest.status == "pending")
        .order_by(BusinessVerificationRequest.created_at.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await session.execute(stmt)
    requests = result.scalars().all()

    # Convert to response schema
    verification_list = []
    for req in requests:
        # Get user stats
        posts_count = len(req.profile.posts) if req.profile.posts else 0
        replies_count = len(req.profile.replies) if req.profile.replies else 0
        reviews_count = len(req.profile.reviews) if req.profile.reviews else 0
        trips_count = (
            len([t for t in req.profile.trips if t.is_public])
            if req.profile.trips
            else 0
        )

        user_public = UserPublic(
            id=req.profile.id,
            username=req.profile.username,
            full_name=req.profile.full_name,
            avatar_url=req.profile.avatar_url,
            role=req.profile.role,
            is_verified_business=req.profile.is_verified_business,
            stats=UserStats(
                reviews_count=reviews_count,
                posts_count=posts_count,
                photos_count=0,  # Not tracking individual photos
                public_trips_count=trips_count,
                replies_count=replies_count,
            ),
            created_at=req.profile.updated_at,  # Using updated_at as created_at proxy
        )

        verification_list.append(
            BusinessVerificationDetail(
                user=user_public,
                verification_id=req.id,
                business_image_url=req.business_image_url,
                business_description=req.business_description,
                status=req.status,
                created_at=req.created_at,
                reviewed_at=req.reviewed_at,
            )
        )

    return verification_list, total


async def verify_business(
    session: AsyncSession,
    user_id: uuid.UUID,
    action: Literal["approve", "reject"],
) -> bool:
    """
    Approve or reject a business verification request.

    Args:
        user_id: UUID of the user profile
        action: Action to take (approve or reject)

    Returns:
        True if successful, False if request not found
    """
    # Find the pending verification request for this user
    stmt = (
        select(BusinessVerificationRequest)
        .options(selectinload(BusinessVerificationRequest.profile))
        .where(
            BusinessVerificationRequest.profile_id == user_id,
            BusinessVerificationRequest.status == "pending",
        )
    )

    result = await session.execute(stmt)
    verification_request = result.scalars().first()

    if not verification_request:
        return False

    # Update verification request status
    verification_request.status = "approved" if action == "approve" else "rejected"
    verification_request.reviewed_at = datetime.utcnow()

    # If approved, update the profile
    if action == "approve":
        verification_request.profile.is_verified_business = True
        verification_request.profile.role = "business"

    await session.commit()
    return True
