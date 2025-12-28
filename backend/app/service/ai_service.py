import json
import uuid
from datetime import datetime, time, timedelta
from math import ceil

from google import genai
from google.genai import types
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload, with_polymorphic
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import (
    Place,
    SavedList,
    SavedListItem,
    Trip,
    TripStop,
    Review,
    Restaurant,
    Cafe,
    Hotel,
    Landmark,
)
from app.schemas import (
    TripCreate,
    TripGenerateRequest,
    TripStopCreate,
    UserContextSchema,
    SearchCriteriaSchema,
    RecommendationItem,
    RecommendationResponse,
    PlacePublic,
)


async def generate_trip_plan(
    session: AsyncSession, request: TripGenerateRequest
) -> TripCreate:
    """
    Generates a trip itinerary. Handles insufficient data by allowing the AI to reuse places.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("AI configuration missing (GEMINI_API_KEY)")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    num_days = (request.end_date - request.start_date).days + 1
    if num_days < 1:
        raise ValueError("End date must be after start date")

    # ---------------------------------------------------------
    # 1. Fetching Logic (Same as before)
    # ---------------------------------------------------------
    limit_restaurants = max(10, num_days * 5)
    limit_landmarks = max(10, num_days * 6)
    limit_cafes = max(5, num_days * 2)
    limit_hotels = 10

    destination_str = request.destination.strip()

    def build_search_filters(model):
        parts = [p.strip() for p in destination_str.split(",") if p.strip()]
        if len(parts) >= 2:
            return or_(
                and_(
                    model.city.ilike(f"%{parts[0]}%"),
                    model.country.ilike(f"%{parts[1]}%"),
                ),
                model.address.ilike(f"%{destination_str}%"),
            )
        else:
            term = f"%{destination_str}%"
            return or_(
                model.city.ilike(term),
                model.country.ilike(term),
                model.address.ilike(term),
                model.name.ilike(term),
            )

    async def get_places_by_type(place_type: str, limit: int):
        stmt = (
            select(Place)
            .where(and_(Place.place_type == place_type, build_search_filters(Place)))
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    hotels = await get_places_by_type("hotel", limit_hotels)
    restaurants = await get_places_by_type("restaurant", limit_restaurants)
    cafes = await get_places_by_type("cafe", limit_cafes)
    landmarks = await get_places_by_type("landmark", limit_landmarks)

    # ---------------------------------------------------------
    # 2. Dynamic Rules (The Logic Fix)
    # ---------------------------------------------------------

    # Validation: We MUST have at least 1 hotel
    if not hotels:
        raise ValueError(
            f"No hotels found in '{request.destination}'. Please add accommodation to the database first."
        )

    # Rule Generation: Restaurants
    needed_meals = num_days * 3
    if len(restaurants) >= needed_meals:
        restaurant_rule = "one for Breakfast, one for Lunch, and one for Dinner. Do not repeat restaurants."
        restaurant_header = f"[Restaurants] (Select {needed_meals} distinct visits)"
    elif len(restaurants) > 0:
        # Fallback: Allow repetition
        restaurant_rule = "one for Breakfast, one for Lunch, and one for Dinner. You MAY repeat restaurants because options are limited."
        restaurant_header = (
            f"[Restaurants] (Available: {len(restaurants)} - Reuse allowed)"
        )
    else:
        # Fallback: No restaurants exist
        restaurant_rule = (
            "Skip meal planning as no restaurants are available in the database."
        )
        restaurant_header = "[Restaurants] (None available)"

    # Rule Generation: Landmarks
    if len(landmarks) > 0:
        landmark_rule = "schedule visits to places from the [Landmarks] list."
    else:
        landmark_rule = "Skip landmarks as none are available."

    # Rule Generation: Cafes
    if len(cafes) > 0:
        cafe_rule = (
            "On random days (roughly 50%), schedule a morning visit to a [Cafes] place."
        )
    else:
        cafe_rule = "(Skip coffee stops as no cafes are available)."

    # ---------------------------------------------------------
    # 3. Dynamic Prompt
    # ---------------------------------------------------------
    def format_list(places):
        if not places:
            return "(No places available)"
        return "\n".join(
            [
                f"- {p.id}: {p.name} ({p.description[:50] if p.description else ''}...)"
                for p in places
            ]
        )

    prompt = f"""
    Create a {num_days}-day trip itinerary for {request.destination}.
    
    STRICT RULES:
    1. Accommodation: Select exactly ONE hotel from the [Hotels] list. Use this same hotel for the entire trip.
    2. Meals: For EACH day, schedule 3 meals: {restaurant_rule}
    3. Activities: Between meals, {landmark_rule}
    4. Coffee: {cafe_rule}
    5. Do NOT invent places. Use ONLY the UUIDs provided below.

    AVAILABLE DATA:
    [Hotels]
    {format_list(hotels)}

    {restaurant_header}
    {format_list(restaurants)}

    [Cafes]
    {format_list(cafes)}

    [Landmarks]
    {format_list(landmarks)}

    Return a JSON object with this structure:
    {{
        "trip_name": "string",
        "itinerary": [
            {{
                "day": 1,
                "activities": [
                    {{
                        "place_id": "UUID",
                        "time_of_day": "HH:MM",
                        "notes": "string"
                    }}
                ]
            }}
        ]
    }}
    """

    # ---------------------------------------------------------
    # 4. Call AI
    # ---------------------------------------------------------
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    # ... (Rest of the JSON parsing and Loop logic remains the same) ...
    try:
        data = json.loads(response.text)
    except json.JSONDecodeError:
        raise ValueError("AI failed to generate valid JSON")

    stops: list[TripStopCreate] = []

    for day_plan in data.get("itinerary", []):
        day_offset = day_plan.get("day", 1) - 1
        current_date = request.start_date + timedelta(days=day_offset)

        for activity in day_plan.get("activities", []):
            place_id_str = activity.get("place_id")
            time_str = activity.get("time_of_day", "09:00")

            try:
                place_uuid = uuid.UUID(place_id_str)
            except (TypeError, ValueError):
                continue

            try:
                hour, minute = map(int, time_str.split(":"))
                arrival_dt = datetime.combine(
                    current_date, time(hour=hour, minute=minute)
                )
            except ValueError:
                arrival_dt = datetime.combine(current_date, time(9, 0))

            stops.append(
                TripStopCreate(
                    place_id=place_uuid,
                    arrival_time=arrival_dt,
                    notes=activity.get("notes"),
                )
            )

    return TripCreate(
        trip_name=data.get("trip_name", f"Trip to {request.destination}"),
        start_date=request.start_date,
        end_date=request.end_date,
        public=False,
        tags=[],
        stops=stops,
    )


# --- AI Recommendation Functions ---

# City name normalization for matching database entries
CITY_ALIASES = {
    "Ho Chi Minh City": [
        "saigon",
        "hcmc",
        "ho chi minh",
        "sai gon",
        "ho chi minh city",
    ],
    "Hanoi": ["ha noi", "hanoi"],
    "Da Nang": ["danang", "da nang"],
    "Hoi An": ["hoian", "hoi an"],
    "Nha Trang": ["nhatrang", "nha trang"],
}

AVAILABLE_CITIES = list(CITY_ALIASES.keys())


def normalize_city_name(city_input: str) -> str | None:
    """Convert user input to exact database city name"""
    city_lower = city_input.lower().strip()

    for db_city, aliases in CITY_ALIASES.items():
        if city_lower in aliases or city_lower == db_city.lower():
            return db_city

    return None


async def build_user_context(
    session: AsyncSession, user_id: uuid.UUID
) -> UserContextSchema:
    """
    Gather user preference context from saved lists, trips, and reviews.
    """
    context = UserContextSchema()

    # 1. Analyze Saved Lists
    stmt = select(SavedList).where(SavedList.user_id == user_id)
    result = await session.execute(stmt)
    saved_lists = result.scalars().all()

    if saved_lists:
        # Get all saved list items with place details
        saved_place_ids = []
        for saved_list in saved_lists:
            stmt = select(SavedListItem).where(SavedListItem.list_id == saved_list.id)
            result = await session.execute(stmt)
            items = result.scalars().all()
            saved_place_ids.extend([item.place_id for item in items])

        if saved_place_ids:
            # Use with_polymorphic to load subclass attributes (price_range, cuisine_type)
            # Also eagerly load tags relationship to avoid lazy loading
            poly_place = with_polymorphic(Place, [Restaurant, Cafe, Hotel, Landmark])
            stmt = (
                select(poly_place)
                .options(selectinload(poly_place.tags))
                .where(poly_place.id.in_(saved_place_ids))
            )
            result = await session.execute(stmt)
            saved_places = result.scalars().all()

            # Aggregate category counts
            category_counts = {}
            cities = set()
            price_preferences = []
            cuisines = set()

            for place in saved_places:
                # Count categories
                category_counts[place.place_type] = (
                    category_counts.get(place.place_type, 0) + 1
                )
                context.saved_categories.append(place.place_type)

                # Track cities
                if place.city:
                    cities.add(place.city)

                # Track prices (for restaurants/cafes) - safe access without lazy loading
                if place.place_type in ("restaurant", "cafe") and place.price_range:
                    price_preferences.append(place.price_range)

                # Track cuisines (for restaurants) - safe access without lazy loading
                if place.place_type == "restaurant" and place.cuisine_type:
                    cuisines.add(place.cuisine_type)

            context.saved_count_per_category = category_counts
            context.visited_cities = list(cities)
            context.saved_categories = list(set(context.saved_categories))

            # Determine most common price preference
            if price_preferences:
                context.price_preference = max(
                    set(price_preferences), key=price_preferences.count
                )

            context.preferred_cuisines = list(cuisines)

            # Determine recent activity focus
            if category_counts:
                context.recent_activity_focus = max(
                    category_counts, key=category_counts.get
                )

    # 2. Analyze Trip History
    stmt = select(Trip).where(Trip.user_id == user_id).limit(10)
    result = await session.execute(stmt)
    trips = result.scalars().all()

    if trips:
        trip_cities = set()
        for trip in trips:
            # Extract city from trip name or first place
            stmt = select(TripStop).where(TripStop.trip_id == trip.id).limit(1)
            result = await session.execute(stmt)
            trip_stop = result.scalar_one_or_none()

            if trip_stop:
                place = await session.get(Place, trip_stop.place_id)
                if place and place.city:
                    trip_cities.add(place.city)

        # Merge with visited cities
        context.visited_cities = list(set(context.visited_cities) | trip_cities)

    # 3. Analyze Review History
    stmt = select(Review).where(Review.user_id == user_id).limit(50)
    result = await session.execute(stmt)
    reviews = result.scalars().all()

    if reviews:
        ratings = [r.rating for r in reviews if r.rating]
        if ratings:
            context.avg_rating_given = sum(ratings) / len(ratings)

    return context


async def generate_search_criteria(
    user_context: UserContextSchema, query: str | None, city_filter: str | None
) -> SearchCriteriaSchema:
    """
    Use Gemini AI to generate intelligent search criteria based on user context and query.
    """
    # If no API key or minimal user context, use simple criteria
    if not settings.GEMINI_API_KEY or (
        not user_context.saved_categories
        and not user_context.visited_cities
        and not query
    ):
        # Simple fallback criteria
        criteria = SearchCriteriaSchema()
        criteria.place_types = ["restaurant", "cafe", "landmark"]  # Default variety
        criteria.min_rating = 4.0  # Show highly rated places
        if query:
            criteria.keywords = query.split()
        if city_filter:
            normalized = normalize_city_name(city_filter)
            if normalized:
                criteria.cities = [normalized]
        else:
            criteria.cities = ["Ho Chi Minh City", "Hanoi"]  # Default popular cities
        criteria.reasoning = "Showing popular highly-rated places"
        return criteria

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""You are a travel recommendation AI for Vietnam.

USER PROFILE:
- Saved places: {user_context.saved_count_per_category}
- Most interested in: {", ".join(user_context.saved_categories[:3]) if user_context.saved_categories else "various places"}
- Visited cities: {", ".join(user_context.visited_cities) if user_context.visited_cities else "none yet"}
- Price preference: {user_context.price_preference or "any"}
- Average rating given: {user_context.avg_rating_given or "N/A"}
- Preferred cuisines: {", ".join(user_context.preferred_cuisines[:3]) if user_context.preferred_cuisines else "various"}
- Recent focus: {user_context.recent_activity_focus or "exploring"}

AVAILABLE CITIES (IMPORTANT - ONLY RECOMMEND FROM THESE):
{", ".join(AVAILABLE_CITIES)}

USER QUERY: "{query or "places I might like based on my preferences"}"
{f"CITY FILTER: User wants places in {city_filter}" if city_filter else ""}

Generate smart search criteria as JSON:
{{
  "place_types": [],
  "cities": [],
  "keywords": [],
  "min_rating": 0.0,
  "price_ranges": [],
  "must_have_tags": [],
  "exclude_tags": [],
  "reasoning": "Brief explanation of recommendation strategy",
  "match_priority": {{
    "category_match": 0.3,
    "rating": 0.2,
    "price": 0.15,
    "location": 0.2,
    "keywords": 0.15
  }}
}}

RULES:
1. Cities MUST be from the available cities list (exact match)
2. If user query mentions a city, prioritize that city
3. If city_filter is provided, use ONLY that city (after normalizing to available cities)
4. place_types should be from: hotel, restaurant, landmark, cafe
5. price_ranges should be from: $, $$, $$$
6. Match user's price preference unless query specifies otherwise
7. min_rating should be realistic: Use 4.0-4.5 for quality places. NEVER use 5.0 (perfect ratings are rare).
8. Consider user's saved categories for place_types
9. If query is vague, use user's preferences heavily
10. Keep reasoning concise (1-2 sentences)
"""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        criteria_dict = json.loads(response.text)
        criteria = SearchCriteriaSchema(**criteria_dict)
        
        # Cap min_rating at 4.5 to prevent unrealistic perfect rating requirements
        if criteria.min_rating > 4.5:
            criteria.min_rating = 4.5

        # Normalize city names
        if criteria.cities:
            normalized_cities = []
            for city in criteria.cities:
                norm = normalize_city_name(city)
                if norm:
                    normalized_cities.append(norm)
            criteria.cities = normalized_cities

        # Apply city filter override
        if city_filter:
            normalized = normalize_city_name(city_filter)
            if normalized:
                criteria.cities = [normalized]

        return criteria

    except Exception as e:
        # Fallback to simple criteria
        criteria = SearchCriteriaSchema()
        criteria.reasoning = f"Using fallback criteria due to: {str(e)}"

        if query:
            criteria.keywords = query.split()[:5]

        if city_filter:
            normalized = normalize_city_name(city_filter)
            if normalized:
                criteria.cities = [normalized]
        elif user_context.visited_cities:
            criteria.cities = user_context.visited_cities[:2]

        if user_context.saved_categories:
            criteria.place_types = user_context.saved_categories[:3]

        if user_context.price_preference:
            criteria.price_ranges = [user_context.price_preference]

        return criteria


