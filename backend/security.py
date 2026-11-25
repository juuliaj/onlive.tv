import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

_ph = PasswordHasher()  # Uses Argon2id with a unique random salt per password
_bearer_scheme = HTTPBearer()


def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using Argon2id with a unique salt.
    Input: plain_password (str)
    Output: Argon2id encoded hash string (str)
    """
    return _ph.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """
    Verifies a plain-text password against a stored Argon2id hash.
    Input: plain_password (str), password_hash (str)
    Output: True if valid, False otherwise (bool)
    """
    try:
        return _ph.verify(password_hash, plain_password)
    except VerifyMismatchError:
        return False


def create_access_token(user_id: str, email: str, name: str, role: str) -> str:
    """
    Creates a signed JWT containing the user's claims.
    Input: user_id (str), email (str), name (str), role (str)
    Output: Encoded JWT string (str)
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "name": name,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_EXPIRE_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user_claims(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict[str, Any]:
    """
    FastAPI dependency that validates the Bearer JWT and returns its claims.
    Input: Authorization header via HTTPBearer
    Output: Decoded JWT payload dictionary
    """
    token = credentials.credentials
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )