from fastapi import APIRouter
from pydantic import BaseModel
from app.api.deps import SessionDep
from app import crud
from app.schemas import APIResponse, MetaData, TripListSchema

router = APIRouter(tags=["utils"], prefix="/utils")


class HealthInfo(BaseModel):
    status: str


@router.get("/health", response_model=HealthInfo)
async def health():
    return {
        "status": "ok",
    }


@router.get(
    "/public-trips",
    status_code=200,
    response_model=APIResponse[list[TripListSchema]],
)
async def get_public_trips(
    session: SessionDep,
    page: int = 1,
    limit: int = 20,
):
    """
    Get public trips without authentication required.
    This endpoint returns trips that have been marked as public by their creators.
    """
    trips, total = await crud.list_public_trips(session, page, limit)
    return APIResponse(
        data=trips,
        meta=MetaData(page=page, limit=limit, total_items=total),
    )
