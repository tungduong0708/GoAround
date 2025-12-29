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
    image_url: str
    caption: str | None = None

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


class UserPhotoResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    source_type: Literal["review", "post"]
    source_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class UserReplyResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    post_title: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- User Data Schemas ---


class UserBase(BaseModel):
    username: str
    full_name: str
    avatar_url: str | None


class UserCreate(UserBase):
    signup_type: Literal["traveler", "business"]
    business_image_url: str | None = None
    business_description: str | None = None


class UserUpdate(BaseModel):
    username: str | None
    full_name: str | None
    avatar_url: str | None


class UserStats(BaseModel):
    reviews_count: int
    posts_count: int
    photos_count: int
    public_trips_count: int
    replies_count: int


class UserPublic(UserBase):
    id: uuid.UUID
    role: Literal["admin", "traveler", "business"]
    is_verified_business: bool
    stats: UserStats
    created_at: datetime


class UserDetail(UserPublic):
    email: EmailStr | None
    ban_until: datetime | None
    ban_reason: str | None


# --- Place Data Schemas ---


class PlaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: str | None = None
    city: str | None = None
    country: str | None = None
    location: LocationSchema | None = None

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
    location: str | None = None
    radius: float = 5.0
    tags: str | None = None
    amenities: str | None = Field(None, description="Comma-separated amenities")
    price_range: str | None = Field(
        None, description="Filter by price range ($ to $$$$)"
    )
    rating: float | None = Field(None, ge=0, le=5, description="Minimum rating")
    hotel_class: int | None = Field(
        None, ge=1, le=5, description="Filter hotels by star rating (1-5)"
    )
    price_per_night_min: float | None = Field(
        None, ge=0, description="Minimum price per night for hotels"
    )
    price_per_night_max: float | None = Field(
        None, ge=0, description="Maximum price per night for hotels"
    )
    sort_by: Literal["rating", "distance", "newest"] = "rating"
    page: int = 1
    limit: int = 20

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


class VerifyRecipientRequest(BaseModel):
    email: EmailStr


class VerifyRecipientResponse(BaseModel):
    is_valid: bool
    username: str | None = None
    full_name: str | None = None
    message: str | None = None


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


class PlaceSearchResponse(BaseModel):
    """Search response with places, related posts, and trips."""

    places: list[PlacePublic] = Field(default_factory=list)
    posts: list["ForumPostListItem"] = Field(default_factory=list)
    trips: list["TripListSchema"] = Field(default_factory=list)


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
    public: bool = False
    tags: list[str] = Field(default_factory=list)
    stops: list[TripStopCreate] = Field(default_factory=list)


class TripUpdate(BaseModel):
    trip_name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    public: bool | None = None
    tags: list[str] | None = None
    stops: list[TripStopCreate] | None = None


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
    user_id: uuid.UUID
    trip_name: str
    start_date: date | None = None
    end_date: date | None = None
    public: bool = False
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
    start_date: date | None
    end_date: date | None
    public: bool = False
    stop_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# --- Saved List Schemas ---


class SavedListCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class SavedListUpdate(BaseModel):
    name: str | None = None
    place_ids: list[uuid.UUID] | None = None


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


# --- Forum Schemas ---


class ForumAuthorSchema(BaseModel):
    id: uuid.UUID
    username: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    is_verified_business: bool = False

    model_config = ConfigDict(from_attributes=True)


class ForumTagSchema(BaseModel):
    id: uuid.UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class ForumPostImageSchema(BaseModel):
    id: uuid.UUID
    image_url: str

    model_config = ConfigDict(from_attributes=True)


class ForumPostListItem(BaseModel):
    id: uuid.UUID
    title: str
    content_snippet: str
    author: ForumAuthorSchema
    tags: list[ForumTagSchema] = Field(default_factory=list)
    images: list[ForumPostImageSchema] = Field(default_factory=list)
    reply_count: int = 0
    like_count: int = 0
    view_count: int = 0
    created_at: datetime
    is_liked: bool = False

    model_config = ConfigDict(from_attributes=True)


class ForumCommentUserSchema(BaseModel):
    id: uuid.UUID
    username: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    is_verified_business: bool = False

    model_config = ConfigDict(from_attributes=True)


class ForumCommentSchema(BaseModel):
    id: uuid.UUID
    content: str
    user: ForumCommentUserSchema
    created_at: datetime
    parent_id: uuid.UUID | None = None
    like_count: int = 0
    is_liked: bool = False

    model_config = ConfigDict(from_attributes=True)


