import json
import uuid
from datetime import datetime, time, timedelta
from math import ceil

from google import genai
from google.genai import types
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import Place
from app.schemas import (
    TripCreate,
    TripGenerateRequest,
    TripStopCreate,
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
                and_(model.city.ilike(f"%{parts[0]}%"), model.country.ilike(f"%{parts[1]}%")),
                model.address.ilike(f"%{destination_str}%")
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
        stmt = select(Place).where(
            and_(
                Place.place_type == place_type,
                build_search_filters(Place)
            )
        ).limit(limit)
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
         raise ValueError(f"No hotels found in '{request.destination}'. Please add accommodation to the database first.")

    # Rule Generation: Restaurants
    needed_meals = num_days * 3
    if len(restaurants) >= needed_meals:
        restaurant_rule = "one for Breakfast, one for Lunch, and one for Dinner. Do not repeat restaurants."
        restaurant_header = f"[Restaurants] (Select {needed_meals} distinct visits)"
    elif len(restaurants) > 0:
        # Fallback: Allow repetition
        restaurant_rule = "one for Breakfast, one for Lunch, and one for Dinner. You MAY repeat restaurants because options are limited."
        restaurant_header = f"[Restaurants] (Available: {len(restaurants)} - Reuse allowed)"
    else:
        # Fallback: No restaurants exist
        restaurant_rule = "Skip meal planning as no restaurants are available in the database."
        restaurant_header = "[Restaurants] (None available)"

    # Rule Generation: Landmarks
    if len(landmarks) > 0:
        landmark_rule = "schedule visits to places from the [Landmarks] list."
    else:
        landmark_rule = "Skip landmarks as none are available."

    # Rule Generation: Cafes
    if len(cafes) > 0:
        cafe_rule = "On random days (roughly 50%), schedule a morning visit to a [Cafes] place."
    else:
        cafe_rule = "(Skip coffee stops as no cafes are available)."

    # ---------------------------------------------------------
    # 3. Dynamic Prompt
    # ---------------------------------------------------------
    def format_list(places):
        if not places:
            return "(No places available)"
        return "\n".join([f"- {p.id}: {p.name} ({p.description[:50] if p.description else ''}...)" for p in places])

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
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
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
                arrival_dt = datetime.combine(current_date, time(hour=hour, minute=minute))
            except ValueError:
                arrival_dt = datetime.combine(current_date, time(9, 0))

            stops.append(
                TripStopCreate(
                    place_id=place_uuid,
                    arrival_time=arrival_dt,
                    notes=activity.get("notes")
                )
            )

    return TripCreate(
        trip_name=data.get("trip_name", f"Trip to {request.destination}"),
        start_date=request.start_date,
        end_date=request.end_date,
        public=False,
        tags=[], 
        stops=stops
    )