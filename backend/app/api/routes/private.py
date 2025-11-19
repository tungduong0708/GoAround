from fastapi import APIRouter, Depends
from pydantic import BaseModel

from backend.app.core.security import get_current_user

router = APIRouter(tags=["private"], prefix="/private")


class TokenInfo(BaseModel):
    status: str
    user_id: str
    email: str
    aud: str


@router.get("/me", response_model=TokenInfo)
def decoded_token(user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "user_id": user.get("sub"),
        "email": user.get("email"),
        "aud": user.get("aud"),
    }


class HealthInfo(BaseModel):
    status: str


@router.get("/health", response_model=HealthInfo)
def health():
    return {
        "status": "ok",
    }
