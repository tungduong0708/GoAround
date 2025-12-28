from typing import Any

import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, ValidationError

from app.core.config import settings

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


class AmrEntry(BaseModel):
    """
    Authentication method claim defined by Supabase.
    """

    method: str
    timestamp: int


class TokenPayload(BaseModel):
    """
    Represents the decoded JWT payload from Supabase.
    All claims defined following Supabase official guide.
    """

    # Anticipating changes from Supabase
    model_config = ConfigDict(extra="ignore")

    # required claims
    iss: str
    aud: str | list[str]
    exp: int
    iat: int
    sub: str
    role: str
    aal: str
    session_id: str
    email: str
    phone: str
    is_anonymous: bool

    # optional claims
    jti: str | None = None
    nbf: int | None = None
    app_metadata: dict[str, Any] | None = None
    user_metadata: dict[str, Any] | None = None
    amr: list[AmrEntry] | None = None

    # special claims
    ref: str | None = None


def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> TokenPayload:
    """
    Validates the Supabase JWT and returns the user payload.
    Following Supabase validation guidelines.
    """

    # 1. Check Required Fields: Ensure all required claims are present (pydantic)
    # 2. Validate Types: Verify field types match expected types (pydantic)
    # 3. Check Expiration: Validate exp timestamp is in the future (pyjwt)
    # 4. Verify Issuer: Ensure iss matches your Supabase project (pyjwt)
    # 5. Check Audience: Validate aud matches expected audience (pyjwt)

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256", "ES256", "RS256"],
            issuer=settings.SUPABASE_JWT_ISSUER,
            audience="authenticated",
            options={"verify_signature": True},  # Verify exp, iss, aud
            leeway=60,  # Allow 60 seconds clock skew
        )
        return TokenPayload(**payload)  # Validate fields
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_optional_token_payload(
    credentials: HTTPAuthorizationCredentials | None = Security(optional_security),
) -> TokenPayload | None:
    """
    Validates the Supabase JWT and returns the user payload.
    Returns None if no token is provided (for optional authentication).
    """
    if credentials is None:
        return None

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256", "ES256", "RS256"],
            issuer=settings.SUPABASE_JWT_ISSUER,
            audience="authenticated",
            options={"verify_signature": True},
            leeway=60,
        )
        return TokenPayload(**payload)
    except (ValidationError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        # For optional auth, return None on invalid/expired tokens
        return None
