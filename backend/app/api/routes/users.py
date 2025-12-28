import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserIdDep, SessionDep
from app.schemas import (
    APIResponse,
    BusinessVerificationSubmission,
    HTTPError,
    Message,
    MetaData,
    TripListSchema,
    UserCreate,
    UserDetail,
    UserPhotoResponse,
    UserPostResponse,
    UserPublic,
    UserReplyResponse,
    UserReviewResponse,
    UserUpdate,
)
from app.service import trip_service, user_service

router = APIRouter(tags=["users"], prefix="/users")


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[UserDetail],
    responses={
        404: {"model": HTTPError},
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
    status_code=status.HTTP_201_CREATED,
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
    status_code=status.HTTP_200_OK,
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
    status_code=status.HTTP_200_OK,
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
    user_public = await user_service.get_user_public(session, user_id)
    if not user_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return APIResponse(data=user_public, meta=None)


@router.get(
    "/{user_id}/reviews",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[List[UserReviewResponse]],
)
async def get_user_reviews(
    session: SessionDep,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
):
    """
    Get list of reviews written by a specific user.
    """
    reviews, total = await user_service.get_user_reviews(session, user_id, page, limit)
    return APIResponse(
        data=reviews,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get(
    "/{user_id}/posts",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[List[UserPostResponse]],
)
async def get_user_posts(
    session: SessionDep,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
):
    """
    Get list of forum threads created by a specific user.
    """
    posts, total = await user_service.get_user_posts(session, user_id, page, limit)
    return APIResponse(
        data=posts,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get(
    "/{user_id}/trips",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[List[TripListSchema]],
)
async def get_user_trips(
    session: SessionDep,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
):
    """
    Get list of public trips created by a specific user.
    """
    trips, total = await trip_service.list_trips(
        session, user_id, page, limit, public_only=True
    )
    return APIResponse(
        data=trips,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get(
    "/{user_id}/photos",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[List[UserPhotoResponse]],
)
async def get_user_photos(
    session: SessionDep,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
):
    """
    Get gallery of photos uploaded by the user (aggregated from reviews and posts).
    """
    photos, total = await user_service.get_user_photos(session, user_id, page, limit)
    return APIResponse(
        data=photos,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


@router.get(
    "/{user_id}/replies",
    response_model=APIResponse[List[UserReplyResponse]],
    status_code=501,
)
async def get_user_replies(
    session: SessionDep,
    user_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
):
    """
    Get list of forum replies created by a specific user.
    """
    raise HTTPException(
        status_code=501,
        detail="User replies endpoint not yet implemented",
    )


@router.post(
    "/me/verify-business",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[Message],
    responses={
        400: {"model": HTTPError},
    },
)
async def submit_business_verification(
    session: SessionDep,
    user_id: CurrentUserIdDep,
    submission: BusinessVerificationSubmission,
):
    """
    Submit or resubmit a business verification request.

    - First time: Creates a new verification request
    - After rejection: Updates existing request with new information

    The verification request will be set to "pending" status and will appear
    in the admin dashboard for review.

    Authentication required.
    """
    await user_service.submit_business_verification(
        session=session,
        user_id=user_id,
        business_image_url=submission.business_image_url,
        business_description=submission.business_description,
    )

    return APIResponse(
        data=Message(message="Business verification request submitted successfully")
    )
