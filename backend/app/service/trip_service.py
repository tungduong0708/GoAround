"""Trip and itinerary CRUD operations."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

from app.models import Place, Tag, Trip, TripStop, Hotel, Restaurant, Cafe, Landmark
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
    # Use with_polymorphic to eagerly load subclass attributes
    poly_place = with_polymorphic(Place, [Hotel, Restaurant, Cafe, Landmark])

    res = await session.execute(
        select(Trip)
        .options(
            selectinload(Trip.stops)
            .selectinload(TripStop.place.of_type(poly_place))
            .selectinload(poly_place.tags),
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
        public=trip_obj.public,
        tags=[t.name for t in trip_obj.tags] if trip_obj.tags else [],
        stops=stops,
    )


async def list_trips(
    session: AsyncSession,
    user_id: uuid.UUID,
    page: int,
    limit: int,
    public_only: bool = False,
) -> tuple[list[TripListSchema], int]:
    """List all trips for a user with pagination."""
    base_query = select(Trip.id).where(Trip.user_id == user_id)
    if public_only:
        base_query = base_query.where(Trip.public)
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
    if public_only:
        stmt = stmt.where(Trip.public)
    res = await session.execute(stmt)
    data = [
        TripListSchema(
            id=trip.id,
            trip_name=trip.trip_name,
            start_date=trip.start_date,
            end_date=trip.end_date,
            public=trip.public,
            stop_count=int(stop_count or 0),
        )
        for trip, stop_count in res.all()
    ]
    return data, total


async def create_trip(
    session: AsyncSession, user_id: uuid.UUID, data: TripCreate
) -> TripSchema:
    """Create a new trip for a user."""
    # Validate dates
    if data.start_date and data.end_date and data.end_date < data.start_date:
        raise ValueError("End date cannot be before start date")

    trip = Trip(
        user_id=user_id,
        trip_name=data.trip_name,
        start_date=data.start_date,
        end_date=data.end_date,
        public=data.public,
        tags=[],  # Initialize tags list to avoid lazy load
    )
    session.add(trip)
    await session.flush()
    if data.tags:
        for tag_name in data.tags:
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalars().first()
            if not tag:
                try:
                    tag = Tag(name=tag_name)
                    session.add(tag)
                    await session.flush()
                except Exception:
                    # Tag may have been created by concurrent request
                    await session.rollback()
                    result = await session.execute(
                        select(Tag).where(Tag.name == tag_name)
                    )
                    tag = result.scalars().first()
                    if not tag:
                        raise ValueError(f"Failed to create or find tag: {tag_name}")
            trip.tags.append(tag)

    if data.stops:
        for i, stop_data in enumerate(data.stops):
            # If stop_order is not provided, use 1-based index
            order = (
                stop_data.stop_order if stop_data.stop_order is not None else (i + 1)
            )
            trip_stop = TripStop(
                trip_id=trip.id,
                place_id=stop_data.place_id,
                stop_order=order,
                arrival_time=stop_data.arrival_time,
                notes=stop_data.notes,
            )
            session.add(trip_stop)

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
        raise PermissionError("Not authorized to update this trip")
    upd = data.model_dump(exclude_unset=True)

    # Validate dates if both are being updated
    start_date = upd.get("start_date", trip.start_date)
    end_date = upd.get("end_date", trip.end_date)
    if start_date and end_date and end_date < start_date:
        raise ValueError("End date cannot be before start date")

    tags = upd.pop("tags", None)
    stops_data = upd.pop("stops", None)

    for k, v in upd.items():
        setattr(trip, k, v)

    if tags is not None:
        trip.tags.clear()
        for tag_name in tags:
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalars().first()
            if not tag:
                try:
                    tag = Tag(name=tag_name)
                    session.add(tag)
                    await session.flush()
                except Exception:
                    # Tag may have been created by concurrent request
                    await session.rollback()
                    result = await session.execute(
                        select(Tag).where(Tag.name == tag_name)
                    )
                    tag = result.scalars().first()
                    if not tag:
                        raise ValueError(f"Failed to create or find tag: {tag_name}")
            trip.tags.append(tag)

    # Handle stops updates
    if stops_data is not None:
        # Remove all existing stops
        await session.execute(select(TripStop).where(TripStop.trip_id == trip_id))
        for stop in trip.stops:
            await session.delete(stop)
        await session.flush()

        # Add new stops
        for i, stop_data in enumerate(stops_data):
            # Validate place exists
            place = await session.get(Place, stop_data.place_id)
            if not place:
                raise ValueError(f"Place {stop_data.place_id} not found")

            # If stop_order is not provided, use 1-based index
            order = (
                stop_data.stop_order if stop_data.stop_order is not None else (i + 1)
            )
            trip_stop = TripStop(
                trip_id=trip.id,
                place_id=stop_data.place_id,
                stop_order=order,
                arrival_time=stop_data.arrival_time,
                notes=stop_data.notes,
            )
            session.add(trip_stop)

    await session.commit()
    await session.refresh(trip)
    return await _load_trip_detail(session, trip)


async def _insert_stop_at_order(
    session: AsyncSession, trip_id: uuid.UUID, desired_order: int
) -> int:
    """Helper to shift existing stops to make room at desired order position.

    Note: This operation has race condition risk. Consider using SELECT FOR UPDATE
    or implementing optimistic locking if concurrent stop modifications are common.
    """
    # Load and update stops using ORM to maintain event tracking
    result = await session.execute(
        select(TripStop)
        .where(TripStop.trip_id == trip_id, TripStop.stop_order >= desired_order)
        .order_by(TripStop.stop_order.desc())  # Reverse order to avoid conflicts
    )
    stops = result.scalars().all()
    for stop in stops:
        stop.stop_order += 1
    await session.flush()  # Ensure changes are visible
    return desired_order


async def add_trip_stop(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, data: TripStopCreate
) -> TripStopSchema:
    """Add a stop to a trip."""
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise ValueError("Trip not found")
    if trip.user_id != user_id:
        raise PermissionError("Not authorized to modify this trip")
    place = await session.get(Place, data.place_id)
    if not place:
        raise ValueError("Place not found")

    # Validate stop_order if provided
    if data.stop_order is not None and data.stop_order < 1:
        raise ValueError("Stop order must be a positive integer")

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
        raise PermissionError("Not authorized to modify this trip stop")

    upd = data.model_dump(exclude_unset=True)
    new_order = upd.pop("order_index", None)

    # Validate new_order if provided
    if new_order is not None and new_order < 1:
        raise ValueError("Stop order must be a positive integer")

    if new_order is not None and new_order != stop.stop_order:
        if new_order < stop.stop_order:
            # Load and update stops using ORM
            result = await session.execute(
                select(TripStop)
                .where(
                    TripStop.trip_id == trip_id,
                    TripStop.stop_order >= new_order,
                    TripStop.stop_order < stop.stop_order,
                )
                .order_by(TripStop.stop_order.desc())
            )
            stops = result.scalars().all()
            for s in stops:
                s.stop_order += 1
        else:
            # Load and update stops using ORM
            result = await session.execute(
                select(TripStop)
                .where(
                    TripStop.trip_id == trip_id,
                    TripStop.stop_order <= new_order,
                    TripStop.stop_order > stop.stop_order,
                )
                .order_by(TripStop.stop_order.asc())
            )
            stops = result.scalars().all()
            for s in stops:
                s.stop_order -= 1
        await session.flush()  # Ensure order changes are visible
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
        raise ValueError("Stop not found")
    trip = await session.get(Trip, stop.trip_id)
    if not trip or trip.user_id != user_id or trip.id != trip_id:
        raise PermissionError("Not authorized to modify this trip")
    removed_order = stop.stop_order
    await session.delete(stop)
    await session.flush()
    # Reorder remaining stops using ORM
    result = await session.execute(
        select(TripStop)
        .where(TripStop.trip_id == trip_id, TripStop.stop_order > removed_order)
        .order_by(TripStop.stop_order.asc())
    )
    stops = result.scalars().all()
    for s in stops:
        s.stop_order -= 1
    await session.commit()


async def delete_trip(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID
) -> None:
    """Delete a trip."""
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise ValueError("Trip not found")
    if trip.user_id != user_id:
        raise PermissionError("Not authorized to delete this trip")

    try:
        await session.delete(trip)
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise ValueError(f"Failed to delete trip: {str(e)}")
