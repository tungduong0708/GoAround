import uuid
from datetime import date, datetime
from typing import Any, Literal

from geoalchemy2 import Geography
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, TIMESTAMP, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.db import Base

# --- External Tables ---
# Table that are externally managed and defined only for reflection purpose.
# They will be skipped during Alembic autogeneration.

auth_users = Table(
    "users",
    Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("email", String(255)),
    schema="auth",
)

# --- Junction Tables ---
# Simple junction table with no metadata.

place_tags = Table(
    "place_tags",
    Base.metadata,
    Column(
        "place_id",
        UUID(as_uuid=True),
        ForeignKey("places.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

trip_tags = Table(
    "trip_tags",
    Base.metadata,
    Column(
        "trip_id",
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column(
        "post_id",
        UUID(as_uuid=True),
        ForeignKey("forum_posts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

# --- Entity Models ---


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auth.users.id"), primary_key=True
    )
    username: Mapped[str | None] = mapped_column(String(50))
    full_name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[Literal["admin", "traveler", "business"]] = mapped_column(
        String(20), default="traveler"
    )
    is_verified_business: Mapped[bool] = mapped_column(Boolean, default=False)
    ban_until: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owned_places: Mapped[list["Place"]] = relationship("Place", back_populates="owner")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    saved_lists: Mapped[list["SavedList"]] = relationship(
        "SavedList", back_populates="user"
    )
    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="user")
    posts: Mapped[list["ForumPost"]] = relationship(
        "ForumPost", back_populates="author"
    )
    replies: Mapped[list["PostReply"]] = relationship(
        "PostReply", back_populates="user"
    )
    reports: Mapped[list["ContentReport"]] = relationship(
        "ContentReport", back_populates="reporter"
    )


class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(50), unique=True)

    places: Mapped[list["Place"]] = relationship(
        "Place", secondary=place_tags, back_populates="tags"
    )
    trips: Mapped[list["Trip"]] = relationship(
        "Trip", secondary=trip_tags, back_populates="tags"
    )
    posts: Mapped[list["ForumPost"]] = relationship(
        "ForumPost", secondary=post_tags, back_populates="tags"
    )


class Place(Base):
    __tablename__ = "places"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("profiles.id"))
    name: Mapped[str] = mapped_column(String(100))
    place_type: Mapped[Literal["hotel", "restaurant", "landmark", "cafe"]] = (
        mapped_column(String(50))
    )
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(String(100))
    location: Mapped[object | None] = mapped_column(
        Geography(geometry_type="POINT", srid=4326)
    )
    main_image_url: Mapped[str | None] = mapped_column(String(255))
    average_rating: Mapped[float] = mapped_column(Numeric(2, 1), default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(Text)
    opening_hours: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    __mapper_args__ = {"polymorphic_identity": "place", "polymorphic_on": place_type}

    owner: Mapped["Profile"] = relationship("Profile", back_populates="owned_places")
    images: Mapped[list["PlaceImage"]] = relationship(
        "PlaceImage", back_populates="place", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="place", cascade="all, delete-orphan"
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary=place_tags, back_populates="places"
    )
    trip_stops: Mapped[list["TripStop"]] = relationship(
        "TripStop", back_populates="place"
    )
    saved_list_links: Mapped[list["SavedListItem"]] = relationship(
        "SavedListItem", back_populates="place"
    )


class Hotel(Place):
    __tablename__ = "hotels"
    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"), primary_key=True
    )
    hotel_class: Mapped[int | None] = mapped_column(Integer)
    price_per_night: Mapped[float | None] = mapped_column(Numeric)
    amenities: Mapped[list[str] | None] = mapped_column(ARRAY(String))

    __mapper_args__ = {"polymorphic_identity": "hotel"}


class Restaurant(Place):
    __tablename__ = "restaurants"
    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"), primary_key=True
    )
    cuisine_type: Mapped[str | None] = mapped_column(String(50))
    price_range: Mapped[str | None] = mapped_column(String(10))
    __mapper_args__ = {"polymorphic_identity": "restaurant"}


class Landmark(Place):
    __tablename__ = "landmarks"
    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"), primary_key=True
    )
    ticket_price: Mapped[float | None] = mapped_column(Numeric)
    __mapper_args__ = {"polymorphic_identity": "landmark"}


class Cafe(Place):
    __tablename__ = "cafes"
    id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"), primary_key=True
    )
    coffee_specialties: Mapped[str | None] = mapped_column(String(255))
    amenities: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    price_range: Mapped[str | None] = mapped_column(String(10))
    __mapper_args__ = {"polymorphic_identity": "cafe"}


