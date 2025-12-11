import uuid
from typing import Sequence

from geoalchemy2 import Geography
from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from shapely.geometry import Point
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    SavedList,
    SavedListItem,
    Review,
    ReviewImage,
    Trip,
    TripStop,
    Cafe,
    Hotel,
    Landmark,
    Place,
    PlaceImage,
    Profile,
    Restaurant,
    Tag,
    auth_users,
)
from app.schemas import (
    LocationSchema,
    OwnerSchema,
    PlaceCreate,
    PlaceDetail,
    PlaceImageSchema,
    PlacePublic,
    PlaceSearchFilter,
    PlaceUpdate,
    ReviewerSchema,
    ReviewCreate,
    ReviewUpdate,
    ReviewSchema,
    ReviewImageSchema,
    SavedListCreate,
    SavedListSchema,
    SavedListItemSchema,
    SavedListDetailSchema,
    SavedListItemWithPlace,
    AddPlaceToListRequest,
    TripCreate,
    TripUpdate,
    TripSchema,
    TripListSchema,
    TripStopCreate,
    TripStopUpdate,
    TripStopSchema,
    TripStopWithPlace,
)

# --- Helpers: Enrichment ---


def _enrich_place_public(place: Place) -> PlacePublic:
    """
    Maps SQLAlchemy Place (polymorphic) to PlacePublic schema.
    """
    # 1. Parse Geometry
    lat, lng = 0.0, 0.0
    if place.location is not None and isinstance(place.location, WKBElement):
        try:
            point = to_shape(place.location)
            if isinstance(point, Point):
                lat, lng = point.y, point.x
        except Exception:
            pass

    # 2. Extract Tags (list of strings)
    # Ensure tags are loaded via selectinload in the query
    tag_names = [t.name for t in place.tags] if place.tags else []

    # 3. Polymorphic Data Extraction (Best Effort mapping to Schema)

    return PlacePublic(
        id=place.id,
        name=place.name,
        place_type=place.place_type,
        address=place.address,
        city=place.city,
        country=place.country,
        location=LocationSchema(lat=lat, lng=lng),
        average_rating=float(place.average_rating or 0.0),
        review_count=place.review_count or 0,
        main_image_url=place.main_image_url,
        tags=tag_names,
    )


def _enrich_place_detail(place: Place) -> PlaceDetail:
    """
    Maps SQLAlchemy Place to PlaceDetail schema, including subclass specific fields.
    """
    public_view = _enrich_place_public(place)

    # 1. Relations
    # Ensure images are loaded via selectinload
    images_list = [PlaceImageSchema.model_validate(img) for img in place.images]

    owner_data = None
    if place.owner:
        owner_data = OwnerSchema.model_validate(place.owner)

    # 2. Subclass specific attributes using getattr to handle polymorphism safely
    description = getattr(place, "description", None)
    opening_hours = getattr(place, "opening_hours", None)
    price_range = getattr(place, "price_range", None)
    hotel_class = getattr(place, "hotel_class", None)
    price_per_night = getattr(place, "price_per_night", None)
    amenities = getattr(place, "amenities", None)
    cuisine_type = getattr(place, "cuisine_type", None)
    ticket_price = getattr(place, "ticket_price", None)
    coffee_specialties = getattr(place, "coffee_specialties", None)

    return PlaceDetail(
        **public_view.model_dump(),
        images=images_list,
        owner=owner_data,
        description=description,
        opening_hours=opening_hours,
        price_range=price_range,
        hotel_class=int(hotel_class) if hotel_class is not None else None,
        price_per_night=float(price_per_night) if price_per_night is not None else None,
        amenities=amenities,
        cuisine_type=cuisine_type,
        ticket_price=float(ticket_price) if ticket_price is not None else None,
        coffee_specialties=coffee_specialties,
        my_review=None,
    )


# --- Place Operations ---


