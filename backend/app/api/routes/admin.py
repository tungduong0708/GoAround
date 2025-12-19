"""Admin-only routes for managing moderation."""

import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import SessionDep, CurrentUserDep
from app.schemas import (
    APIResponse,
    ContentReportResponse,
    HTTPError,
    Message,
    MetaData,
    ResolveReportRequest,
)

router = APIRouter(tags=["admin"], prefix="/admin")


@router.get(
    "/reports",
    response_model=APIResponse[List[ContentReportResponse]],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={
        403: {"model": HTTPError},
    },
)
async def get_reports(
    session: SessionDep,
    current_user: CurrentUserDep,
    page: int = 1,
    limit: int = 20,
    status_filter: str | None = None,
):
    """
    Get all content reports for admin review.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get reports endpoint not yet implemented",
    )


@router.post(
    "/reports/{report_id}/resolve",
    response_model=APIResponse[Message],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def resolve_report(
    session: SessionDep,
    current_user: CurrentUserDep,
    report_id: uuid.UUID,
    data: ResolveReportRequest,
):
    """
    Resolve a content report with specified action.

    Path Parameters:
    - report_id: UUID of the report to resolve

    Request Body:
    - action: Action to take (dismiss, remove_content, ban_user)
    - notes: Optional notes about the resolution

    Returns:
    - Success message
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Resolve report endpoint not yet implemented",
    )
