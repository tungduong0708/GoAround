import uuid
from datetime import date, datetime
from typing import Any, Literal

from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)
from shapely.geometry import Point

# --- Geometry Utilities ---


def parse_db_geometry(v: Any) -> Any:
    if isinstance(v, WKBElement):
        try:
            shape = to_shape(v)
            if isinstance(shape, Point):
                return {"lat": shape.y, "lng": shape.x}
        except Exception:
            return None
    return v


# --- Shared & Nested Schemas ---


class HTTPError(BaseModel):
    """Error response model for OpenAPI documentation."""

    detail: str


class LocationSchema(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class PlaceImageSchema(BaseModel):
    id: uuid.UUID
    # Map 'image_url' (DB) -> 'url' (API)
    url: str = Field(validation_alias="image_url")
    caption: str | None = None
    # No is_primary in model.

    model_config = ConfigDict(from_attributes=True)


class OwnerSchema(BaseModel):
    id: uuid.UUID
    username: str | None = None
    avatar_url: str | None = None
    full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ReviewerSchema(BaseModel):
    id: uuid.UUID
    username: str | None = None
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class PlaceMinimal(BaseModel):
    id: uuid.UUID
    name: str
    main_image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ReviewImageSchema(BaseModel):
    id: uuid.UUID
    image_url: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserReviewResponse(BaseModel):
    id: uuid.UUID
    place: PlaceMinimal
    rating: int
    review_text: str | None = None
    created_at: datetime
    images: list[ReviewImageSchema] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class TagSchema(BaseModel):
    name: str
    model_config = ConfigDict(from_attributes=True)


# --- API Response Wrappers ---


class MetaData(BaseModel):
    page: int
    limit: int
    total_items: int


class APIResponse[T](BaseModel):
    data: T
    meta: MetaData | None = None


class Message(BaseModel):
    message: str


class UserPostResponse(BaseModel):
    id: uuid.UUID
    title: str
    content_snippet: str
    reply_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserTripResponse(BaseModel):
    id: uuid.UUID
    trip_name: str
    start_date: date | None = None
    end_date: date | None = None
    stop_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class UserPhotoResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    source_type: Literal["review", "post"]
    source_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


# --- User Data Schemas ---


class UserBase(BaseModel):
    username: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None


class UserCreate(UserBase):
    signup_type: Literal["Traveler", "Business"]


class UserUpdate(UserBase):
    pass


class UserStats(BaseModel):
    reviews_count: int = 0
    posts_count: int = 0
    photos_count: int = 0
    public_trips_count: int = 0


class UserPublic(UserBase):
    id: uuid.UUID
    role: Literal["Admin", "Traveler", "Business"]
    is_verified_business: bool
    stats: UserStats | None = None
    joined_at: datetime | None = None


class UserDetail(UserPublic):
    email: EmailStr | None


# --- Place Data Schemas ---


class PlaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: str | None = None
    city: str | None = None
    country: str | None = None
    location: LocationSchema

    # Base fields available for all place types
    description: str | None = None
    opening_hours: dict[str, Any] | None = None

    place_type: Literal["hotel", "restaurant", "landmark", "cafe"] = Field(
        ..., description="Type of place"
    )


class PlaceCreate(PlaceBase):
    main_image_url: str | None = None
    images: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)

    # Hotel-specific fields
    hotel_class: int | None = Field(
        None, ge=1, le=5, description="Official hotel star rating (1-5)"
    )
    price_per_night: float | None = Field(None, ge=0)
    amenities: list[str] | None = None  # For hotels and cafes

    # Restaurant-specific fields
    cuisine_type: str | None = None
    price_range: str | None = Field(None, pattern=r"^\$+$", description="$ to $$$$")

    # Landmark-specific fields
    ticket_price: float | None = Field(None, ge=0)

    # Cafe-specific fields
    coffee_specialties: str | None = None


class PlaceUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    location: LocationSchema | None = None
    description: str | None = None
    opening_hours: dict[str, Any] | None = None
    city: str | None = None
    country: str | None = None
    main_image_url: str | None = None

    images: list[str] | None = None
    tags: list[str] | None = None

    # Type-specific fields
    hotel_class: int | None = Field(None, ge=1, le=5)
    price_per_night: float | None = None
    amenities: list[str] | None = None
    cuisine_type: str | None = None
    price_range: str | None = None
    ticket_price: float | None = None
    coffee_specialties: str | None = None