async def create_place(
    session: AsyncSession, place_create: PlaceCreate, owner_id: uuid.UUID
) -> PlaceDetail:
    """
    Creates a new place, selecting the correct Polymorphic Identity (Hotel, Restaurant, Landmark, Cafe).
    """
    # 1. Location WKT
    loc = place_create.location
    location_wkt = f"POINT({loc.lng} {loc.lat})"

    # 2. Determine Model Class & Common Data
    common_data = {
        "owner_id": owner_id,
        "name": place_create.name,
        "address": place_create.address,
        "city": place_create.city,
        "country": place_create.country,
        "location": location_wkt,
        "place_type": place_create.place_type,
        "main_image_url": place_create.main_image_url,
        "description": place_create.description,
        "opening_hours": place_create.opening_hours,
    }

    # 3. Instantiate Specific Model
    db_place = None

    if place_create.place_type == "hotel":
        db_place = Hotel(
            **common_data,
            hotel_class=place_create.hotel_class,
            price_per_night=place_create.price_per_night,
            amenities=place_create.amenities,
        )
    elif place_create.place_type == "restaurant":
        db_place = Restaurant(
            **common_data,
            cuisine_type=place_create.cuisine_type,
            price_range=place_create.price_range,
        )
    elif place_create.place_type == "landmark":
        db_place = Landmark(
            **common_data,
            ticket_price=place_create.ticket_price,
        )
    elif place_create.place_type == "cafe":
        db_place = Cafe(
            **common_data,
            coffee_specialties=place_create.coffee_specialties,
            amenities=place_create.amenities,
            price_range=place_create.price_range,
        )
    else:
        # Fallback to generic Place
        db_place = Place(**common_data)

    session.add(db_place)
    await session.flush()

    # 4. Handle Images (Create PlaceImage rows)
    if place_create.images:
        for i, url in enumerate(place_create.images):
            # Set main_image_url on Place if it's the first one
            if i == 0:
                db_place.main_image_url = url

            img = PlaceImage(
                place_id=db_place.id, image_url=url, caption=place_create.name
            )
            session.add(img)

    # 5. Handle Tags
    if place_create.tags:
        for tag_name in place_create.tags:
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalars().first()
            if not tag:
                tag = Tag(name=tag_name)
                session.add(tag)
                await session.flush()
            db_place.tags.append(tag)

    await session.commit()
    # We return via get_place to ensure relationships are loaded properly
    return await get_place(session, db_place.id)  # type: ignore


async def get_place(session: AsyncSession, place_id: uuid.UUID) -> PlaceDetail | None:
    """
    Get place by ID with eager loading.
    """
    stmt = (
        select(Place)
        .options(
            selectinload(Place.images),
            selectinload(Place.tags),
            selectinload(Place.owner),
            # Polymorphic loading usually handled automatically by SQLAlchemy if configured correctly
        )
        .where(Place.id == place_id)
    )
    result = await session.execute(stmt)
    place = result.scalars().first()
    if not place:
        return None
    return _enrich_place_detail(place)


async def update_place(
    session: AsyncSession, db_place: Place, place_update: PlaceUpdate
) -> PlaceDetail:
    """
    Update place.
    """
    update_data = place_update.model_dump(exclude_unset=True)

    # 1. Geo Update
    if "location" in update_data and update_data["location"]:
        loc_data = update_data["location"]
        lng = loc_data.lng
        lat = loc_data.lat
        db_place.location = f"POINT({lng} {lat})"
        del update_data["location"]

    # 2. Field Updates
    # We iterate and set attributes if they exist on the specific instance (handling polymorphism)
    for key, value in update_data.items():
        if key == "images" or key == "tags":
            continue
        if hasattr(db_place, key):
            setattr(db_place, key, value)

    # 3. Images (Full Replace strategy)
    if "images" in update_data and update_data["images"] is not None:
        # Clear old
        for img in db_place.images:
            await session.delete(img)
        # Add new
        new_urls = update_data["images"]
        if new_urls:
            db_place.main_image_url = new_urls[0]  # Update main image
            for url in new_urls:
                session.add(PlaceImage(place_id=db_place.id, image_url=url))
        else:
            db_place.main_image_url = None

    # 4. Tags (Full Replace)
    if "tags" in update_data and update_data["tags"] is not None:
        db_place.tags = []
        for tag_name in update_data["tags"]:
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalars().first()
            if not tag:
                tag = Tag(name=tag_name)
                session.add(tag)
                await session.flush()
            db_place.tags.append(tag)

    await session.commit()
    await session.refresh(db_place)
    return await get_place(session, db_place.id)  # type: ignore