async def search_places_with_criteria(
    session: AsyncSession,
    criteria: SearchCriteriaSchema,
    user_context: UserContextSchema,
    max_results: int = 10,
) -> list[dict]:
    """
    Execute smart database search based on AI-generated criteria and score results.
    """
    filters = []

    # Place type filter
    if criteria.place_types:
        filters.append(Place.place_type.in_(criteria.place_types))

    # City filter
    if criteria.cities:
        city_filters = [Place.city.ilike(f"%{city}%") for city in criteria.cities]
        filters.append(or_(*city_filters))

    # Keyword search (name and description)
    if criteria.keywords:
        keyword_filters = []
        for kw in criteria.keywords:
            keyword_filters.append(
                or_(Place.name.ilike(f"%{kw}%"), Place.description.ilike(f"%{kw}%"))
            )
        if keyword_filters:
            filters.append(or_(*keyword_filters))

    # Rating filter
    if criteria.min_rating > 0:
        filters.append(Place.average_rating >= criteria.min_rating)

    # Execute query with polymorphic loading and eager loading of relationships
    poly_place = with_polymorphic(Place, [Restaurant, Cafe, Hotel, Landmark])
    stmt = (
        select(poly_place)
        .options(selectinload(poly_place.tags))
        .where(and_(*filters))
        .limit(max_results * 3)
    )
    result = await session.execute(stmt)
    candidates = result.scalars().all()
    
    if len(candidates) == 0:
        return []

    # Score and rank places
    scored_places = []
    for place in candidates:
        score = 0.0
        reasons = []

        # Category match
        if place.place_type in user_context.saved_categories:
            weight = criteria.match_priority.get("category_match", 0.3)
            score += weight
            reasons.append(f"Matches your interest in {place.place_type}s")

        # Rating bonus
        if place.average_rating and user_context.avg_rating_given:
            if place.average_rating >= user_context.avg_rating_given:
                weight = criteria.match_priority.get("rating", 0.2)
                score += weight * (place.average_rating / 5.0)
                reasons.append(f"Highly rated ({place.average_rating:.1f}★)")
        elif place.average_rating and place.average_rating >= 4.0:
            weight = criteria.match_priority.get("rating", 0.2)
            score += weight * 0.8
            reasons.append(f"Highly rated ({place.average_rating:.1f}★)")

        # Price match - safe access without lazy loading
        if place.place_type in ("restaurant", "cafe") and place.price_range:
            if (
                user_context.price_preference
                and place.price_range == user_context.price_preference
            ):
                weight = criteria.match_priority.get("price", 0.15)
                score += weight
                reasons.append("Matches your budget preference")

        # Location familiarity
        if place.city in user_context.visited_cities:
            weight = criteria.match_priority.get("location", 0.2)
            score += weight * 0.5
            reasons.append(f"In {place.city}, a city you know")

        # Keyword relevance boost
        if criteria.keywords:
            keyword_matches = sum(
                1
                for kw in criteria.keywords
                if kw.lower() in (place.name or "").lower()
                or kw.lower() in (place.description or "").lower()
            )
            if keyword_matches > 0:
                weight = criteria.match_priority.get("keywords", 0.15)
                score += weight * (keyword_matches / len(criteria.keywords))
                reasons.append("Matches your search keywords")

        # Ensure at least one reason
        if not reasons:
            reasons.append("Popular destination")

        scored_places.append(
            {
                "place": place,
                "score": min(score, 1.0),  # Cap at 1.0
                "reasons": reasons[:3],  # Limit to 3 reasons
            }
        )

    # Sort by score descending
    scored_places.sort(key=lambda x: x["score"], reverse=True)
    for i, item in enumerate(scored_places):
        print(
            f"Rank {i + 1}: {item['place'].name} - Score: {item['score']:.3f} - Reasons: {item['reasons']}"
        )
    return scored_places[:max_results]


async def get_ai_recommendations(
    session: AsyncSession,
    user_id: uuid.UUID,
    query: str | None = None,
    city: str | None = None,
    max_results: int = 10,
) -> list[PlacePublic]:
    # Build user context
    user_context = await build_user_context(session, user_id)

    # Step 2: Generate search criteria using AI
    criteria = await generate_search_criteria(user_context, query, city)

    # Search and score places
    scored_places = await search_places_with_criteria(
        session, criteria, user_context, max_results
    )

    # Convert to PlacePublic list (already sorted by score)
    recommendations = []
    for item in scored_places:
        place_public = PlacePublic.model_validate(item["place"])
        recommendations.append(place_public)
        print(
            f"Recommended: {place_public.name} - Score: {item['score']:.3f} - Reasons: {item['reasons']}"
        )

    return recommendations
