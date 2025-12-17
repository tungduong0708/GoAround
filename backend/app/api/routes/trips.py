import uuid

from fastapi import APIRouter, HTTPException, status

from app import services
from app.api.deps import CurrentUser, SessionDep
from app.schemas import (
    APIResponse,
    Message,
    MetaData,
    TripCreate,
    TripSchema,
    TripUpdate,
    TripStopCreate,
    TripStopSchema,
    TripStopUpdate,
    TripListSchema,
)

router = APIRouter(tags=["trips"], prefix="/trips")


@router.get("", response_model=APIResponse[list[TripListSchema]])
async def list_trips(
    session: SessionDep,
    current_user: CurrentUser,
    page: int = 1,
    limit: int = 20,
):
    trips, total = await services.list_trips(session, current_user.id, page, limit)
    return APIResponse(
        status="success",
        data=trips,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get("/{trip_id}", response_model=APIResponse[TripSchema])
async def get_trip(session: SessionDep, current_user: CurrentUser, trip_id: uuid.UUID):
    try:
        trip = await services.get_trip(session, current_user.id, trip_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(status="success", data=trip)


@router.post("", response_model=APIResponse[TripSchema], status_code=201)
async def create_trip(session: SessionDep, current_user: CurrentUser, body: TripCreate):
    trip = await services.create_trip(session, current_user.id, body)
    return APIResponse(status="success", data=trip)


@router.post("/generate", response_model=APIResponse[Message], status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def generate_trip():
    # Placeholder for future AI itinerary generation
    return APIResponse(status="error", data=Message(message="Trip generation not implemented yet."))


@router.put("/{trip_id}", response_model=APIResponse[TripSchema])
async def update_trip(
    session: SessionDep, current_user: CurrentUser, trip_id: uuid.UUID, body: TripUpdate
):
    try:
        trip = await services.update_trip(session, current_user.id, trip_id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(status="success", data=trip)


@router.post(
    "/{trip_id}/places",
    response_model=APIResponse[TripStopSchema],
    status_code=201,
)
async def add_stop(
    session: SessionDep, current_user: CurrentUser, trip_id: uuid.UUID, body: TripStopCreate
):
    try:
        stop = await services.add_trip_stop(session, current_user.id, trip_id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(status="success", data=stop)


@router.put(
    "/{trip_id}/places/{stop_id}", response_model=APIResponse[TripStopSchema]
)
async def update_stop(
    session: SessionDep, current_user: CurrentUser, trip_id: uuid.UUID, stop_id: uuid.UUID, body: TripStopUpdate
):
    try:
        stop = await services.update_trip_stop(session, current_user.id, trip_id, stop_id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(status="success", data=stop)


@router.delete(
    "/{trip_id}/places/{stop_id}", response_model=APIResponse[Message]
)
async def remove_stop(session: SessionDep, current_user: CurrentUser, trip_id: uuid.UUID, stop_id: uuid.UUID):
    try:
        await services.remove_trip_stop(session, current_user.id, trip_id, stop_id)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(status="success", data=Message(message="Stop removed."))
