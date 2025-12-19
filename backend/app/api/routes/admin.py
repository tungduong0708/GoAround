"""Admin-only routes for managing moderation."""

from fastapi import APIRouter

router = APIRouter(tags=["admin"], prefix="/admin")
