import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, CurrentUserIdDep, SessionDep
from app.schemas import (
    APIResponse,
    HTTPError,
    UserCreate,
    UserDetail,
    UserPhotoResponse,
    UserPostResponse,
    UserPublic,
    UserReviewResponse,
    UserTripResponse,
    UserUpdate,
)
from app.service import user_service

router = APIRouter(tags=["users"], prefix="/users")


@router.get(
    "/me",
    response_model=APIResponse[UserDetail],
    responses={
        404: {"model": HTTPError, "description": "User profile not found"},
    },
)
async def get_current_user(
    session: SessionDep,
    user_id: CurrentUserIdDep,
):
    """
    Get current user profile. Authentication required.
    """
    user_detail = await user_service.get_user_detail(session, user_id)
    if not user_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return APIResponse(
        data=user_detail,
        meta=None,
    )


@router.post(
    "",
    response_model=APIResponse[UserDetail],
    responses={
        409: {"model": HTTPError},
    },
)
async def create_user(
    session: SessionDep,
    user_id: CurrentUserIdDep,
    user_create: UserCreate,
):
    """
    Create a user profile, after `auth.users` table has been updated.
    """
    try:
        user_detail = await user_service.create_user(session, user_id, user_create)
        return APIResponse(
            data=user_detail,
            meta=None,
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists",
        )


@router.put(
    "/me",
    response_model=APIResponse[UserDetail],
    responses={
        404: {"model": HTTPError},
        409: {"model": HTTPError},
    },
)
async def update_current_user(
    session: SessionDep,
    user_id: CurrentUserIdDep,
    user_update: UserUpdate,
):
    """
    Update current user profile. Authentication required.
    """
    try:
        user_detail = await user_service.update_user(session, user_id, user_update)
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    if not user_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return APIResponse(
        data=user_detail,
        meta=None,
    )


@router.get(
    "/{user_id}",
    response_model=APIResponse[UserPublic],
    responses={
        404: {"model": HTTPError},
    },
)
async def get_user(
    session: SessionDep,
    user_id: uuid.UUID,
):
    """
    Get public profile of another user with activity statistics.
    """
    user_public = await user_service.get_user_public_with_stats(session, user_id)
    if not user_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return APIResponse(data=user_public, meta=None)


@router.get("/{user_id}/reviews", response_model=APIResponse[List[UserReviewResponse]])
async def get_user_reviews(
    session: SessionDep,
    user_id: uuid.UUID,
):
    """
    Get list of reviews written by a specific user.
    """
    reviews = await user_service.get_user_reviews(session, user_id)
    return APIResponse(data=reviews, meta=None)


@router.get("/{user_id}/posts", response_model=APIResponse[List[UserPostResponse]])
async def get_user_posts(
    session: SessionDep,
    user_id: uuid.UUID,
):
    """
    Get list of forum threads created by a specific user.
    """
    posts = await user_service.get_user_posts(session, user_id)
    return APIResponse(data=posts, meta=None)


@router.get("/{user_id}/trips", response_model=APIResponse[List[UserTripResponse]])
async def get_user_trips(
    session: SessionDep,
    user_id: uuid.UUID,
):
    """
    Get list of public trips created by a specific user.
    """
    trips = await user_service.get_user_trips(session, user_id)
    return APIResponse(data=trips, meta=None)


@router.get("/{user_id}/photos", response_model=APIResponse[List[UserPhotoResponse]])
async def get_user_photos(
    session: SessionDep,
    user_id: uuid.UUID,
):
    """
    Get gallery of photos uploaded by the user (aggregated from reviews and posts).
    """
    photos = await user_service.get_user_photos(session, user_id)
    return APIResponse(data=photos, meta=None)
