"""Place CRUD operations and enrichment utilities."""

import uuid
from typing import Sequence

from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from shapely.geometry import Point
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

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
    PlaceUpdate,
)


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
        except (ValueError, AttributeError, TypeError) as e:
            # Log geometry parsing error but continue with default (0, 0)
            pass

    # 2. Extract Tags (list of strings)
    # Ensure tags are loaded via selectinload in the query
    tag_names = [t.name for t in place.tags] if place.tags else []

    # 3. Polymorphic Data Extraction - get fields that are in PlacePublic
    opening_hours = getattr(place, "opening_hours", None)
    price_range = getattr(place, "price_range", None)

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
        opening_hours=opening_hours,
        price_range=price_range,
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
    # Only get fields that are NOT in PlacePublic (which already has opening_hours and price_range)
    description = getattr(place, "description", None)
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
        hotel_class=int(hotel_class) if hotel_class is not None else None,
        price_per_night=float(price_per_night) if price_per_night is not None else None,
        amenities=amenities,
        cuisine_type=cuisine_type,
        ticket_price=float(ticket_price) if ticket_price is not None else None,
        coffee_specialties=coffee_specialties,
        my_review=None,
    )


async def create_place(
    session: AsyncSession, place_create: PlaceCreate, owner_id: uuid.UUID
) -> PlaceDetail:
    """
    Creates a new place, selecting the correct Polymorphic Identity (Hotel, Restaurant, Landmark, Cafe).
    """
    # 1. Location WKT - using proper WKT format with validation
    loc = place_create.location
    # Validate coordinates
    if not (-180 <= loc.lng <= 180) or not (-90 <= loc.lat <= 90):
        raise ValueError(f"Invalid coordinates: lng={loc.lng}, lat={loc.lat}")
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

    # 5. Handle Tags with race condition protection
    if place_create.tags:
        for tag_name in place_create.tags:
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
                    result = await session.execute(select(Tag).where(Tag.name == tag_name))
                    tag = result.scalars().first()
                    if not tag:
                        raise ValueError(f"Failed to create or find tag: {tag_name}")
            db_place.tags.append(tag)

    await session.commit()
    # We return via get_place to ensure relationships are loaded properly
    place_detail = await get_place(session, db_place.id)
    if not place_detail:
        raise ValueError(f"Failed to retrieve created place with ID: {db_place.id}")
    return place_detail


async def get_place(session: AsyncSession, place_id: uuid.UUID) -> PlaceDetail | None:
    """
    Get place by ID with eager loading of all polymorphic subclasses.
    """
    # Load all possible subclasses to ensure their columns are available
    poly = with_polymorphic(Place, [Hotel, Restaurant, Landmark, Cafe])
    
    stmt = (
        select(poly)
        .options(
            selectinload(poly.images),
            selectinload(poly.tags),
            selectinload(poly.owner),
        )
        .where(poly.id == place_id)
    )
    result = await session.execute(stmt)
    place = result.unique().scalars().first()
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

    # 1. Geo Update with validation
    if "location" in update_data and update_data["location"]:
        loc_data = update_data["location"]
        lng = loc_data.lng
        lat = loc_data.lat
        # Validate coordinates
        if not (-180 <= lng <= 180) or not (-90 <= lat <= 90):
            raise ValueError(f"Invalid coordinates: lng={lng}, lat={lat}")
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

    # 4. Tags (Full Replace) with race condition protection
    if "tags" in update_data and update_data["tags"] is not None:
        db_place.tags = []
        for tag_name in update_data["tags"]:
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
                    result = await session.execute(select(Tag).where(Tag.name == tag_name))
                    tag = result.scalars().first()
                    if not tag:
                        raise ValueError(f"Failed to create or find tag: {tag_name}")
            db_place.tags.append(tag)

    await session.commit()
    await session.refresh(db_place)
    place_detail = await get_place(session, db_place.id)
    if not place_detail:
        raise ValueError(f"Failed to retrieve updated place with ID: {db_place.id}")
    return place_detail


async def delete_place(session: AsyncSession, db_place: Place) -> None:
    """Delete a place."""
    await session.delete(db_place)
    await session.commit()


async def get_places_by_owner(
    session: AsyncSession, owner_id: uuid.UUID
) -> Sequence[PlacePublic]:
    """Get all places owned by a specific user."""
    # Use with_polymorphic to eagerly load subclass attributes
    poly = with_polymorphic(Place, [Hotel, Restaurant, Landmark, Cafe])

    stmt = (
        select(poly)
        .options(
            selectinload(poly.tags),
            selectinload(poly.images),  # Needed for primary_image in enrich
            selectinload(
                poly.reviews
            ),  # Needed for stats in enrich (if not cached on model)
        )
        .where(poly.owner_id == owner_id)
    )
    result = await session.execute(stmt)
    places = result.scalars().all()
    return [_enrich_place_public(p) for p in places]


async def get_profile_by_email(session: AsyncSession, email: str) -> Profile | None:
    """Get profile by email address."""
    # Resolve auth.users email -> public.profiles
    # We join auth_users (reflected table) with Profile
    stmt = (
        select(Profile)
        .join(auth_users, auth_users.c.id == Profile.id)
        .where(auth_users.c.email == email)
    )
    result = await session.execute(stmt)
    return result.scalars().first()
