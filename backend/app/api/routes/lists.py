import uuid

from fastapi import APIRouter, HTTPException, status

from app import crud
from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    HTTPError,
    Message,
    MetaData,
    SavedListCreate,
    SavedListDetailSchema,
    SavedListSchema,
    SavedListUpdate,
)

router = APIRouter(tags=["lists"], prefix="/lists")


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[SavedListSchema]],
)
async def list_lists(
    session: SessionDep,
    current_user: CurrentUserDep,
    page: int = 1,
    limit: int = 20,
):
    lists, total = await crud.list_saved_lists(session, current_user.id, page, limit)
    return APIResponse(
        data=lists,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get(
    "/{list_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[SavedListDetailSchema],
    responses={
        404: {"model": HTTPError},
    },
)
async def get_list(
    session: SessionDep, current_user: CurrentUserDep, list_id: uuid.UUID
):
    try:
        detail = await crud.get_saved_list(session, current_user.id, list_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    item_count = len(detail.items)
    return APIResponse(
        data=detail,
        meta=MetaData(page=1, limit=item_count or 1, total_items=item_count),
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[SavedListSchema],
)
async def create_list(
    session: SessionDep, current_user: CurrentUserDep, body: SavedListCreate
):
    sl = await crud.create_saved_list(session, current_user.id, body)
    return APIResponse(data=sl)


@router.put(
    "/{list_id}",
    response_model=APIResponse[SavedListDetailSchema],
    status_code=501,
    responses={
        404: {"model": HTTPError},
        501: {"model": HTTPError},
    },
)
async def update_list(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
    body: SavedListUpdate,
):
    """
    Update a saved list (name and/or places).
    """
    raise HTTPException(
        status_code=501,
        detail="Update list endpoint not yet implemented",
    )


@router.delete(
    "/{list_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[Message],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def delete_list(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
):
    """
    Delete a saved list.
    """
    try:
        await crud.delete_saved_list(session, current_user.id, list_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=Message(message="List deleted successfully"))
