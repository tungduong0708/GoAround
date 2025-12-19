"""
CRUD operations - Re-exports from service layer for backward compatibility.

This module maintains backward compatibility for existing imports while
the implementation has been moved to the app.service package.
"""

# Re-export all functions from service modules
from app.service.forum_service import (
    create_forum_post,
    create_forum_reply,
    get_forum_post,
    list_forum_posts,
)
from app.service.place_service import (
    create_place,
    delete_place,
    get_place,
    get_places_by_owner,
    get_profile_by_email,
    update_place,
)
from app.service.review_service import (
    create_review,
    delete_review,
    get_review,
    list_reviews_for_place,
    update_review,
)
from app.service.saved_list_service import (
    add_place_to_list,
    create_saved_list,
    get_saved_list,
    list_saved_lists,
    remove_place_from_list,
)
from app.service.search_service import search_places
from app.service.trip_service import (
    add_trip_stop,
    create_trip,
    get_trip,
    list_trips,
    remove_trip_stop,
    update_trip,
    update_trip_stop,
)

__all__ = [
    # Place operations
    "create_place",
    "delete_place",
    "get_place",
    "get_places_by_owner",
    "get_profile_by_email",
    "update_place",
    # Search operations
    "search_places",
    # Saved list operations
    "add_place_to_list",
    "create_saved_list",
    "get_saved_list",
    "list_saved_lists",
    "remove_place_from_list",
    # Review operations
    "create_review",
    "delete_review",
    "get_review",
    "list_reviews_for_place",
    "update_review",
    # Trip operations
    "add_trip_stop",
    "create_trip",
    "get_trip",
    "list_trips",
    "remove_trip_stop",
    "update_trip",
    "update_trip_stop",
    # Forum operations
    "create_forum_post",
    "create_forum_reply",
    "get_forum_post",
    "list_forum_posts",
]
