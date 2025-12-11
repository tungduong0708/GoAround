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
        primary_image=place.main_image_url,
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
                tag = Tag(name=tag_name, category="General")
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
                tag = Tag(name=tag_name, category="General")
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
