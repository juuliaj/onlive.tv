import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from mock_db import MOCK_USERS
from schemas import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from security import (
    create_access_token,
    get_current_user_claims,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest) -> AuthResponse:
    """
    Registers a new user, hashes their password with Argon2id, and returns a JWT.
    Input: RegisterRequest (name, email, password, role)
    Output: AuthResponse (accessToken, tokenType, user)
    """
    normalized_email = payload.email.lower()
    if any(u["email"].lower() == normalized_email for u in MOCK_USERS):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    new_user = {
        "userId": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": normalized_email,
        "passwordHash": hash_password(payload.password),
        "role": payload.role,
        "shard": "EU-East-01",
    }
    MOCK_USERS.append(new_user)

    token = create_access_token(
        user_id=new_user["userId"],
        email=new_user["email"],
        name=new_user["name"],
        role=new_user["role"],
    )
    return AuthResponse(accessToken=token, user=UserPublic(**new_user))


@router.post("/login", response_model=AuthResponse)
def login_user(payload: LoginRequest) -> AuthResponse:
    """
    Verifies user credentials against the Argon2id hash and issues a JWT bearer token.
    Input: LoginRequest (email, password)
    Output: AuthResponse (accessToken, tokenType, user)
    """
    normalized_email = payload.email.lower()
    user = next((u for u in MOCK_USERS if u["email"].lower() == normalized_email), None)

    if not user or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
        )

    token = create_access_token(
        user_id=user["userId"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
    )
    return AuthResponse(accessToken=token, user=UserPublic(**user))


@router.get("/me", response_model=UserPublic)
def get_me(claims: dict = Depends(get_current_user_claims)) -> UserPublic:
    """
    Returns the profile of the currently authenticated user based on their JWT claims.
    Input: Valid Bearer JWT in Authorization header
    Output: UserPublic
    """
    user = next((u for u in MOCK_USERS if u["userId"] == claims["sub"]), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserPublic(**user)