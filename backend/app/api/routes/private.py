"""
This module provides debugging endpoints for local developments.
"""

from fastapi import APIRouter, Depends

from app.core.security import TokenPayload, get_token_payload

router = APIRouter(tags=["private"], prefix="/private")


@router.get("/me", response_model=TokenPayload)
async def decoded_token(user: TokenPayload = Depends(get_token_payload)):
    return user
