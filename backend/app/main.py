from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.db import sessionmanager


def init_app(init_db: bool) -> FastAPI:
    if init_db:
        sessionmanager.init(settings.SQLALCHEMY_DATABASE_URI.unicode_string())

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        # Shutdown: Close all connection pools
        if sessionmanager.is_initialized():
            await sessionmanager.close()

    def custom_generate_unique_id(route: APIRoute) -> str:
        return f"{route.tags[0]}-{route.name}"

    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        generate_unique_id_function=custom_generate_unique_id,
        lifespan=lifespan if init_db else None,
    )

    # Set all CORS enabled origins
    if settings.all_cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.all_cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = init_app(init_db=True)
