"""Admin-only routes for managing place verification and moderation."""

import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    AdminPendingPlace,
    AdminPlaceOwner,
    VerifyPlaceRequest,
    VerifyPlaceResponse,
)
from app.service.place_service import get_pending_places, verify_place

router = APIRouter(tags=["admin"], prefix="/admin")


@router.get("/places/pending", response_model=APIResponse[List[AdminPendingPlace]])
async def get_pending_places_for_review(
    session: SessionDep,
    current_user: CurrentUserDep,
) -> Any:
    """
    Fetch list of places waiting for verification.
    Admin only.
    """
    # Check if current user is Admin
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access pending places",
        )

    places = await get_pending_places(session)

    # Map to response schema
    pending_places = [
        AdminPendingPlace(
            id=place.id,
            name=place.name,
            place_type=place.place_type,
            owner=AdminPlaceOwner(
                id=place.owner.id,
                username=place.owner.username,
            )
            if place.owner
            else None,
            submitted_at=place.created_at,
            verification_status=place.verification_status,
        )
        for place in places
    ]

    return APIResponse(status="success", data=pending_places, meta=None)


@router.put("/places/{id}/verify", response_model=APIResponse[VerifyPlaceResponse])
async def verify_place_status(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
    verify_request: VerifyPlaceRequest,
) -> Any:
    """
    Approve or Reject a place listing.
    Admin only.
    """
    # Check if current user is Admin
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can verify places",
        )

    place = await verify_place(
        session,
        id,
        verify_request.status,
        verify_request.rejection_reason,
    )

    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found",
        )

    response = VerifyPlaceResponse(
        id=place.id,
        verification_status=place.verification_status,
        created_at=place.created_at,
    )

    return APIResponse(status="success", data=response, meta=None)