class PlaceImage(Base):
    __tablename__ = "place_images"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE")
    )
    image_url: Mapped[str] = mapped_column(String(255))
    caption: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    place: Mapped["Place"] = relationship("Place", back_populates="images")


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE")
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("profiles.id", ondelete="SET NULL")
    )
    rating: Mapped[int] = mapped_column(Integer)
    review_text: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    place: Mapped["Place"] = relationship("Place", back_populates="reviews")
    user: Mapped["Profile"] = relationship("Profile", back_populates="reviews")
    images: Mapped[list["ReviewImage"]] = relationship(
        "ReviewImage", back_populates="review", cascade="all, delete-orphan"
    )


class ReviewImage(Base):
    __tablename__ = "review_images"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE")
    )
    image_url: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    review: Mapped["Review"] = relationship("Review", back_populates="images")


class SavedList(Base):
    __tablename__ = "saved_lists"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    user: Mapped["Profile"] = relationship("Profile", back_populates="saved_lists")
    items: Mapped[list["SavedListItem"]] = relationship(
        "SavedListItem", back_populates="saved_list", cascade="all, delete-orphan"
    )


class SavedListItem(Base):
    __tablename__ = "saved_list_items"

    list_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("saved_lists.id", ondelete="CASCADE"), primary_key=True
    )
    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id", ondelete="CASCADE"), primary_key=True
    )
    saved_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    saved_list: Mapped["SavedList"] = relationship("SavedList", back_populates="items")
    place: Mapped["Place"] = relationship("Place", back_populates="saved_list_links")


class Trip(Base):
    __tablename__ = "trips"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"))
    trip_name: Mapped[str] = mapped_column(String(100))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    user: Mapped["Profile"] = relationship("Profile", back_populates="trips")
    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary=trip_tags, back_populates="trips"
    )
    stops: Mapped[list["TripStop"]] = relationship(
        "TripStop",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="TripStop.stop_order",
    )


class TripStop(Base):
    __tablename__ = "trip_stops"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE")
    )
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id"))
    stop_order: Mapped[int] = mapped_column(Integer)
    arrival_time: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="stops")
    place: Mapped["Place"] = relationship("Place", back_populates="trip_stops")


class ForumPost(Base):
    __tablename__ = "forum_posts"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"))
    title: Mapped[str] = mapped_column(String(150))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    reply_count: Mapped[int] = mapped_column(Integer, default=0)

    author: Mapped["Profile"] = relationship("Profile", back_populates="posts")
    images: Mapped[list["PostImage"]] = relationship(
        "PostImage",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    replies: Mapped[list["PostReply"]] = relationship(
        "PostReply",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary=post_tags, back_populates="posts", lazy="selectin"
    )


class PostImage(Base):
    __tablename__ = "post_images"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("forum_posts.id", ondelete="CASCADE")
    )
    image_url: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    post: Mapped["ForumPost"] = relationship("ForumPost", back_populates="images")


class PostReply(Base):
    __tablename__ = "post_replies"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("forum_posts.id", ondelete="CASCADE")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("post_replies.id", ondelete="CASCADE"), nullable=True
    )
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    post: Mapped["ForumPost"] = relationship("ForumPost", back_populates="replies")
    user: Mapped["Profile"] = relationship("Profile", back_populates="replies")
    parent: Mapped["PostReply | None"] = relationship(
        "PostReply", remote_side=[id], back_populates="child_replies"
    )
    child_replies: Mapped[list["PostReply"]] = relationship(
        "PostReply", back_populates="parent", cascade="all, delete-orphan"
    )


class ContentReport(Base):
    __tablename__ = "content_reports"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reporter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"))
    target_type: Mapped[str] = mapped_column(String(20))
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    reporter: Mapped["Profile"] = relationship("Profile", back_populates="reports")


class ModerationTarget(Base):
    __tablename__ = "moderation_targets"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    target_type: Mapped[str] = mapped_column(String(20))
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    status: Mapped[Literal["pending", "approved", "rejected"]] = mapped_column(
        String(20), default="pending"
    )
    reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    resolved_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
