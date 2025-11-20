from typing import Any

import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field

from app.core.config import settings

security = HTTPBearer()


class TokenPayload(BaseModel):
    """
    Represents the decoded JWT payload from Supabase.
    Strictly defines only the fields required for application logic.
    """

    model_config = ConfigDict(extra="ignore")

    sub: str

    role: str
    aal: str

    email: str | None = None
    phone: str | None = None

    user_metadata: dict[str, Any] = Field(default_factory=dict)
    app_metadata: dict[str, Any] = Field(default_factory=dict)

    @property
    def is_mfa_verified(self) -> bool:
        """Helper to check if the user logged in with MFA."""
        return self.aal == "aal2"


def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> TokenPayload:
    """
    Validates the Supabase JWT and returns the user payload.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )
        return TokenPayload(**payload)
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
