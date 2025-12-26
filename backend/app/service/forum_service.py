"""Forum CRUD operations."""

import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    ContentReport,
    ForumPost,
    PostImage,
    PostReply,
    Profile,
    Tag,
    post_tags,
)
from app.schemas import (
    ContentReportCreate,
    ContentReportResponse,
    ForumAuthorSchema,
    ForumCommentSchema,
    ForumCommentUserSchema,
    ForumPostCreate,
    ForumPostDetail,
    ForumPostImageSchema,
    ForumPostListItem,
    ForumPostUpdate,
    ForumReplyCreate,
    ForumSearchFilter,
    ForumTagSchema,
)
from app.service.utils import is_user_banned


def _sanitize_author(author: Profile) -> ForumAuthorSchema:
    """Return sanitized author data, hiding info if banned."""
    if is_user_banned(author):
        return ForumAuthorSchema(id=author.id, username="Banned User")
    return ForumAuthorSchema(id=author.id, username=author.username)


def _sanitize_comment_user(user: Profile) -> ForumCommentUserSchema:
    """Return sanitized comment user data, hiding info if banned."""
    if is_user_banned(user):
        return ForumCommentUserSchema(
            id=user.id, username="Banned User", avatar_url=None
        )
    return ForumCommentUserSchema(
        id=user.id, username=user.username, avatar_url=user.avatar_url
    )


async def list_forum_posts(
    session: AsyncSession, filter_params: ForumSearchFilter
) -> tuple[list[ForumPostListItem], int]:
    """Search and list forum posts with filtering and pagination."""
    # Base query
    base_query = select(ForumPost.id)

    # Apply search filter
    if filter_params.q:
        search_term = f"%{filter_params.q}%"
        base_query = base_query.where(
            or_(
                ForumPost.title.ilike(search_term),
                ForumPost.content.ilike(search_term),
            )
        )

    # Apply tag filter
    if filter_params.tags:
        base_query = (
            base_query.join(post_tags).join(Tag).where(Tag.name.in_(filter_params.tags))
        )

    # Count total
    total_res = await session.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = int(total_res.scalar() or 0)

    # Build main query using cached reply_count from database
    main_query = select(ForumPost).options(
        selectinload(ForumPost.author),
        selectinload(ForumPost.tags),
    )

    # Apply search filter to main query
    if filter_params.q:
        search_term = f"%{filter_params.q}%"
        main_query = main_query.where(
            or_(
                ForumPost.title.ilike(search_term),
                ForumPost.content.ilike(search_term),
            )
        )

    # Apply tag filter to main query
    if filter_params.tags:
        main_query = (
            main_query.join(post_tags).join(Tag).where(Tag.name.in_(filter_params.tags))
        )

    # Apply sorting
    if filter_params.sort == "newest":
        main_query = main_query.order_by(ForumPost.created_at.desc())
    elif filter_params.sort == "oldest":
        main_query = main_query.order_by(ForumPost.created_at.asc())
    elif filter_params.sort == "popular":
        main_query = main_query.order_by(ForumPost.reply_count.desc())

    # Apply pagination
    main_query = main_query.offset(
        (filter_params.page - 1) * filter_params.limit
    ).limit(filter_params.limit)

    res = await session.execute(main_query)
    posts = []
    for post in res.scalars().all():
        # Create content snippet (first 200 characters)
        content_snippet = (
            post.content[:200] + "..." if len(post.content) > 200 else post.content
        )

        posts.append(
            ForumPostListItem(
                id=post.id,
                title=post.title,
                content_snippet=content_snippet,
                author=_sanitize_author(post.author),
                tags=[ForumTagSchema(id=tag.id, name=tag.name) for tag in post.tags],
                reply_count=post.reply_count,
                created_at=post.created_at,
            )
        )

    return posts, total