async def delete_place(session: AsyncSession, db_place: Place) -> None:
    await session.delete(db_place)
    await session.commit()


async def get_places_by_owner(
    session: AsyncSession, owner_id: uuid.UUID
) -> Sequence[PlacePublic]:
    stmt = (
        select(Place)
        .options(
            selectinload(Place.tags),
            selectinload(Place.images),  # Needed for primary_image in enrich
            selectinload(
                Place.reviews
            ),  # Needed for stats in enrich (if not cached on model)
        )
        .where(Place.owner_id == owner_id)
    )
    result = await session.execute(stmt)
    places = result.scalars().all()
    return [_enrich_place_public(p) for p in places]


async def get_profile_by_email(session: AsyncSession, email: str) -> Profile | None:
    # Resolve auth.users email -> public.profiles
    # We join auth_users (reflected table) with Profile
    stmt = (
        select(Profile)
        .join(auth_users, auth_users.c.id == Profile.id)
        .where(auth_users.c.email == email)
    )
    result = await session.execute(stmt)
    return result.scalars().first()


# --- Search ---


async def search_places(
    session: AsyncSession, filter_params: PlaceSearchFilter
) -> tuple[Sequence[PlacePublic], int]:
    # We MUST selectinload relationships used in _enrich_place_public
    # otherwise accessing them on async objects triggers MissingGreenlet errors
    query = select(Place).options(
        selectinload(Place.tags),
        selectinload(Place.images),  # For primary_image
        selectinload(Place.reviews),  # For average_rating calculation
    )

    # 1. Keyword (Name only as Description is generic only in some subclasses)
    if filter_params.q:
        term = f"%{filter_params.q}%"
        # We search name. Searching subclass specific 'description' requires complicated joins
        # or casting. For V1, we search Name.
        query = query.where(Place.name.ilike(term))

    # 2. Type Filter
    if filter_params.place_type:
        query = query.where(Place.place_type == filter_params.place_type)

    # 3. Tags
    if filter_params.tags:
        tag_list = [t.strip() for t in filter_params.tags.split(",")]
        query = query.join(Place.tags).where(Tag.name.in_(tag_list))

    # 4. Geo
    distance_expr = None
    if filter_params.location:
        try:
            lat_str, lng_str = filter_params.location.split(",")
            lat, lng = float(lat_str), float(lng_str)
            user_geo = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326).cast(
                Geography
            )
            distance_expr = func.ST_Distance(Place.location, user_geo)

            if filter_params.radius:
                # Radius in meters
                query = query.where(
                    func.ST_DWithin(
                        Place.location, user_geo, filter_params.radius * 1000
                    )
                )
        except ValueError:
            pass

    # 5. Sorting
    if filter_params.sort_by == "distance" and distance_expr is not None:
        query = query.order_by(distance_expr.asc())
    elif filter_params.sort_by == "rating":
        query = query.order_by(Place.average_rating.desc())
    else:
        # Default newest.
        # Fallback to sorting by ID if created_at is missing on the polymorphic base
        # (Though snippet for PlaceImage had created_at, Place usually has it too)
        # Using name asc as safe fallback if created_at isn't guaranteed
        query = query.order_by(Place.name.asc())

    # Count
    count_query = select(func.count(Place.id)).select_from(query.subquery())
    result = await session.execute(count_query)
    total = result.scalar() or 0

    # Paginate
    offset = (filter_params.page - 1) * filter_params.limit
    query = query.offset(offset).limit(filter_params.limit)

    result = await session.execute(query)
    results = result.scalars().all()
    return [_enrich_place_public(p) for p in results], total


# --- Saved Lists Operations ---


async def create_saved_list(session: AsyncSession, user_id: uuid.UUID, data: SavedListCreate) -> SavedListSchema:
    saved_list = SavedList(user_id=user_id, name=data.name)
    session.add(saved_list)
    await session.commit()
    await session.refresh(saved_list)
    return SavedListSchema.model_validate(saved_list)


