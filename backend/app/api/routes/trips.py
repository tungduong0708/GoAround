import uuid

from fastapi import APIRouter, HTTPException, status

from app import crud
from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    HTTPError,
    Message,
    MetaData,
    TripCreate,
    TripListSchema,
    TripSchema,
    TripStopCreate,
    TripStopSchema,
    TripStopUpdate,
    TripUpdate,
)

router = APIRouter(tags=["trips"], prefix="/trips")


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[TripListSchema]],
)
async def list_trips(
    session: SessionDep,
    current_user: CurrentUserDep,
    page: int = 1,
    limit: int = 20,
):
    trips, total = await crud.list_trips(session, current_user.id, page, limit)
    return APIResponse(
        data=trips,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get(
    "/{trip_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[TripSchema],
    responses={
        404: {"model": HTTPError},
    },
)
async def get_trip(
    session: SessionDep, current_user: CurrentUserDep, trip_id: uuid.UUID
):
    try:
        trip = await crud.get_trip(session, current_user.id, trip_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(data=trip)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[TripSchema],
)
async def create_trip(
    session: SessionDep, current_user: CurrentUserDep, body: TripCreate
):
    trip = await crud.create_trip(session, current_user.id, body)
    return APIResponse(data=trip)


@router.post(
    "/generate",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    response_model=APIResponse[Message],
)
async def generate_trip():
    # Placeholder for future AI itinerary generation
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.put(
    "/{trip_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[TripSchema],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def update_trip(
    session: SessionDep,
    current_user: CurrentUserDep,
    trip_id: uuid.UUID,
    body: TripUpdate,
):
    try:
        trip = await crud.update_trip(session, current_user.id, trip_id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=trip)


@router.post(
    "/{trip_id}/places",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[TripStopSchema],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def add_stop(
    session: SessionDep,
    current_user: CurrentUserDep,
    trip_id: uuid.UUID,
    body: TripStopCreate,
):
    try:
        stop = await crud.add_trip_stop(session, current_user.id, trip_id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=stop)


@router.put(
    "/{trip_id}/places/{stop_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[TripStopSchema],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def update_stop(
    session: SessionDep,
    current_user: CurrentUserDep,
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    body: TripStopUpdate,
):
    try:
        stop = await crud.update_trip_stop(
            session, current_user.id, trip_id, stop_id, body
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=stop)


@router.delete(
    "/{trip_id}/places/{stop_id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[Message],
    responses={
        403: {"model": HTTPError},
    },
)
async def remove_stop(
    session: SessionDep,
    current_user: CurrentUserDep,
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
):
    try:
        await crud.remove_trip_stop(session, current_user.id, trip_id, stop_id)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=Message(message="Stop removed."))
