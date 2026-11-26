"""Pydantic request and response models aligned with PostgreSQL schemas."""

from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr
    password: str = Field(min_length=4)


class RegisterRequest(BaseModel):
    """Payload for POST /auth/register."""

    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=4)
    role: str = "viewer"


class UserPublic(BaseModel):
    """Public user profile returned to the frontend (never includes password_hash)."""

    userId: str
    name: str
    email: str
    role: str


class AuthResponse(BaseModel):
    """Response payload containing a signed JWT and user profile."""

    accessToken: str
    tokenType: Literal["Bearer"] = "Bearer"
    user: UserPublic


class ContentItem(BaseModel):
    """Video catalog entry mapped from db-content."""

    contentId: str
    contentOwnerId: str
    title: str
    description: str | None = None
    type: str
    releaseDate: str | None = None
    status: str
    storageUrl: str
    format: str | None = None
    resolution: str | None = None
    createdAt: str
    averageRating: float | None = None
    likeCount: int = 0
    partition: str | None = None


class DatabaseHealth(BaseModel):
    name: str
    status: Literal["healthy", "unavailable"]
    checkedAt: str
    error: str | None = None


class UserMetrics(BaseModel):
    total: int
    admins: int
    uploaders: int
    viewers: int


class ContentMetrics(BaseModel):
    total: int
    published: int
    processing: int
    drafts: int
    archived: int
    restricted: int


class ActivityMetrics(BaseModel):
    playbackEvents: int
    activeViewers24h: int
    watchlists: int
    ratings: int
    likes: int


class AdminDashboard(BaseModel):
    generatedAt: str
    databases: list[DatabaseHealth]
    users: UserMetrics | None
    content: ContentMetrics | None
    activity: ActivityMetrics | None