async def list_saved_lists(
    session: AsyncSession, user_id: uuid.UUID, page: int, limit: int
) -> tuple[list[SavedListSchema], int]:
    base_query = select(SavedList.id).where(SavedList.user_id == user_id)
    total_res = await session.execute(select(func.count()).select_from(base_query.subquery()))
    total = int(total_res.scalar() or 0)

    stmt = (
        select(SavedList, func.count(SavedListItem.place_id).label("item_count"))
        .outerjoin(SavedListItem, SavedList.id == SavedListItem.list_id)
        .where(SavedList.user_id == user_id)
        .group_by(SavedList.id)
        .order_by(SavedList.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    rows = (await session.execute(stmt)).all()
    data: list[SavedListSchema] = []
    for lst, item_count in rows:
        data.append(
            SavedListSchema(
                id=lst.id,
                name=lst.name,
                created_at=lst.created_at,
                item_count=int(item_count or 0),
            )
        )
    return data, total


async def get_saved_list(
    session: AsyncSession, user_id: uuid.UUID, list_id: uuid.UUID
):
    stmt = (
        select(SavedList)
        .options(
            selectinload(SavedList.items)
            .selectinload(SavedListItem.place)
            .selectinload(Place.tags)
        )
        .where(SavedList.id == list_id)
    )
    res = await session.execute(stmt)
    saved_list = res.scalars().first()
    if not saved_list or saved_list.user_id != user_id:
        raise ValueError("List not found or access denied")

    detailed_items = [
        {
            "place": _enrich_place_public(item.place),
            "saved_at": item.saved_at,
        }
        for item in saved_list.items
        if item.place is not None
    ]

    return SavedListDetailSchema(
        id=saved_list.id,
        name=saved_list.name,
        created_at=saved_list.created_at,
        items=[
            SavedListItemWithPlace(place=entry["place"], saved_at=entry["saved_at"])
            for entry in detailed_items
        ],
    )


async def add_place_to_list(
    session: AsyncSession, list_id: uuid.UUID, user_id: uuid.UUID, req: AddPlaceToListRequest
) -> SavedListItemSchema:
    saved_list = await session.get(SavedList, list_id)
    if not saved_list or saved_list.user_id != user_id:
        raise ValueError("List not found or access denied")

    place = await session.get(Place, req.place_id)
    if not place:
        raise ValueError("Place not found")

    existing = await session.execute(
        select(SavedListItem).where(
            SavedListItem.list_id == list_id, SavedListItem.place_id == req.place_id
        )
    )
    if existing.scalars().first():
        raise ValueError("Place already in list")

    item = SavedListItem(list_id=list_id, place_id=req.place_id)
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return SavedListItemSchema.model_validate(item)


async def remove_place_from_list(
    session: AsyncSession, list_id: uuid.UUID, user_id: uuid.UUID, place_id: uuid.UUID
) -> None:
    saved_list = await session.get(SavedList, list_id)
    if not saved_list or saved_list.user_id != user_id:
        raise ValueError("List not found or access denied")
    res = await session.execute(
        select(SavedListItem).where(
            SavedListItem.list_id == list_id, SavedListItem.place_id == place_id
        )
    )
    item = res.scalars().first()
    if not item:
        raise ValueError("Place not found in list")
    await session.delete(item)
    await session.commit()


# --- Review Operations ---


async def _recalculate_place_rating(session: AsyncSession, place_id: uuid.UUID) -> None:
    result = await session.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.place_id == place_id
        )
    )
    avg, count = result.first() or (0, 0)
    place = await session.get(Place, place_id)
    if place:
        place.average_rating = float(avg or 0)
        place.review_count = int(count or 0)


async def create_review(session: AsyncSession, user_id: uuid.UUID, data: ReviewCreate) -> ReviewSchema:
    place = await session.get(Place, data.place_id)
    if not place:
        raise ValueError("Place not found")

    review = Review(
        place_id=data.place_id,
        user_id=user_id,
        rating=data.rating,
        review_text=data.review_text,
    )
    session.add(review)
    await session.flush()

    for url in data.images:
        session.add(ReviewImage(review_id=review.id, image_url=url))

    await _recalculate_place_rating(session, data.place_id)
    await session.commit()
    await session.refresh(review)
    return await get_review(session, review.id)  # type: ignore


