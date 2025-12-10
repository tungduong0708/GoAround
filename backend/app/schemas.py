import uuid
from typing import Any, Literal

from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import to_shape
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    ValidationInfo,
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
    status: Literal["success", "error"] = "success"
    data: T
    meta: MetaData | None = None


class Message(BaseModel):
    message: str


# --- Base Data Models ---


class PlaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: str | None = None
    city: str | None = None
    country: str | None = None
    location: LocationSchema

    # Polymorphic/Subclass Fields (Optional in Base)
    # These map to fields in Hotel/Restaurant/Landmark or generic placeholders
    description: str | None = None  # Landmark
    price_level: float | None = None  # Mapped from price_per_night/price_range logic
    place_type: str = "place"  # Discriminator


# --- Request Schemas ---


class PlaceCreate(PlaceBase):
    images: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)

    # Extra fields for specific types
    cuisine_type: str | None = None
    opening_hours: dict[str, Any] | None = None  # Restaurant
    star_rating: float | None = None  # Hotel
    ticket_price: float | None = None  # Landmark


class PlaceUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    location: LocationSchema | None = None
    description: str | None = None
    city: str | None = None
    country: str | None = None

    images: list[str] | None = None
    tags: list[str] | None = None

    # Specifics
    opening_hours: dict[str, Any] | None = None


class PlaceSearchFilter(BaseModel):
    q: str | None = None
    location: str | None = None
    radius: float = 5.0
    tags: str | None = None
    sort_by: Literal["rating", "distance", "newest"] = "rating"
    page: int = 1
    limit: int = 20
    place_type: str | None = None
    price_level: int | None = None  # Filter logic needed

    @field_validator("location")
    @classmethod
    def validate_location_string(
        cls, v: str | None, info: ValidationInfo
    ) -> str | None:
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


# --- Response Data Schemas ---


class PlacePublic(BaseModel):
    id: uuid.UUID
    name: str
    place_type: str
    address: str | None = None
    city: str | None = None
    country: str | None = None
    location: LocationSchema | None = None

    average_rating: float = 0.0
    review_count: int = 0
    # Map 'main_image_url' (DB) -> 'primary_image' (API)
    primary_image: str | None = Field(default=None, validation_alias="main_image_url")
    tags: list[str] = Field(default_factory=list)

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
    # Subclass specific fields exposed as optional
    description: str | None = None
    opening_hours: dict[str, Any] | None = None
    price_range: str | None = None
    star_rating: float | None = None
    ticket_price: float | None = None

    images: list[PlaceImageSchema] = Field(default_factory=list)
    owner: OwnerSchema | None = None
    my_review: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("location", mode="before")
    @classmethod
    def parse_location_geo_detail(cls, v: Any) -> Any:
        return parse_db_geometry(v)
