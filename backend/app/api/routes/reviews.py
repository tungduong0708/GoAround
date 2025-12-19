import uuid

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    HTTPError,
    Message,
    ReviewCreate,
    ReviewSchema,
    ReviewUpdate,
)

router = APIRouter(tags=["reviews"], prefix="/reviews")


@router.post(
    "",
    response_model=APIResponse[ReviewSchema],
    status_code=201,
    responses={
        404: {"model": HTTPError},
    },
)
async def create_review(
    session: SessionDep, current_user: CurrentUserDep, body: ReviewCreate
):
    try:
        review = await crud.create_review(session, current_user.id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return APIResponse(data=review)


@router.get(
    "/{review_id}",
    response_model=APIResponse[ReviewSchema],
    responses={
        404: {"model": HTTPError},
    },
)
async def read_review(session: SessionDep, review_id: uuid.UUID):
    review = await crud.get_review(session, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return APIResponse(data=review)


@router.put(
    "/{review_id}",
    response_model=APIResponse[ReviewSchema],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def update_review(
    session: SessionDep,
    current_user: CurrentUserDep,
    review_id: uuid.UUID,
    body: ReviewUpdate,
):
    try:
        review = await crud.update_review(session, current_user.id, review_id, body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=review)


@router.delete(
    "/{review_id}",
    response_model=APIResponse[Message],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def delete_review(
    session: SessionDep, current_user: CurrentUserDep, review_id: uuid.UUID
):
    try:
        await crud.delete_review(session, current_user.id, review_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not allowed")
    return APIResponse(data=Message(message="Review deleted"))
