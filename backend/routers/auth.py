"""Authentication router backed by PostgreSQL db-users."""

import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from db import get_users_db
from schemas import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Maps frontend/legacy labels to the exact values enforced by db-users CHECK constraint.
ROLE_MAP = {
    "viewer": "viewer",
    "uploader": "uploader",
    "creator": "uploader",
}


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    conn: psycopg.Connection = Depends(get_users_db),
) -> AuthResponse:
    """Authenticates a user against db-users and issues a signed JWT.

    Args:
        payload: User email and plaintext password.
        conn: Active PostgreSQL connection to db-users.

    Returns:
        AuthResponse: Bearer JWT and public user profile.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT user_id, name, email, password_hash, role
            FROM users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (payload.email,),
        )
        row = cur.fetchone()

    if not row or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user = UserPublic(
        userId=str(row["user_id"]),
        name=row["name"],
        email=row["email"],
        role=row["role"],
    )
    token = create_access_token(
        user_id=user.userId,
        email=user.email,
        name=user.name,
        role=user.role,
    )
    return AuthResponse(accessToken=token, user=user)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    conn: psycopg.Connection = Depends(get_users_db),
) -> AuthResponse:
    """Registers a new user in db-users with an Argon2id password hash.

    Args:
        payload: Registration form data (name, email, password, role).
        conn: Active PostgreSQL connection to db-users.

    Returns:
        AuthResponse: Bearer JWT and newly created user profile.
    """
    normalized_role = ROLE_MAP.get(payload.role.strip().lower())
    if not normalized_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Choose 'viewer' or 'uploader'.",
        )

    password_hash = hash_password(payload.password)

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (name, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
                RETURNING user_id, name, email, role
                """,
                (payload.name.strip(), payload.email.strip().lower(), password_hash, normalized_role),
            )
            row = cur.fetchone()
        conn.commit()
    except psycopg.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = UserPublic(
        userId=str(row["user_id"]),
        name=row["name"],
        email=row["email"],
        role=row["role"],
    )
    token = create_access_token(
        user_id=user.userId,
        email=user.email,
        name=user.name,
        role=user.role,
    )
    return AuthResponse(accessToken=token, user=user)