async def get_review(session: AsyncSession, review_id: uuid.UUID) -> ReviewSchema | None:
    res = await session.execute(
        select(Review)
        .options(selectinload(Review.images), selectinload(Review.user))
        .where(Review.id == review_id)
    )
    review = res.scalars().first()
    if not review:
        return None

    return ReviewSchema(
        id=review.id,
        place_id=review.place_id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at,
        images=[ReviewImageSchema.model_validate(img) for img in review.images],
        user=ReviewerSchema.model_validate(review.user) if review.user else None,
    )


async def list_reviews_for_place(
    session: AsyncSession, place_id: uuid.UUID, page: int, limit: int
) -> tuple[list[ReviewSchema], int]:
    base_query = select(Review.id).where(Review.place_id == place_id)
    total_res = await session.execute(select(func.count()).select_from(base_query.subquery()))
    total = int(total_res.scalar() or 0)

    stmt = (
        select(Review)
        .options(selectinload(Review.images), selectinload(Review.user))
        .where(Review.place_id == place_id)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    res = await session.execute(stmt)
    reviews = res.scalars().all()
    data = [
        ReviewSchema(
            id=r.id,
            place_id=r.place_id,
            rating=r.rating,
            review_text=r.review_text,
            created_at=r.created_at,
            images=[ReviewImageSchema.model_validate(img) for img in r.images],
            user=ReviewerSchema.model_validate(r.user) if r.user else None,
        )
        for r in reviews
    ]
    return data, total


async def update_review(session: AsyncSession, user_id: uuid.UUID, review_id: uuid.UUID, data: ReviewUpdate) -> ReviewSchema:
    review = await session.get(Review, review_id)
    if not review:
        raise ValueError("Review not found")
    if review.user_id != user_id:
        raise PermissionError("Not allowed")

    upd = data.model_dump(exclude_unset=True)
    images = upd.pop("images", None)
    for k, v in upd.items():
        setattr(review, k, v)

    if images is not None:
        for img in list(review.images):
            await session.delete(img)
        for url in images:
            session.add(ReviewImage(review_id=review.id, image_url=url))

    await _recalculate_place_rating(session, review.place_id)
    await session.commit()
    return await get_review(session, review.id)  # type: ignore


async def delete_review(session: AsyncSession, user_id: uuid.UUID, review_id: uuid.UUID) -> None:
    review = await session.get(Review, review_id)
    if not review:
        raise ValueError("Review not found")
    if review.user_id != user_id:
        raise PermissionError("Not allowed")
    place_id = review.place_id
    await session.delete(review)
    await _recalculate_place_rating(session, place_id)
    await session.commit()


# --- Trip / Itinerary Operations ---


async def _load_trip_detail(session: AsyncSession, trip: Trip) -> TripSchema:
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
    base_query = select(Trip.id).where(Trip.user_id == user_id)
    total_res = await session.execute(select(func.count()).select_from(base_query.subquery()))
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


async def create_trip(session: AsyncSession, user_id: uuid.UUID, data: TripCreate) -> TripSchema:
    trip = Trip(user_id=user_id, trip_name=data.trip_name, start_date=data.start_date, end_date=data.end_date)
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


async def get_trip(session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID) -> TripSchema:
    trip = await session.get(Trip, trip_id)
    if not trip or trip.user_id != user_id:
        raise ValueError("Trip not found")
    return await _load_trip_detail(session, trip)


async def update_trip(session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, data: TripUpdate) -> TripSchema:
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


async def _insert_stop_at_order(session: AsyncSession, trip_id: uuid.UUID, desired_order: int) -> int:
    await session.execute(
        TripStop.__table__.update()
        .where(TripStop.trip_id == trip_id, TripStop.stop_order >= desired_order)
        .values(stop_order=TripStop.stop_order + 1)
    )
    return desired_order


async def add_trip_stop(
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, data: TripStopCreate
) -> TripStopSchema:
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
    session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, stop_id: uuid.UUID, data: TripStopUpdate
) -> TripStopSchema:
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


async def remove_trip_stop(session: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID, stop_id: uuid.UUID) -> None:
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
