"""Admin-only routes for managing moderation."""

import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, SessionDep
from app.schemas import (
    APIResponse,
    BusinessVerificationDetail,
    HTTPError,
    Message,
    ModerationCaseDetail,
    ModerationCaseSummary,
    ResolveCaseRequest,
    VerifyBusinessRequest,
)
from app.service import admin_service

router = APIRouter(tags=["admin"], prefix="/admin")


@router.get(
    "/cases",
    response_model=APIResponse[List[ModerationCaseSummary]],
    responses={
        403: {"model": HTTPError},
    },
)
async def get_moderation_cases(
    session: SessionDep,
    current_user: CurrentUserDep,
    page: int = 1,
    limit: int = 20,
    status_filter: str | None = None,
):
    """
    Get all moderation cases for admin review.

    Returns a list of moderation cases (tickets) with aggregated report counts.
    Must join ModerationTarget and ContentReport to calculate report_count.

    **Admin only**
    """
    # Check admin permission
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    cases, total_count = await admin_service.get_moderation_cases(
        session=session,
        page=page,
        limit=limit,
        status_filter=status_filter,
    )

    return APIResponse(
        data=cases,
        meta={"page": page, "limit": limit, "total_items": total_count},
    )


@router.get(
    "/cases/{case_id}",
    response_model=APIResponse[ModerationCaseDetail],
    responses={
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def get_case_detail(
    session: SessionDep,
    current_user: CurrentUserDep,
    case_id: uuid.UUID,
):
    """
    Get detailed information about a specific moderation case.

    Fetches the ModerationTarget, associated ContentReports, and uses
    a placeholder function fetch_content(type, id) to populate content_snapshot.

    **Admin only**
    """
    # Check admin permission
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    case_detail = await admin_service.get_case_detail(
        session=session,
        case_id=case_id,
    )

    if not case_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation case not found",
        )

    return APIResponse(data=case_detail)


@router.post(
    "/cases/{case_id}/resolve",
    response_model=APIResponse[Message],
    responses={
        400: {"model": HTTPError},
        403: {"model": HTTPError},
        404: {"model": HTTPError},
    },
)
async def resolve_case(
    session: SessionDep,
    current_user: CurrentUserDep,
    case_id: uuid.UUID,
    data: ResolveCaseRequest,
):
    """
    Resolve a moderation case with specified action.

    Path Parameters:
    - case_id: UUID of the moderation case (ticket) to resolve

    Request Body:
    - action: Action to take (dismiss, remove_content, ban_user)
    - notes: Optional notes about the resolution
    - ban_duration_days: Required when action is "ban_user". Specifies how many days the user will be banned.
                         The ban_until timestamp will be calculated as current_time + ban_duration_days.

    Action Mapping:
    - "dismiss" -> ModerationTarget.status = "approved" (Content is safe)
    - "remove_content" / "ban_user" -> ModerationTarget.status = "rejected" (Content is removed)

    Returns:
    - Success message

    **Admin only**
    """
    # Check admin permission
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # Validate ban_duration_days for ban_user action
    if data.action == "ban_user" and not data.ban_duration_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ban_duration_days is required when action is ban_user",
        )

    try:
        success = await admin_service.resolve_case(
            session=session,
            case_id=case_id,
            action=data.action,
            notes=data.notes,
            ban_duration_days=data.ban_duration_days,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Moderation case not found",
            )

        return APIResponse(
            data=Message(message=f"Case resolved with action: {data.action}")
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/businesses/unverified",
    response_model=APIResponse[List[BusinessVerificationDetail]],
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

    Returns a paginated list of pending business verification requests.
    Each entry includes user information, business details, and verification status.

    **Admin only**
    """
    # Check admin permission
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    verifications, total_count = await admin_service.get_unverified_businesses(
        session=session,
        page=page,
        limit=limit,
    )

    return APIResponse(
        data=verifications,
        meta={"page": page, "limit": limit, "total_items": total_count},
    )


@router.post(
    "/businesses/{user_id}/verify",
    response_model=APIResponse[Message],
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

    Path Parameters:
    - user_id: UUID of the user profile requesting verification

    Request Body:
    - action: Action to take (approve or reject)
    - notes: Optional notes about the decision (currently not persisted)

    Actions:
    - "approve": Sets is_verified_business=True, role="business", status="approved"
    - "reject": Sets status="rejected", user remains in current role

    **Admin only**
    """
    # Check admin permission
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    success = await admin_service.verify_business(
        session=session,
        user_id=user_id,
        action=data.action,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending verification request found for this user",
        )

    return APIResponse(
        data=Message(
            message=f"Business verification request {'approved' if data.action == 'approve' else 'rejected'} successfully"
        )
    )
