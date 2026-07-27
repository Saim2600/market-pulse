"""
Verifies Clerk-issued JWTs on incoming requests and resolves/creates the local User row.
Frontend sends: Authorization: Bearer <clerk_session_token>
"""
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from config.settings import get_settings
from database.db import get_db
from models.models import User, UserRole

settings = get_settings()
security = HTTPBearer()

_jwk_client = None


def _get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        if not settings.CLERK_JWKS_URL:
            raise RuntimeError("CLERK_JWKS_URL is not configured in backend/.env")
        _jwk_client = PyJWKClient(settings.CLERK_JWKS_URL)
    return _jwk_client


def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        signing_key = _get_jwk_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER or None,
            options={"verify_aud": False},
        )
        return payload
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )


def get_current_user(
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
) -> User:
    clerk_user_id = payload.get("sub")
    email = payload.get("email", f"{clerk_user_id}@unknown.local")

    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not user:
        # Auto-provision on first login. Default role = Analyst per spec.
        user = User(
            clerk_user_id=clerk_user_id,
            email=email,
            full_name=payload.get("name"),
            role=UserRole.ANALYST,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def require_role(*allowed_roles: UserRole):
    """Dependency factory for role-based authorization on backend routes."""
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' is not permitted to perform this action.",
            )
        return user
    return checker
