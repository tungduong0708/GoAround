"""Trip and itinerary CRUD operations."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Place, Tag, Trip, TripStop
from app.schemas import (
    TripCreate,
    TripListSchema,
    TripSchema,
    TripStopCreate,
    TripStopSchema,
    TripStopUpdate,
    TripStopWithPlace,
    TripUpdate,
)
from app.service.place_service import _enrich_place_public


async def _load_trip_detail(session: AsyncSession, trip: Trip) -> TripSchema:
    """Load trip with all its details including stops and places."""
    res = await session.execute(
        select(Trip)
        .options(
            selectinload(Trip.stops)
            .selectinload(TripStop.place)
            .selectinload(Place.tags),
            selectinload(Trip.tags),
        )
        .where(Trip.id == trip.id)
    )
    trip_obj = res.scalars().first()
    if not trip_obj:
        raise ValueError("Trip not found")

    stops = []
    for stop in sorted(trip_obj.stops, key=lambda s: s.stop_order or 0):
        stops.append(
            TripStopWithPlace(
                id=stop.id,
                trip_id=stop.trip_id,
                stop_order=stop.stop_order,
                arrival_time=stop.arrival_time,
                notes=stop.notes,
                place=_enrich_place_public(stop.place) if stop.place else None,
            )
        )
    return TripSchema(
        id=trip_obj.id,
        trip_name=trip_obj.trip_name,
        start_date=trip_obj.start_date,
        end_date=trip_obj.end_date,
        tags=[t.name for t in trip_obj.tags] if trip_obj.tags else [],
        stops=stops,
    )


async def list_trips(
    session: AsyncSession, user_id: uuid.UUID, page: int, limit: int
) -> tuple[list[TripListSchema], int]:
    """List all trips for a user with pagination."""
    base_query = select(Trip.id).where(Trip.user_id == user_id)
    total_res = await session.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = int(total_res.scalar() or 0)

    stmt = (
        select(Trip, func.count(TripStop.id).label("stop_count"))
        .outerjoin(TripStop, Trip.id == TripStop.trip_id)
        .where(Trip.user_id == user_id)
        .group_by(Trip.id)
        .order_by(Trip.start_date.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    res = await session.execute(stmt)
    data = [
        TripListSchema(
            id=trip.id,
            trip_name=trip.trip_name,
            start_date=trip.start_date,
            end_date=trip.end_date,
            stop_count=int(stop_count or 0),
        )
        for trip, stop_count in res.all()
    ]
    return data, total


async def create_trip(
    session: AsyncSession, user_id: uuid.UUID, data: TripCreate
) -> TripSchema:
    """Create a new trip for a user."""
    trip = Trip(
        user_id=user_id,
        trip_name=data.trip_name,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    session.add(trip)
    await session.flush()
    if data.tags:
        for tag_name in data.tags:
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalars().first()
            if not tag:
                tag = Tag(name=tag_name)
                session.add(tag)
                await session.flush()
            trip.tags.append(tag)
    await session.commit()
    await session.refresh(trip)
    return await _load_trip_detail(session, trip)


async def get_trip(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID
) -> TripSchema:
    """Get a specific trip by ID."""
    trip = await session.get(Trip, trip_id)
    if not trip or trip.user_id != user_id:
        raise ValueError("Trip not found")
    return await _load_trip_detail(session, trip)


async def update_trip(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, data: TripUpdate
) -> TripSchema:
    """Update an existing trip."""
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise ValueError("Trip not found")
    if trip.user_id != user_id:
        raise PermissionError("Not allowed")
    upd = data.model_dump(exclude_unset=True)
    tags = upd.pop("tags", None)
    for k, v in upd.items():
        setattr(trip, k, v)
    if tags is not None:
        trip.tags = []
        for tag_name in tags:
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalars().first()
            if not tag:
                tag = Tag(name=tag_name)
                session.add(tag)
                await session.flush()
            trip.tags.append(tag)
    await session.commit()
    await session.refresh(trip)
    return await _load_trip_detail(session, trip)


async def _insert_stop_at_order(
    session: AsyncSession, trip_id: uuid.UUID, desired_order: int
) -> int:
    """Helper to shift existing stops to make room at desired order position."""
    await session.execute(
        TripStop.__table__.update()
        .where(TripStop.trip_id == trip_id, TripStop.stop_order >= desired_order)
        .values(stop_order=TripStop.stop_order + 1)
    )
    return desired_order


async def add_trip_stop(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, data: TripStopCreate
) -> TripStopSchema:
    """Add a stop to a trip."""
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise ValueError("Trip not found")
    if trip.user_id != user_id:
        raise PermissionError("Not allowed")
    place = await session.get(Place, data.place_id)
    if not place:
        raise ValueError("Place not found")

    if data.stop_order is None:
        current_max_res = await session.execute(
            select(func.max(TripStop.stop_order)).where(TripStop.trip_id == trip_id)
        )
        next_order = (current_max_res.scalar() or 0) + 1
    else:
        next_order = await _insert_stop_at_order(session, trip_id, data.stop_order)

    stop = TripStop(
        trip_id=trip_id,
        place_id=data.place_id,
        stop_order=next_order,
        arrival_time=data.arrival_time,
        notes=data.notes,
    )
    session.add(stop)
    await session.commit()
    await session.refresh(stop)
    return TripStopSchema.model_validate(stop)


async def update_trip_stop(
    session: AsyncSession,
    user_id: uuid.UUID,
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    data: TripStopUpdate,
) -> TripStopSchema:
    """Update an existing trip stop."""
    stop = await session.get(TripStop, stop_id)
    if not stop:
        raise ValueError("Stop not found")
    trip = await session.get(Trip, stop.trip_id)
    if not trip or trip.user_id != user_id or trip.id != trip_id:
        raise PermissionError("Not allowed")

    upd = data.model_dump(exclude_unset=True)
    new_order = upd.pop("order_index", None)

    if new_order is not None and new_order != stop.stop_order:
        if new_order < stop.stop_order:
            await session.execute(
                TripStop.__table__.update()
                .where(
                    TripStop.trip_id == trip_id,
                    TripStop.stop_order >= new_order,
                    TripStop.stop_order < stop.stop_order,
                )
                .values(stop_order=TripStop.stop_order + 1)
            )
        else:
            await session.execute(
                TripStop.__table__.update()
                .where(
                    TripStop.trip_id == trip_id,
                    TripStop.stop_order <= new_order,
                    TripStop.stop_order > stop.stop_order,
                )
                .values(stop_order=TripStop.stop_order - 1)
            )
        stop.stop_order = new_order

    for k, v in upd.items():
        setattr(stop, k, v)

    await session.commit()
    await session.refresh(stop)
    return TripStopSchema.model_validate(stop)


async def remove_trip_stop(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, stop_id: uuid.UUID
) -> None:
    """Remove a stop from a trip."""
    stop = await session.get(TripStop, stop_id)
    if not stop:
        return
    trip = await session.get(Trip, stop.trip_id)
    if not trip or trip.user_id != user_id or trip.id != trip_id:
        raise PermissionError("Not allowed")
    removed_order = stop.stop_order
    await session.delete(stop)
    await session.execute(
        TripStop.__table__.update()
        .where(TripStop.trip_id == trip_id, TripStop.stop_order > removed_order)
        .values(stop_order=TripStop.stop_order - 1)
    )
    await session.commit()
