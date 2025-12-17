import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserIdDep, SessionDep
from app.schemas import APIResponse, UserCreate, UserDetail, UserPublic, UserUpdate
from app.service import user_service

router = APIRouter(tags=["users"], prefix="/users")


@router.get("/me", response_model=APIResponse[UserDetail])
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
        status="success",
        data=user_detail,
        meta=None,
    )


@router.post("", response_model=APIResponse[UserDetail])
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
            status="success",
            data=user_detail,
            meta=None,
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists",
        )


@router.put("/me", response_model=APIResponse[UserDetail])
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
        status="success",
        data=user_detail,
        meta=None,
    )


@router.get("/{user_id}", response_model=APIResponse[UserPublic])
async def get_user(
    session: SessionDep,
    user_id: uuid.UUID,
):
    """
    Get user profile by id.
    """
    user_public = await user_service.get_user_public(session, user_id)
    if not user_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return APIResponse(status="success", data=user_public, meta=None)
