import uuid

from fastapi import APIRouter, HTTPException, status

from app import crud
from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    AddPlaceToListRequest,
    APIResponse,
    HTTPError,
    Message,
    MetaData,
    SavedListCreate,
    SavedListDetailSchema,
    SavedListItemSchema,
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
    status_code=status.HTTP_200_OK,
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
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
    try:
        updated_list = await crud.update_saved_list(
            session, current_user.id, list_id, body
        )
        return APIResponse(data=updated_list)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.patch(
    "/{list_id}/name",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[SavedListSchema],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def rename_list(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
    body: SavedListCreate,
):
    """
    Rename a saved list.
    """
    try:
        updated_list = await crud.update_saved_list(
            session, current_user.id, list_id, SavedListUpdate(name=body.name)
        )
        return APIResponse(data=SavedListSchema(
            id=updated_list.id,
            name=updated_list.name,
            created_at=updated_list.created_at,
            item_count=len(updated_list.items) if updated_list.items else 0,
        ))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.post(
    "/{list_id}/places",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[SavedListItemSchema],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def add_place_to_list_endpoint(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
    body: AddPlaceToListRequest,
):
    """
    Add a place to a saved list.
    """
    try:
        item = await crud.add_place_to_list(
            session, list_id, current_user.id, body
        )
        return APIResponse(data=item)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.delete(
    "/{list_id}/places/{place_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[Message],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def remove_place_from_list_endpoint(
    session: SessionDep,
    current_user: CurrentUserDep,
    list_id: uuid.UUID,
    place_id: uuid.UUID,
):
    """
    Remove a place from a saved list.
    """
    try:
        await crud.remove_place_from_list(
            session, list_id, current_user.id, place_id
        )
        return APIResponse(data=Message(message="Place removed from list"))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")


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
