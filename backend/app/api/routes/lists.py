import uuid

from fastapi import APIRouter, Depends, HTTPException

from app import services
from app.api.deps import CurrentUser, SessionDep
from app.schemas import (
    APIResponse,
    Message,
    SavedListCreate,
    SavedListSchema,
    AddPlaceToListRequest,
    SavedListDetailSchema,
    MetaData,
)

router = APIRouter(tags=["lists"], prefix="/lists")


@router.get("", response_model=APIResponse[list[SavedListSchema]])
async def list_lists(
    session: SessionDep,
    current_user: CurrentUser,
    page: int = 1,
    limit: int = 20,
):
    lists, total = await services.list_saved_lists(session, current_user.id, page, limit)
    return APIResponse(
        status="success",
        data=lists,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get("/{list_id}", response_model=APIResponse[SavedListDetailSchema])
async def get_list(
    session: SessionDep, current_user: CurrentUser, list_id: uuid.UUID
):
    try:
        detail = await services.get_saved_list(session, current_user.id, list_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    item_count = len(detail.items)
    return APIResponse(
        status="success",
        data=detail,
        meta=MetaData(page=1, limit=item_count or 1, total_items=item_count),
    )


@router.post("", response_model=APIResponse[SavedListSchema], status_code=201)
async def create_list(
    session: SessionDep, current_user: CurrentUser, body: SavedListCreate
):
    sl = await services.create_saved_list(session, current_user.id, body)
    return APIResponse(status="success", data=sl)


@router.post(
    "/{list_id}/places",
    response_model=APIResponse[Message],
    status_code=201,
)
async def add_place(
    session: SessionDep,
    current_user: CurrentUser,
    list_id: uuid.UUID,
    body: AddPlaceToListRequest,
):
    try:
        await services.add_place_to_list(session, list_id, current_user.id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(status="success", data=Message(message="Place added to list."))


@router.delete(
    "/{list_id}/places/{place_id}", response_model=APIResponse[Message]
)
async def remove_place(
    session: SessionDep, current_user: CurrentUser, list_id: uuid.UUID, place_id: uuid.UUID
):
    try:
        await services.remove_place_from_list(session, list_id, current_user.id, place_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(status="success", data=Message(message="Place removed from list."))
