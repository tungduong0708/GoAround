"""Admin service layer for moderation and business verification."""

import uuid
from datetime import datetime, timedelta
from typing import Literal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    ContentReport,
    ForumPost,
    ModerationTarget,
    PostReply,
    Profile,
)
from app.schemas import (
    ForumAuthorSchema,
    ForumCommentSchema,
    ForumCommentUserSchema,
    ForumPostDetail,
    ForumPostImageSchema,
    ForumTagSchema,
    ModerationCaseDetail,
    ModerationCaseSummary,
    ReportDetail,
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

    # Update status based on action
    if action == "dismiss":
        moderation_target.status = "approved"
    else:  # remove_content or ban_user
        moderation_target.status = "rejected"

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
