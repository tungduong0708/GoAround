import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUserDep, OptionalCurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    ContentReportCreate,
    ForumCommentSchema,
    ForumPostCreate,
    ForumPostDetail,
    ForumPostListItem,
    ForumPostUpdate,
    ForumReplyCreate,
    ForumReplyUpdate,
    ForumSearchFilter,
    HTTPError,
    Message,
    MetaData,
)
from app.service.forum_service import (
    check_user_liked_post,
    check_user_liked_reply,
    create_forum_post,
    create_forum_reply,
    delete_forum_post,
    delete_forum_reply,
    get_forum_post,
    list_forum_posts,
    report_forum_post,
    report_forum_reply,
    toggle_forum_post_like,
    toggle_reply_like,
    update_forum_post,
    update_forum_reply,
)

router = APIRouter(tags=["forum"], prefix="/forum")


# --- Public Endpoints ---


@router.get(
    "/posts",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[ForumPostListItem]],
)
async def search_forum_posts(
    session: SessionDep,
    current_user: OptionalCurrentUserDep = None,
    filter_params: ForumSearchFilter = Depends(),
) -> Any:
    """
    Search and list forum threads.
    Query Parameters: q, tag, sort, page, limit
    """
    user_id = current_user.id if current_user else None
    results, total = await list_forum_posts(session, filter_params, user_id)

    return APIResponse(
        data=results,
        meta=MetaData(
            page=filter_params.page, limit=filter_params.limit, total_items=total
        ),
    )


@router.get(
    "/posts/{id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[ForumPostDetail],
)
async def get_forum_post_detail(
    session: SessionDep,
    id: uuid.UUID,
    current_user: OptionalCurrentUserDep = None,
) -> Any:
    """
    Get thread details and replies.
    """
    user_id = current_user.id if current_user else None
    post = await get_forum_post(session, id, user_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return APIResponse(data=post)


# --- Protected Endpoints ---


@router.post(
    "/posts",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[ForumPostDetail],
)
async def create_post(
    session: SessionDep,
    current_user: CurrentUserDep,
    data: ForumPostCreate,
) -> Any:
    """
    Create a forum thread.
    """
    post = await create_forum_post(session, current_user.id, data)
    return APIResponse(data=post)


@router.post(
    "/posts/{id}/replies",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[ForumCommentSchema],
)
async def create_reply(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
    data: ForumReplyCreate,
) -> Any:
    """
    Reply to a forum thread.
    """
    try:
        reply = await create_forum_reply(session, id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return APIResponse(data=reply)


@router.put(
    "/posts/{id}",
    response_model=APIResponse[ForumPostDetail],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
        403: {"model": HTTPError},
    },
)
async def update_post(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
    data: ForumPostUpdate,
) -> Any:
    """
    Update a forum post.
    """
    try:
        post = await update_forum_post(session, id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return APIResponse(data=post)


@router.put(
    "/posts/{post_id}/replies/{reply_id}",
    response_model=APIResponse[ForumCommentSchema],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
        403: {"model": HTTPError},
    },
)
async def update_reply(
    session: SessionDep,
    current_user: CurrentUserDep,
    post_id: uuid.UUID,
    reply_id: uuid.UUID,
    data: ForumReplyUpdate,
) -> Any:
    """
    Update a forum reply.
    """
    try:
        reply = await update_forum_reply(
            session, post_id, reply_id, current_user.id, data
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return APIResponse(data=reply)


@router.delete(
    "/posts/{id}",
    response_model=APIResponse[Message],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
        403: {"model": HTTPError},
    },
)
async def delete_post(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
) -> Any:
    """
    Delete a forum post.
    """
    try:
        await delete_forum_post(session, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return APIResponse(data=Message(message="Post deleted successfully"))


@router.delete(
    "/posts/{post_id}/replies/{reply_id}",
    response_model=APIResponse[Message],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
        403: {"model": HTTPError},
    },
)
async def delete_reply(
    session: SessionDep,
    current_user: CurrentUserDep,
    post_id: uuid.UUID,
    reply_id: uuid.UUID,
) -> Any:
    """
    Delete a forum reply.
    """
    try:
        await delete_forum_reply(session, post_id, reply_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return APIResponse(data=Message(message="Reply deleted successfully"))


@router.post(
    "/posts/{id}/like",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
    },
)
async def toggle_post_like(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
) -> Any:
    """
    Toggle like on a forum post. Returns updated like count and like status.
    """
    try:
        result = await toggle_forum_post_like(session, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return APIResponse(data=result)


@router.get(
    "/posts/{id}/like/check",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
    },
)
async def check_post_like_status(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
) -> Any:
    """
    Check if current user has liked a post.
    """
    is_liked = await check_user_liked_post(session, id, current_user.id)
    return APIResponse(data={"is_liked": is_liked})


@router.post(
    "/posts/{post_id}/replies/{reply_id}/like",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
    },
)
async def toggle_reply_like_endpoint(
    session: SessionDep,
    current_user: CurrentUserDep,
    post_id: uuid.UUID,
    reply_id: uuid.UUID,
) -> Any:
    """
    Toggle like on a forum reply. Returns updated like count and like status.
    """
    try:
        result = await toggle_reply_like(session, reply_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return APIResponse(data=result)


@router.get(
    "/posts/{post_id}/replies/{reply_id}/like/check",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": HTTPError},
    },
)
async def check_reply_like_status(
    session: SessionDep,
    current_user: CurrentUserDep,
    post_id: uuid.UUID,
    reply_id: uuid.UUID,
) -> Any:
    """
    Check if current user has liked a reply.
    """
    is_liked = await check_user_liked_reply(session, reply_id, current_user.id)
    return APIResponse(data={"is_liked": is_liked})


@router.post(
    "/posts/{id}/report",
    response_model=APIResponse[Message],
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"model": HTTPError},
    },
)
async def report_post(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
    data: ContentReportCreate,
) -> Any:
    """
    Report a forum post for moderation.
    """
    try:
        await report_forum_post(session, id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return APIResponse(data=Message(message="Post reported successfully"))


@router.post(
    "/posts/{post_id}/replies/{reply_id}/report",
    response_model=APIResponse[Message],
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"model": HTTPError},
    },
)
async def report_reply(
    session: SessionDep,
    current_user: CurrentUserDep,
    post_id: uuid.UUID,
    reply_id: uuid.UUID,
    data: ContentReportCreate,
) -> Any:
    """
    Report a forum reply for moderation.
    """
    try:
        await report_forum_reply(session, post_id, reply_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return APIResponse(data=Message(message="Reply reported successfully"))