class PlaceSearchFilter(BaseModel):
    q: str | None = None
    category: Literal["hotel", "restaurant", "landmark", "cafe"] | None = Field(
        None, description="Filter by place type"
    )
    location: str | None = None
    radius: float = 5.0
    tags: str | None = None
    amenities: str | None = Field(None, description="Comma-separated amenities")
    price_range: str | None = Field(
        None, description="Filter by price range ($ to $$$$)"
    )
    rating: float | None = Field(None, ge=0, le=5, description="Minimum rating")
    sort_by: Literal["rating", "distance", "newest"] = "rating"
    page: int = 1
    limit: int = 20

    # Legacy field for backwards compatibility
    place_type: str | None = None

    @field_validator("location")
    @classmethod
    def validate_location_string(cls, v: str | None) -> str | None:
        if v is not None:
            try:
                lat, lng = map(float, v.split(","))
                if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                    raise ValueError
            except ValueError:
                raise ValueError('Location must be in "lat,lng" format')
        return v


class TransferOwnershipRequest(BaseModel):
    new_owner_email: EmailStr


class PlacePublic(BaseModel):
    id: uuid.UUID
    name: str
    place_type: Literal["hotel", "restaurant", "landmark", "cafe"]
    address: str | None = None
    city: str | None = None
    country: str | None = None
    location: LocationSchema | None = None
    main_image_url: str | None = None

    average_rating: float = 0.0
    review_count: int = 0

    # Base fields available for all types
    opening_hours: dict[str, Any] | None = None

    # Conditional fields based on place_type
    price_range: str | None = None  # For restaurants, cafes, hotels (as range)

    tags: list[str] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("location", mode="before")
    @classmethod
    def parse_location_geo(cls, v: Any) -> Any:
        return parse_db_geometry(v)

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, v: Any) -> list[str]:
        if isinstance(v, list) and v and hasattr(v[0], "name"):
            return [t.name for t in v]
        return v if v is not None else []


class PlaceDetail(PlacePublic):
    # Base fields available for all types
    description: str | None = None

    # Hotel-specific fields
    hotel_class: int | None = None  # Renamed from star_rating (1-5 official stars)
    price_per_night: float | None = None

    # Restaurant-specific fields
    cuisine_type: str | None = None

    # Landmark-specific fields
    ticket_price: float | None = None

    # Cafe-specific fields
    coffee_specialties: str | None = None

    # Amenities (for hotels and cafes)
    amenities: list[str] | None = None

    images: list[PlaceImageSchema] = Field(default_factory=list)
    owner: OwnerSchema | None = None
    my_review: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("location", mode="before")
    @classmethod
    def parse_location_geo_detail(cls, v: Any) -> Any:
        return parse_db_geometry(v)


# --- Trip / Itinerary Schemas ---


class TripStopCreate(BaseModel):
    place_id: uuid.UUID
    stop_order: int | None = Field(None, ge=1)
    arrival_time: datetime
    notes: str | None = None


class TripCreate(BaseModel):
    trip_name: str = Field(..., min_length=1, max_length=100)
    start_date: date | None = None
    end_date: date | None = None
    tags: list[str] = Field(default_factory=list)
    stops: list[TripStopCreate] = Field(default_factory=list)


class TripUpdate(BaseModel):
    trip_name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    tags: list[str] | None = None


class TripStopUpdate(BaseModel):
    order_index: int | None = Field(None, ge=1)
    arrival_time: datetime | None = None
    notes: str | None = None


class TripStopSchema(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    place_id: uuid.UUID
    stop_order: int
    arrival_time: datetime | None = None
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TripStopWithPlace(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    stop_order: int
    arrival_time: datetime | None = None
    notes: str | None = None
    place: PlacePublic | None = None

    model_config = ConfigDict(from_attributes=True)


class TripSchema(BaseModel):
    id: uuid.UUID
    trip_name: str
    start_date: date | None = None
    end_date: date | None = None
    tags: list[str] = Field(default_factory=list)
    stops: list[TripStopWithPlace] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags_list(cls, v: Any) -> list[str]:
        if isinstance(v, list) and v and hasattr(v[0], "name"):
            return [t.name for t in v]
        return v if v is not None else []


class TripListSchema(BaseModel):
    id: uuid.UUID
    trip_name: str
    start_date: date | None = None
    end_date: date | None = None
    stop_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# --- Saved List Schemas ---


class SavedListCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class SavedListSchema(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    item_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class SavedListItemSchema(BaseModel):
    list_id: uuid.UUID
    place_id: uuid.UUID
    saved_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SavedListItemWithPlace(BaseModel):
    place: PlacePublic
    saved_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavedListDetailSchema(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    items: list[SavedListItemWithPlace] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AddPlaceToListRequest(BaseModel):
    place_id: uuid.UUID


# --- Review Schemas ---


class ReviewCreate(BaseModel):
    place_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    review_text: str | None = None
    images: list[str] = Field(default_factory=list)


class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    review_text: str | None = None
    images: list[str] | None = None


class ReviewSchema(BaseModel):
    id: uuid.UUID
    place_id: uuid.UUID
    rating: int
    review_text: str | None = None
    created_at: datetime
    images: list[ReviewImageSchema] = Field(default_factory=list)
    user: ReviewerSchema | None = None

    model_config = ConfigDict(from_attributes=True)
