"""Content catalog router backed by PostgreSQL db-content-replica."""

import psycopg
from fastapi import APIRouter, Depends, Query, Response

from db import get_content_read_db
from schemas import ContentItem
from security import get_current_user_claims

router = APIRouter(prefix="/content", tags=["Content"])


@router.get("", response_model=list[ContentItem])
def list_content(
    response: Response,
    search: str | None = Query(default=None, description="Free-text search over title, description, and type"),
    type_filter: str | None = Query(default=None, alias="type", description="Exact content type filter"),
    _claims: dict = Depends(get_current_user_claims),
    conn: psycopg.Connection = Depends(get_content_read_db),
) -> list[ContentItem]:
    """Queries published content from the read replica with optional search and type filters.

    Args:
        response: FastAPI response object used to expose the serving DB node header.
        search: Optional substring matched case-insensitively against title, description, or type.
        type_filter: Optional content type filter (e.g. 'video', 'live_vod', 'movie', 'series').
        _claims: Verified JWT claims from the authenticated user.
        conn: Active read connection to db-content-replica.

    Returns:
        list[ContentItem]: Matching published content items with ratings, likes, and partition info.
    """
    response.headers["X-DB-Node"] = "db-content-replica"

    conditions = ["c.status = 'published'"]
    params: list = []

    if search and search.strip():
        like_term = f"%{search.strip()}%"
        conditions.append("(c.title ILIKE %s OR COALESCE(c.description, '') ILIKE %s OR c.type ILIKE %s)")
        params.extend([like_term, like_term, like_term])

    if type_filter and type_filter.strip().lower() != "all":
        conditions.append("LOWER(c.type) = LOWER(%s)")
        params.append(type_filter.strip())

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT
            c.content_id,
            c.content_owner_id,
            c.title,
            c.description,
            c.type,
            c.release_date,
            c.status,
            c.storage_url,
            c.format,
            c.resolution,
            c.created_at,
            c.tableoid::regclass::text AS partition,
            ROUND(AVG(r.rating_value)::numeric, 1) AS average_rating,
            COUNT(DISTINCT cl.like_id) AS like_count
        FROM content c
        LEFT JOIN rating r ON r.content_id = c.content_id
        LEFT JOIN content_like cl ON cl.content_id = c.content_id
        WHERE {where_clause}
        GROUP BY
            c.tableoid,
            c.content_id,
            c.content_owner_id,
            c.title,
            c.description,
            c.type,
            c.release_date,
            c.status,
            c.storage_url,
            c.format,
            c.resolution,
            c.created_at
        ORDER BY c.release_date DESC NULLS LAST, c.created_at DESC
    """

    with conn.cursor() as cur:
        cur.execute(query, params)
        rows = cur.fetchall()

    return [
        ContentItem(
            contentId=str(row["content_id"]),
            contentOwnerId=str(row["content_owner_id"]),
            title=row["title"],
            description=row["description"],
            type=row["type"],
            releaseDate=row["release_date"].isoformat() if row["release_date"] else None,
            status=row["status"],
            storageUrl=row["storage_url"],
            format=row["format"],
            resolution=row["resolution"],
            createdAt=row["created_at"].isoformat(),
            averageRating=float(row["average_rating"]) if row["average_rating"] is not None else None,
            likeCount=int(row["like_count"]),
            partition=row["partition"],
        )
        for row in rows
    ]