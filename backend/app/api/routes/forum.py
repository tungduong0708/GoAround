import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    ForumCommentSchema,
    ForumPostCreate,
    ForumPostDetail,
    ForumPostListItem,
    ForumReplyCreate,
    ForumSearchFilter,
    MetaData,
)
from app.service.forum_service import (
    create_forum_post,
    create_forum_reply,
    get_forum_post,
    list_forum_posts,
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
    filter_params: ForumSearchFilter = Depends(),
) -> Any:
    """
    Search and list forum threads.
    Query Parameters: q, tag, sort, page, limit
    """
    results, total = await list_forum_posts(session, filter_params)

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
async def get_forum_post_detail(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get thread details and replies.
    """
    post = await get_forum_post(session, id)
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