async def get_forum_post(
    session: AsyncSession, post_id: uuid.UUID
) -> ForumPostDetail | None:
    """Get a forum post with all its details including replies."""
    res = await session.execute(
        select(ForumPost)
        .options(
            selectinload(ForumPost.author),
            selectinload(ForumPost.images),
            selectinload(ForumPost.tags),
            selectinload(ForumPost.replies).selectinload(PostReply.user),
        )
        .where(ForumPost.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        return None

    return ForumPostDetail(
        id=post.id,
        title=post.title,
        content=post.content,
        author=_sanitize_author(post.author),
        images=[
            ForumPostImageSchema(id=img.id, image_url=img.image_url)
            for img in post.images
        ],
        tags=[ForumTagSchema(id=tag.id, name=tag.name) for tag in post.tags],
        replies=[
            ForumCommentSchema(
                id=comment.id,
                content=comment.content,
                user=_sanitize_comment_user(comment.user),
                created_at=comment.created_at,
                parent_id=comment.parent_id,
            )
            for comment in post.replies
        ],
        created_at=post.created_at,
    )


async def create_forum_post(
    session: AsyncSession, user_id: uuid.UUID, data: ForumPostCreate
) -> ForumPostDetail:
    """Create a new forum post."""
    # Collect tags first before creating the post
    tags_to_add = []
    if data.tags:
        for tag_name in data.tags:
            # Check if tag exists
            tag_res = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = tag_res.scalars().first()
            if not tag:
                tag = Tag(name=tag_name)
                session.add(tag)
                await session.flush()
            tags_to_add.append(tag)

    # Create the post with tags initialized
    post = ForumPost(
        author_id=user_id,
        title=data.title,
        content=data.content,
        tags=tags_to_add,  # Initialize tags directly to avoid lazy loading
    )
    session.add(post)
    await session.flush()

    # Handle images
    if data.images:
        for image_url in data.images:
            image = PostImage(post_id=post.id, image_url=image_url)
            session.add(image)

    await session.commit()
    await session.refresh(post)

    # Return the created post with full details
    result = await get_forum_post(session, post.id)
    if result is None:
        raise RuntimeError("Failed to retrieve created post")
    return result


async def create_forum_reply(
    session: AsyncSession,
    post_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ForumReplyCreate,
) -> ForumCommentSchema:
    """Create a reply to a forum post."""
    # Get the post to update reply_count
    post = await session.get(ForumPost, post_id)
    if not post:
        raise ValueError("Post not found")

    # Verify parent reply exists if provided
    if data.parent_reply_id:
        parent_res = await session.execute(
            select(PostReply).where(
                PostReply.id == data.parent_reply_id,
                PostReply.post_id == post_id,
            )
        )
        parent = parent_res.scalars().first()
        if not parent:
            raise ValueError("Parent reply not found")

    # Create the comment
    comment = PostReply(
        post_id=post_id,
        user_id=user_id,
        content=data.content,
        parent_id=data.parent_reply_id,
    )
    session.add(comment)

    # Increment reply_count on the post
    post.reply_count += 1

    await session.commit()

    # Load user info
    res = await session.execute(
        select(PostReply)
        .options(selectinload(PostReply.user))
        .where(PostReply.id == comment.id)
    )
    comment = res.scalars().first()

    if not comment:
        raise RuntimeError("Failed to retrieve created reply")

    return ForumCommentSchema(
        id=comment.id,
        content=comment.content,
        user=_sanitize_comment_user(comment.user),
        created_at=comment.created_at,
        parent_id=comment.parent_id,
    )


async def update_forum_post(
    session: AsyncSession,
    post_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ForumPostUpdate,
) -> ForumPostDetail:
    """Update a forum post."""
    # Get the post
    res = await session.execute(
        select(ForumPost)
        .options(
            selectinload(ForumPost.author),
            selectinload(ForumPost.tags),
            selectinload(ForumPost.images),
        )
        .where(ForumPost.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise ValueError("Post not found")

    # Check ownership
    if post.author_id != user_id:
        raise PermissionError("You can only edit your own posts")

    # Update basic fields
    if data.title is not None:
        post.title = data.title
    if data.content is not None:
        post.content = data.content

    # Update tags
    if data.tags is not None:
        # Clear existing tags
        post.tags = []
        await session.flush()

        # Add new tags
        tags_to_add = []
        for tag_name in data.tags:
            tag_res = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = tag_res.scalars().first()
            if not tag:
                tag = Tag(name=tag_name)
                session.add(tag)
                await session.flush()
            tags_to_add.append(tag)
        post.tags = tags_to_add

    # Update images
    if data.images is not None:
        # Delete existing images
        await session.execute(select(PostImage).where(PostImage.post_id == post_id))
        for img in post.images:
            await session.delete(img)
        await session.flush()

        # Add new images
        for image_url in data.images:
            image = PostImage(post_id=post.id, image_url=image_url)
            session.add(image)

    await session.commit()

    # Return the updated post
    result = await get_forum_post(session, post.id)
    if result is None:
        raise RuntimeError("Failed to retrieve updated post")
    return result


async def delete_forum_post(
    session: AsyncSession, post_id: uuid.UUID, user_id: uuid.UUID
) -> None:
    """Delete a forum post."""
    # Get the post
    res = await session.execute(
        select(ForumPost)
        .options(selectinload(ForumPost.author))
        .where(ForumPost.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise ValueError("Post not found")

    # Check ownership
    if post.author_id != user_id:
        raise PermissionError("You can only delete your own posts")

    # Delete the post (cascading deletes will handle images and replies)
    await session.delete(post)
    await session.commit()


async def report_forum_post(
    session: AsyncSession,
    post_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ContentReportCreate,
) -> ContentReportResponse:
    """Report a forum post."""
    # Verify post exists
    post = await session.get(ForumPost, post_id)
    if not post:
        raise ValueError("Post not found")

    # Create the report
    report = ContentReport(
        reporter_id=user_id,
        target_type="post",
        target_id=post_id,
        reason=data.reason,
    )
    session.add(report)
    await session.commit()
    await session.refresh(report)

    return ContentReportResponse(
        id=report.id,
        reporter_id=report.reporter_id,
        target_type=report.target_type,
        target_id=report.target_id,
        reason=report.reason,
        created_at=report.created_at,
    )


async def report_forum_reply(
    session: AsyncSession,
    post_id: uuid.UUID,
    reply_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ContentReportCreate,
) -> ContentReportResponse:
    """Report a forum reply."""
    # Verify reply exists and belongs to the post
    res = await session.execute(
        select(PostReply).where(
            PostReply.id == reply_id,
            PostReply.post_id == post_id,
        )
    )
    reply = res.scalars().first()
    if not reply:
        raise ValueError("Reply not found")

    # Create the report
    report = ContentReport(
        reporter_id=user_id,
        target_type="reply",
        target_id=reply_id,
        reason=data.reason,
    )
    session.add(report)
    await session.commit()
    await session.refresh(report)

    return ContentReportResponse(
        id=report.id,
        reporter_id=report.reporter_id,
        target_type=report.target_type,
        target_id=report.target_id,
        reason=report.reason,
        created_at=report.created_at,
    )
