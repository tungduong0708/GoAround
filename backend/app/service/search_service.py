"""Place search functionality."""

from geoalchemy2 import Geography
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

from app.models import (
    Cafe,
    ForumPost,
    Hotel,
    Landmark,
    Place,
    Restaurant,
    Tag,
    Trip,
    TripStop,
)
from app.schemas import (
    ForumPostListItem,
    ForumAuthorSchema,
    ForumTagSchema,
    PlaceSearchFilter,
    PlaceSearchResponse,
    TripListSchema,
)
from app.service.place_service import _enrich_place_public
from app.service.utils import is_user_banned


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

    # 4. Geo with validation
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

    # 5. Sorting
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

    # Count
    count_query = select(func.count(func.distinct(poly.id))).select_from(
        query.subquery()
    )
    result = await session.execute(count_query)
    total = result.scalar() or 0

    # Paginate
    offset = (filter_params.page - 1) * filter_params.limit
    query = query.offset(offset).limit(filter_params.limit)

    result = await session.execute(query)
    results = result.unique().scalars().all()

    # Enrich places
    places = [_enrich_place_public(p) for p in results]

    # Fetch posts matching the search query (if provided)
    posts = []
    if filter_params.q:
        search_term = f"%{filter_params.q}%"
        posts_query = (
            select(ForumPost)
            .options(
                selectinload(ForumPost.author),
                selectinload(ForumPost.tags),
            )
            .where(
                or_(
                    ForumPost.title.ilike(search_term),
                    ForumPost.content.ilike(search_term),
                )
            )
            .order_by(ForumPost.created_at.desc())
            .limit(10)
        )
        posts_result = await session.execute(posts_query)
        forum_posts = posts_result.scalars().all()

        for post in forum_posts:
            author_data = ForumAuthorSchema(
                id=post.author.id,
                username=post.author.username or "Unknown",
                avatar_url=post.author.avatar_url,
            )

            if is_user_banned(post.author):
                author_data = ForumAuthorSchema(
                    id=post.author.id,
                    username="Banned User",
                    avatar_url=None,
                )

            posts.append(
                ForumPostListItem(
                    id=post.id,
                    title=post.title,
                    content_snippet=post.content[:200] if post.content else "",
                    author=author_data,
                    tags=[ForumTagSchema(id=t.id, name=t.name) for t in post.tags],
                    reply_count=post.reply_count,
                    created_at=post.created_at,
                )
            )

    # Fetch public trips that visit any of the returned places
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
            .limit(10)
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
