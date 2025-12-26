"""Admin-only routes for managing moderation."""

import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import SessionDep, CurrentUserDep
from app.schemas import (
    APIResponse,
    BusinessVerificationDetail,
    ContentReportResponse,
    HTTPError,
    Message,
    MetaData,
    ResolveReportRequest,
    UserPublic,
    VerifyBusinessRequest,
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
    - ban_duration_days: Required when action is "ban_user". Specifies how many days the user will be banned.
                         The ban_until timestamp will be calculated as current_time + ban_duration_days.

    Returns:
    - Success message
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Resolve report endpoint not yet implemented",
    )


@router.get(
    "/businesses/unverified",
    response_model=APIResponse[List[BusinessVerificationDetail]],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={
        403: {"model": HTTPError},
    },
)
async def get_unverified_businesses(
    session: SessionDep,
    current_user: CurrentUserDep,
    page: int = 1,
    limit: int = 20,
):
    """
    Get all unverified business accounts with verification details.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get unverified businesses endpoint not yet implemented",
    )


@router.post(
    "/businesses/{user_id}/verify",
    response_model=APIResponse[Message],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def verify_business(
    session: SessionDep,
    current_user: CurrentUserDep,
    user_id: uuid.UUID,
    data: VerifyBusinessRequest,
):
    """
    Approve or reject a business verification request.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Verify business endpoint not yet implemented",
    )
