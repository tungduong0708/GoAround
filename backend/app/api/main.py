from fastapi import APIRouter

from app.api.routes import places, private, utils, lists, reviews, trips
from app.core.config import settings

api_router = APIRouter()

api_router.include_router(utils.router)
api_router.include_router(places.router)
api_router.include_router(lists.router)
api_router.include_router(reviews.router)
api_router.include_router(trips.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
