import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException

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


@router.get("/posts", response_model=APIResponse[List[ForumPostListItem]])
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
        status="success",
        data=results,
        meta=MetaData(
            page=filter_params.page, limit=filter_params.limit, total_items=total
        ),
    )


@router.get("/posts/{id}", response_model=APIResponse[ForumPostDetail])
async def get_forum_post_detail(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get thread details and replies.
    """
    post = await get_forum_post(session, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return APIResponse(status="success", data=post)


# --- Protected Endpoints ---


@router.post("/posts", response_model=APIResponse[ForumPostDetail], status_code=201)
async def create_post(
    session: SessionDep,
    current_user: CurrentUserDep,
    data: ForumPostCreate,
) -> Any:
    """
    Create a forum thread.
    """
    post = await create_forum_post(session, current_user.id, data)
    return APIResponse(status="success", data=post)


@router.post(
    "/posts/{id}/replies", response_model=APIResponse[ForumCommentSchema], status_code=201
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

    return APIResponse(status="success", data=reply)
