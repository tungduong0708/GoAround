from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["utils"], prefix="/utils")


class HealthInfo(BaseModel):
    status: str


@router.get("/health", response_model=HealthInfo)
async def health():
    return {
        "status": "ok",
    }