class ForumPostDetail(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    author: ForumAuthorSchema
    images: list[ForumPostImageSchema] = Field(default_factory=list)
    tags: list[ForumTagSchema] = Field(default_factory=list)
    replies: list[ForumCommentSchema] = Field(default_factory=list)
    reply_count: int = 0
    like_count: int = 0
    view_count: int = 0
    created_at: datetime
    is_liked: bool = False

    model_config = ConfigDict(from_attributes=True)


class ForumPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    content: str = Field(..., min_length=1)
    tags: list[str] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)


class ForumPostUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    content: str | None = Field(None, min_length=1)
    tags: list[str] | None = None
    images: list[str] | None = None


class ForumReplyCreate(BaseModel):
    content: str = Field(..., min_length=1)
    parent_reply_id: uuid.UUID | None = None


class ForumReplyUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class ContentReportCreate(BaseModel):
    reason: str = Field(..., min_length=1)


# --- Moderation (Ticketing Architecture) Schemas ---


class ReportDetail(BaseModel):
    """Individual user complaint within a moderation case."""

    id: uuid.UUID
    reporter_id: uuid.UUID
    reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ModerationCaseSummary(BaseModel):
    """Summary view of a moderation case (ticket) for list display."""

    id: uuid.UUID
    target_type: Literal["post", "reply"]
    target_id: uuid.UUID
    status: Literal["pending", "approved", "rejected"]
    created_at: datetime
    report_count: int = Field(..., description="Number of reports in this case")

    model_config = ConfigDict(from_attributes=True)


class ModerationCaseDetail(ModerationCaseSummary):
    """Detailed view of a moderation case with reports and content snapshot."""

    reason: str | None = None
    resolved_at: datetime | None = None
    content_snapshot: ForumPostDetail | ForumCommentSchema | None = Field(
        None, description="Fetched title/body/image of reported content"
    )
    reports: list[ReportDetail] = Field(
        default_factory=list, description="All user complaints for this case"
    )

    model_config = ConfigDict(from_attributes=True)


class ResolveCaseRequest(BaseModel):
    """Request to resolve a moderation case.

    Action Mapping:
    - 'dismiss' -> Status 'approved' (Content is safe)
    - 'remove_content' / 'ban_user' -> Status 'rejected' (Content is removed)
    """

    action: Literal["dismiss", "remove_content", "ban_user"]
    notes: str | None = None
    ban_duration_days: int | None = Field(
        None,
        ge=1,
        description="Ban duration in days (required when action is ban_user)",
    )


class BusinessVerificationDetail(BaseModel):
    user: UserPublic
    verification_id: uuid.UUID
    business_image_url: str
    business_description: str
    status: Literal["pending", "approved", "rejected"]
    created_at: datetime
    reviewed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class VerifyBusinessRequest(BaseModel):
    action: Literal["approve", "reject"]
    notes: str | None = None


class BusinessVerificationSubmission(BaseModel):
    """Schema for business owners to submit/resubmit verification request."""

    business_image_url: str = Field(
        ..., description="URL to business verification image"
    )
    business_description: str = Field(
        ..., min_length=10, max_length=1000, description="Description of the business"
    )


class ForumSearchFilter(BaseModel):
    q: str | None = None
    tags: list[str] | None = None
    sort: Literal["newest", "oldest", "popular"] = "newest"
    page: int = 1
    limit: int = 20


class TripGenerateRequest(BaseModel):
    destination: str
    start_date: date
    end_date: date
    # Removed interests and budget to match UI


# --- AI Recommendation Schemas ---


class UserContextSchema(BaseModel):
    """User preference context for recommendations"""

    saved_categories: list[str] = Field(default_factory=list)
    saved_count_per_category: dict[str, int] = Field(default_factory=dict)
    visited_cities: list[str] = Field(default_factory=list)
    price_preference: str | None = None
    avg_rating_given: float | None = None
    preferred_cuisines: list[str] = Field(default_factory=list)
    hotel_preferences: dict[str, Any] = Field(default_factory=dict)
    recent_activity_focus: str | None = None


class SearchCriteriaSchema(BaseModel):
    """AI-generated search criteria"""

    place_types: list[str] = Field(default_factory=list)
    cities: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    min_rating: float = 0.0
    price_ranges: list[str] = Field(default_factory=list)
    must_have_tags: list[str] = Field(default_factory=list)
    exclude_tags: list[str] = Field(default_factory=list)
    reasoning: str = ""
    match_priority: dict[str, float] = Field(
        default_factory=lambda: {
            "category_match": 0.3,
            "rating": 0.2,
            "price": 0.15,
            "location": 0.2,
            "keywords": 0.15,
        }
    )


class RecommendationItem(BaseModel):
    """Single recommendation with relevance info"""

    place: PlacePublic
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    match_reasons: list[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    """AI recommendation response"""

    recommendations: list[RecommendationItem]
    search_summary: str
    user_context_used: UserContextSchema | None = None
