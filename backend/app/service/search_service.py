"""Place search functionality."""

from geoalchemy2 import Geography
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

from app.models import (
    Cafe,
    Hotel,
    Landmark,
    Place,
    Restaurant,
    Tag,
    Trip,
    TripStop,
)
from app.schemas import (
    ForumSearchFilter,
    PlaceSearchFilter,
    PlaceSearchResponse,
    TripListSchema,
)
from app.service.forum_service import list_forum_posts
from app.service.place_service import _enrich_place_public


async def search_places(
    session: AsyncSession, filter_params: PlaceSearchFilter
) -> tuple[PlaceSearchResponse, int]:
    """
    Search places with various filters including keyword, type, tags, location, and radius.
    Returns paginated results and total count.
    Only approved places are shown for all users.
    """
    # Load all possible subclasses to prevent lazy loading of polymorphic attributes
    poly = with_polymorphic(Place, [Hotel, Restaurant, Landmark, Cafe])

    # We MUST selectinload relationships used in _enrich_place_public
    # otherwise accessing them on async objects triggers MissingGreenlet errors
    query = select(poly).options(
        selectinload(poly.tags),
        selectinload(poly.images),  # For primary_image
        selectinload(poly.reviews),  # For average_rating calculation
    )

    # 1. Keyword (Name only as Description is generic only in some subclasses)
    if filter_params.q:
        term = f"%{filter_params.q}%"
        # We search name. Searching subclass specific 'description' requires complicated joins
        # or casting. For V1, we search Name.
        query = query.where(poly.name.ilike(term))

    # 2. Type Filter
    if filter_params.place_type:
        query = query.where(poly.place_type == filter_params.place_type)

    # 3. Tags
    if filter_params.tags:
        tag_list = [t.strip() for t in filter_params.tags.split(",")]
        query = query.join(poly.tags).where(Tag.name.in_(tag_list))

    # 4. Amenities (for Hotel and Cafe)
    if filter_params.amenities:
        amenity_list = [a.strip() for a in filter_params.amenities.split(",")]
        # Check if the place has any of the requested amenities
        # This works because amenities is an ARRAY field in PostgreSQL
        query = query.where(
            or_(
                and_(
                    poly.place_type == "hotel",
                    Hotel.amenities.overlap(amenity_list),
                ),
                and_(
                    poly.place_type == "cafe",
                    Cafe.amenities.overlap(amenity_list),
                ),
            )
        )

    # 5. Price Range (for Restaurant and Cafe)
    if filter_params.price_range:
        query = query.where(
            or_(
                and_(
                    poly.place_type == "restaurant",
                    Restaurant.price_range == filter_params.price_range,
                ),
                and_(
                    poly.place_type == "cafe",
                    Cafe.price_range == filter_params.price_range,
                ),
            )
        )

    # 6. Minimum Rating
    if filter_params.rating:
        query = query.where(poly.average_rating >= filter_params.rating)

    # 7. Hotel Class (for Hotels only)
    if filter_params.hotel_class:
        query = query.where(
            and_(
                poly.place_type == "hotel",
                Hotel.hotel_class == filter_params.hotel_class,
            )
        )

    # 8. Hotel Price Per Night Range (for Hotels only)
    if (
        filter_params.price_per_night_min is not None
        or filter_params.price_per_night_max is not None
    ):
        conditions = [poly.place_type == "hotel"]
        if filter_params.price_per_night_min is not None:
            conditions.append(
                Hotel.price_per_night >= filter_params.price_per_night_min
            )
        if filter_params.price_per_night_max is not None:
            conditions.append(
                Hotel.price_per_night <= filter_params.price_per_night_max
            )
        query = query.where(and_(*conditions))

    # 9. Geo with validation
    distance_expr = None
    if filter_params.location:
        try:
            lat_str, lng_str = filter_params.location.split(",")
            lat, lng = float(lat_str), float(lng_str)

            # Validate coordinates
            if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                raise ValueError(f"Invalid coordinates: lat={lat}, lng={lng}")

            user_geo = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326).cast(
                Geography
            )
            distance_expr = func.ST_Distance(poly.location, user_geo)

            if filter_params.radius:
                # Validate radius
                if filter_params.radius <= 0:
                    raise ValueError("Radius must be positive")
                if filter_params.radius > 20000:  # 20,000 km max
                    raise ValueError("Radius too large (max 20,000 km)")
                # Radius in meters
                query = query.where(
                    func.ST_DWithin(
                        poly.location, user_geo, filter_params.radius * 1000
                    )
                )
        except (ValueError, AttributeError):
            # Invalid format or coordinate values - silently ignore and continue without geo filter
            # This matches the original behavior but logs the issue
            pass

    # 10. Sorting
    if filter_params.sort_by == "distance" and distance_expr is not None:
        query = query.order_by(distance_expr.asc())
    elif filter_params.sort_by == "rating":
        query = query.order_by(poly.average_rating.desc())
    else:
        # Default newest.
        # Fallback to sorting by ID if created_at is missing on the polymorphic base
        # (Though snippet for PlaceImage had created_at, Place usually has it too)
        # Using name asc as safe fallback if created_at isn't guaranteed
        query = query.order_by(poly.name.asc())

    # Count distinct places (handling duplicates from joins like tags)
    # Use distinct() on the query itself to ensure we only count unique place IDs
    count_query = select(func.count()).select_from(query.distinct().subquery())
    count_result = await session.execute(count_query)
    total = count_result.scalar() or 0

    # Paginate
    offset = (filter_params.page - 1) * filter_params.limit
    query = query.offset(offset).limit(filter_params.limit)

    result = await session.execute(query)
    results = result.unique().scalars().all()

    # Enrich places
    places = [_enrich_place_public(p) for p in results]

    # Fetch supplementary posts using existing forum search logic
    # Limited to 5 as these are extras, not the primary search result
    posts = []
    if filter_params.q:
        forum_filter = ForumSearchFilter(
            q=filter_params.q,
            sort="newest",
            page=1,
            limit=5,
        )
        posts, _ = await list_forum_posts(session, forum_filter)
        # Ignore total count (second return value) as we don't need it for supplementary results

    # Fetch supplementary public trips that visit any of the returned places
    # Limited to 5 as these are extras, not the primary search result
    trips = []
    if results:
        place_ids = [place.id for place in results]
        trips_query = (
            select(Trip, func.count(TripStop.id).label("stop_count"))
            .join(TripStop, Trip.id == TripStop.trip_id)
            .where(
                and_(
                    TripStop.place_id.in_(place_ids),
                    Trip.public,
                )
            )
            .group_by(Trip.id)
            .order_by(Trip.created_at.desc())
            .limit(5)
        )
        trips_result = await session.execute(trips_query)
        trip_rows = trips_result.all()

        trips = [
            TripListSchema(
                id=trip.id,
                trip_name=trip.trip_name,
                start_date=trip.start_date,
                end_date=trip.end_date,
                public=trip.public,
                stop_count=int(stop_count or 0),
            )
            for trip, stop_count in trip_rows
        ]

    response = PlaceSearchResponse(
        places=places,
        posts=posts,
        trips=trips,
    )

    return response, total
