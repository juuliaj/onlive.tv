"""Administrator monitoring endpoints for the platform's separate databases."""

import logging
from datetime import datetime, timezone
from typing import Any, Callable

import psycopg
from fastapi import APIRouter, Depends
from psycopg.rows import dict_row

from db import activity_db_conninfo, content_write_db_conninfo, users_db_conninfo
from schemas import (
    ActivityMetrics,
    AdminDashboard,
    ContentMetrics,
    DatabaseHealth,
    UserMetrics,
)
from security import require_admin

router = APIRouter(prefix="/admin", tags=["Administration"])
logger = logging.getLogger(__name__)


def _query_database(
    name: str,
    conninfo_factory: Callable[[], str],
    query: str,
) -> tuple[DatabaseHealth, dict[str, Any] | None]:
    checked_at = datetime.now(timezone.utc).isoformat()
    try:
        with psycopg.connect(
            conninfo_factory(),
            row_factory=dict_row,
            connect_timeout=3,
        ) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                metrics = cursor.fetchone()
        return (
            DatabaseHealth(name=name, status="healthy", checkedAt=checked_at),
            metrics,
        )
    except psycopg.Error:
        logger.exception("Admin dashboard could not query the %s database", name)
        return (
            DatabaseHealth(
                name=name,
                status="unavailable",
                checkedAt=checked_at,
                error="Unable to connect to or query this database.",
            ),
            None,
        )


@router.get("/dashboard", response_model=AdminDashboard)
def get_admin_dashboard(
    _claims: dict = Depends(require_admin),
) -> AdminDashboard:
    """Returns service status and aggregate metrics across all three databases."""
    users_health, users_row = _query_database(
        "users",
        users_db_conninfo,
        """
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
            COUNT(*) FILTER (WHERE role = 'uploader')::int AS uploaders,
            COUNT(*) FILTER (WHERE role = 'viewer')::int AS viewers
        FROM users
        """,
    )
    content_health, content_row = _query_database(
        "content",
        content_write_db_conninfo,
        """
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'published')::int AS published,
            COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
            COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts,
            COUNT(*) FILTER (WHERE status = 'archived')::int AS archived,
            COUNT(*) FILTER (WHERE status = 'restricted')::int AS restricted
        FROM content
        """,
    )
    activity_health, activity_row = _query_database(
        "activity",
        activity_db_conninfo,
        """
        SELECT
            (SELECT COUNT(*)::int FROM watch_history) AS "playbackEvents",
            (
                SELECT COUNT(DISTINCT user_id)::int
                FROM watch_history
                WHERE last_watched_at >= NOW() - INTERVAL '24 hours'
            ) AS "activeViewers24h",
            (SELECT COUNT(*)::int FROM watchlist) AS watchlists,
            (SELECT COUNT(*)::int FROM rating) AS ratings,
            (SELECT COUNT(*)::int FROM content_like) AS likes
        """,
    )

    return AdminDashboard(
        generatedAt=datetime.now(timezone.utc).isoformat(),
        databases=[users_health, content_health, activity_health],
        users=UserMetrics(**users_row) if users_row is not None else None,
        content=ContentMetrics(**content_row) if content_row is not None else None,
        activity=ActivityMetrics(**activity_row) if activity_row is not None else None,
    )
