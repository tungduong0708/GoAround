from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import TokenPayload, get_token_payload

router = APIRouter(tags=["private"], prefix="/private")


@router.get("/me", response_model=TokenPayload)
async def decoded_token(user: TokenPayload = Depends(get_token_payload)):
    return user


class HealthInfo(BaseModel):
    status: str


@router.get("/health", response_model=HealthInfo)
async def health():
    return {
        "status": "ok",
    }
