import uuid
from typing import Annotated, Any, List

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app import crud
from app.api.deps import CurrentUserDep, SessionDep
from app.models import Place
from app.schemas import (
    APIResponse,
    HTTPError,
    Message,
    MetaData,
    PlaceCreate,
    PlaceDetail,
    PlacePublic,
    PlaceSearchFilter,
    PlaceSearchResponse,
    PlaceUpdate,
    ReviewSchema,
    TransferOwnershipRequest,
    VerifyRecipientRequest,
    VerifyRecipientResponse,
)
from app.service import ai_service

router = APIRouter(tags=["places"], prefix="/places")

# --- Public Endpoints ---


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[PlaceSearchResponse],
    responses={
        400: {"model": HTTPError},
    },
)
async def search_places(
    session: SessionDep,
    filter_params: Annotated[PlaceSearchFilter, Query()],
) -> Any:
    """
    Search places by keyword, tags, price, or location (radius).

    Pagination (page/limit parameters) applies to places only.
    Additionally returns up to 5 related forum posts and 5 public trips as supplementary results.

    Metadata total_items reflects the count of places only.
    """
    # Validation for distance sorting
    if filter_params.sort_by == "distance" and not filter_params.location:
        raise HTTPException(
            status_code=400,
            detail="Location (lat,lng) is required for distance sorting.",
        )

    response, total = await crud.search_places(session, filter_params)

    return APIResponse(
        data=response,
        meta=MetaData(
            page=filter_params.page, limit=filter_params.limit, total_items=total
        ),
    )


@router.get(
    "/recommendations",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[PlacePublic]],
)
async def get_ai_recommendations(
    session: SessionDep,
    current_user: CurrentUserDep,
    query: str | None = None,
    city: str | None = None,
    max_results: int = 10,
) -> Any:
    """
    Get AI-powered personalized place recommendations.

    Uses user's saved lists, trips, and reviews to suggest relevant places.
    Supports natural language queries like:
    - "romantic dinner with city view"
    - "family-friendly activities"
    - "coffee shops for working"
    - "places I might like" (uses only user preferences)
    """
    recommendations = await ai_service.get_ai_recommendations(
        session=session,
        user_id=current_user.id,
        query=query,
        city=city,
        max_results=max_results,
    )

    return APIResponse(data=recommendations)


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[List[PlacePublic]],
)
async def read_my_places(
    session: SessionDep,
    current_user: CurrentUserDep,
) -> Any:
    """
    Get places owned by the current user.
    """
    places = await crud.get_places_by_owner(session, current_user.id)
    return APIResponse(data=places)


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[PlaceDetail],
    responses={
        404: {"model": HTTPError},
    },
)
async def get_place(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get detailed information for a single place.
    """
    place = await crud.get_place(session, id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    return APIResponse(data=place)


@router.get(
    "/{id}/reviews",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[ReviewSchema]],
    responses={
        404: {"model": HTTPError},
    },
)
async def list_reviews_for_place(
    session: SessionDep, id: uuid.UUID, page: int = 1, limit: int = 20
) -> Any:
    # Ensure place exists
    exists = await session.get(Place, id)
    if not exists:
        raise HTTPException(status_code=404, detail="Place not found")

    reviews, total = await crud.list_reviews_for_place(session, id, page, limit)
    return APIResponse(
        data=reviews,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )


# --- Protected Endpoints ---


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[PlaceDetail],
    responses={
        403: {"model": HTTPError},
    },
)
async def create_place(
    session: SessionDep,
    current_user: CurrentUserDep,
    place_in: PlaceCreate,
) -> Any:
    """
    Create a new place. Place will be pending admin approval.
    Only verified business accounts can create places.
    """
    # Check if user is a verified business account
    if current_user.role != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business accounts can create places",
        )

    if not current_user.is_verified_business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your business account must be verified to create places",
        )

    place = await crud.create_place(session, place_in, current_user.id)
    return APIResponse(
        data=place,
    )


@router.put(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[PlaceDetail],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def update_place(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
    place_in: PlaceUpdate,
) -> Any:
    """
    Update a place. Only the owner or admin can perform this action.
    """
    # Retrieve DB object with eagerly loaded images to avoid lazy loading issues
    result = await session.execute(
        select(Place).where(Place.id == id).options(selectinload(Place.images))
    )
    db_place = result.scalar_one_or_none()

    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    # Allow owner or admin to update
    if db_place.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to update this place"
        )

    updated_place = await crud.update_place(session, db_place, place_in)
    return APIResponse(data=updated_place)


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[Message],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def delete_place(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
) -> Any:
    """
    Delete a place. Only the owner or admin can perform this action.
    """
    db_place = await session.get(Place, id)

    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    # Allow owner or admin to delete
    if db_place.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this place"
        )

    await crud.delete_place(session, db_place)
    return APIResponse(data=Message(message="Place deleted successfully"))


@router.post(
    "/verify-recipient",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[VerifyRecipientResponse],
)
async def verify_recipient(
    session: SessionDep,
    current_user: CurrentUserDep,
    verify_request: VerifyRecipientRequest,
) -> Any:
    """
    Verify if an email belongs to a verified business account.
    Used before transferring ownership.
    """
    target_user = await crud.get_profile_by_email(session, verify_request.email)

    if not target_user:
        return APIResponse(
            data=VerifyRecipientResponse(
                is_valid=False, message="No user found with this email address"
            )
        )

    if target_user.role != "business":
        return APIResponse(
            data=VerifyRecipientResponse(
                is_valid=False, message="This user is not a business account"
            )
        )

    if not target_user.is_verified_business:
        return APIResponse(
            data=VerifyRecipientResponse(
                is_valid=False, message="This business account is not verified"
            )
        )

    return APIResponse(
        data=VerifyRecipientResponse(
            is_valid=True,
            username=target_user.username,
            full_name=target_user.full_name,
            message="Recipient verified successfully",
        )
    )


@router.post(
    "/{id}/transfer",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[Message],
    responses={
        404: {"description": "Place or target user not found"},
        403: {"description": "Not authorized"},
        400: {"description": "Target user validation failed"},
    },
)
async def transfer_ownership(
    session: SessionDep,
    current_user: CurrentUserDep,
    id: uuid.UUID,
    transfer_request: TransferOwnershipRequest,
) -> Any:
    """
    Transfer ownership of a place to another verified business account via email.
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

    # Validate target user is a verified business account
    if target_user.role != "business":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only transfer ownership to business accounts",
        )

    if not target_user.is_verified_business:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target business account must be verified",
        )

    db_place.owner_id = target_user.id
    session.add(db_place)
    await session.commit()

    username_display = target_user.username or target_user.full_name or "user"
    return APIResponse(
        data=Message(message=f"Ownership transferred to {username_display}"),
    )


@router.get(
    "/cities/list",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[str]],
)
async def get_cities(session: SessionDep) -> Any:
    """
    Get a list of unique 'city, country' combinations from places in the database.
    Used for destination autocomplete in trip generation.
    """
    cities = await crud.get_unique_cities(session)
    return APIResponse(data=cities)
