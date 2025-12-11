import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Place
from app.schemas import (
    APIResponse,
    Message,
    MetaData,
    ReviewSchema,
    PlaceCreate,
    PlaceDetail,
    PlacePublic,
    PlaceSearchFilter,
    PlaceUpdate,
    TransferOwnershipRequest,
)

router = APIRouter(tags=["places"], prefix="/places")

# --- Public Endpoints ---


@router.get("", response_model=APIResponse[List[PlacePublic]])
async def search_places(
    session: SessionDep,
    filter_params: PlaceSearchFilter = Depends(),
) -> Any:
    """
    Search places by keyword, tags, price, or location (radius).
    """
    # Validation for distance sorting
    if filter_params.sort_by == "distance" and not filter_params.location:
        raise HTTPException(
            status_code=400,
            detail="Location (lat,lng) is required for distance sorting.",
        )

    results, total = await crud.search_places(session, filter_params)

    return APIResponse(
        status="success",
        data=results,
        meta=MetaData(
            page=filter_params.page, limit=filter_params.limit, total_items=total
        ),
    )


@router.get("/mine/all", response_model=APIResponse[List[PlacePublic]])
async def read_my_places(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get places owned by the current user.
    """
    places = await crud.get_places_by_owner(session, current_user.id)
    return APIResponse(status="success", data=places)


@router.get("/{id}", response_model=APIResponse[PlaceDetail])
async def get_place(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get detailed information for a single place.
    """
    place = await crud.get_place(session, id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    return APIResponse(status="success", data=place)


@router.get("/{id}/reviews", response_model=APIResponse[list[ReviewSchema]])
async def list_reviews_for_place(
    session: SessionDep, id: uuid.UUID, page: int = 1, limit: int = 20
) -> Any:
    # Ensure place exists
    exists = await session.get(Place, id)
    if not exists:
        raise HTTPException(status_code=404, detail="Place not found")

    reviews, total = await crud.list_reviews_for_place(session, id, page, limit)
    return APIResponse(
        status="success",
        data=reviews,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


# --- Protected Endpoints ---


@router.post("", response_model=APIResponse[PlaceDetail], status_code=201)
async def create_place(
    session: SessionDep,
    current_user: CurrentUser,
    place_in: PlaceCreate,
) -> Any:
    """
    Create a new place.
    """
    place = await crud.create_place(session, place_in, current_user.id)
    return APIResponse(status="success", data=place)


@router.put("/{id}", response_model=APIResponse[PlaceDetail])
async def update_place(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    place_in: PlaceUpdate,
) -> Any:
    """
    Update a place. Only the owner can perform this action.
    """
    # Retrieve DB object directly to check ownership and pass to CRUD
    db_place = await session.get(Place, id)

    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    if db_place.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this place"
        )

    updated_place = await crud.update_place(session, db_place, place_in)
    return APIResponse(status="success", data=updated_place)


@router.delete("/{id}", response_model=APIResponse[Message])
async def delete_place(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Delete a place. Only the owner can perform this action.
    """
    db_place = await session.get(Place, id)

    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    if db_place.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this place"
        )

    await crud.delete_place(session, db_place)
    return APIResponse(
        status="success", data=Message(message="Place deleted successfully")
    )


@router.post("/{id}/transfer", response_model=APIResponse[Message])
async def transfer_ownership(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    transfer_request: TransferOwnershipRequest,
) -> Any:
    """
    Transfer ownership of a place to another user via email.
    """
    db_place = await session.get(Place, id)

    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    if db_place.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to transfer this place"
        )

    target_user = await crud.get_profile_by_email(
        session, transfer_request.new_owner_email
    )
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    db_place.owner_id = target_user.id
    session.add(db_place)
    await session.commit()

    username_display = target_user.username or target_user.full_name or "user"
    return APIResponse(
        status="success",
        data=Message(message=f"Ownership transferred to {username_display}"),
    )
