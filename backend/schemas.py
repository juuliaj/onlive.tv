from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field

UserRole = Literal["Viewer", "Creator", "Admin"]
ContentStatus = Literal["Published", "Processing", "Archived"]


class UserPublic(BaseModel):
    """Public user representation (never exposes PasswordHash)."""
    userId: str
    name: str
    email: EmailStr
    role: UserRole
    shard: str = "EU-East-01"


class RegisterRequest(BaseModel):
    """Payload for registering a new user account."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=128)
    role: Literal["Viewer", "Creator"] = "Viewer"


class LoginRequest(BaseModel):
    """Payload for authenticating an existing user."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Response returned after successful login or registration."""
    accessToken: str
    tokenType: Literal["Bearer"] = "Bearer"
    user: UserPublic


class ContentItem(BaseModel):
    """Metadata for a video item in the Content Library."""
    contentId: str
    contentOwnerId: str
    title: str
    description: str
    type: str
    releaseDate: str
    status: ContentStatus
    storageUrl: str
    format: str
    resolution: str
    duration: str
    thumbnailUrl: str