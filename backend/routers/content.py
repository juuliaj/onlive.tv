from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from mock_db import MOCK_CONTENT
from schemas import ContentItem
from security import get_current_user_claims

router = APIRouter(prefix="/content", tags=["Video Catalog"])


@router.get("", response_model=list[ContentItem])
def list_content(
    search: Optional[str] = Query(default=None, description="Filter by title, description, or genre"),
    type_filter: Optional[str] = Query(default=None, alias="type", description="Filter by genre/type"),
    _claims: dict = Depends(get_current_user_claims),
) -> list[ContentItem]:
    """
    Retrieves published videos from the catalog (simulating a Read Replica query).
    Input: Optional search string, optional type filter, valid Bearer JWT
    Output: List of matching ContentItem objects
    """
    results = [item for item in MOCK_CONTENT if item["status"] == "Published"]

    if type_filter and type_filter.lower() != "all":
        results = [item for item in results if item["type"].lower() == type_filter.lower()]

    if search:
        q = search.strip().lower()
        results = [
            item
            for item in results
            if q in item["title"].lower()
            or q in item["description"].lower()
            or q in item["type"].lower()
        ]

    return [ContentItem(**item) for item in results]


@router.get("/{content_id}", response_model=ContentItem)
def get_content_by_id(
    content_id: str,
    _claims: dict = Depends(get_current_user_claims),
) -> ContentItem:
    """
    Retrieves metadata for a single video by its ContentID.
    Input: content_id (str), valid Bearer JWT
    Output: ContentItem
    """
    item = next((c for c in MOCK_CONTENT if c["contentId"] == content_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found.")
    return ContentItem(**item)