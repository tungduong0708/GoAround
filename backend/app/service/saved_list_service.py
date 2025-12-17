"""Saved list CRUD operations."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Place, SavedList, SavedListItem
from app.schemas import (
    AddPlaceToListRequest,
    SavedListCreate,
    SavedListDetailSchema,
    SavedListItemSchema,
    SavedListItemWithPlace,
    SavedListSchema,
)
from app.service.place_service import _enrich_place_public


async def create_saved_list(
    session: AsyncSession, user_id: uuid.UUID, data: SavedListCreate
) -> SavedListSchema:
    """Create a new saved list for a user."""
    saved_list = SavedList(user_id=user_id, name=data.name)
    session.add(saved_list)
    await session.commit()
    await session.refresh(saved_list)
    return SavedListSchema.model_validate(saved_list)


async def list_saved_lists(
    session: AsyncSession, user_id: uuid.UUID, page: int, limit: int
) -> tuple[list[SavedListSchema], int]:
    """List all saved lists for a user with pagination."""
    base_query = select(SavedList.id).where(SavedList.user_id == user_id)
    total_res = await session.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = int(total_res.scalar() or 0)

    stmt = (
        select(SavedList, func.count(SavedListItem.place_id).label("item_count"))
        .outerjoin(SavedListItem, SavedList.id == SavedListItem.list_id)
        .where(SavedList.user_id == user_id)
        .group_by(SavedList.id)
        .order_by(SavedList.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    rows = (await session.execute(stmt)).all()
    data: list[SavedListSchema] = []
    for lst, item_count in rows:
        data.append(
            SavedListSchema(
                id=lst.id,
                name=lst.name,
                created_at=lst.created_at,
                item_count=int(item_count or 0),
            )
        )
    return data, total


async def get_saved_list(
    session: AsyncSession, user_id: uuid.UUID, list_id: uuid.UUID
) -> SavedListDetailSchema:
    """Get a saved list with all its items."""
    stmt = (
        select(SavedList)
        .options(
            selectinload(SavedList.items)
            .selectinload(SavedListItem.place)
            .selectinload(Place.tags)
        )
        .where(SavedList.id == list_id)
    )
    res = await session.execute(stmt)
    saved_list = res.scalars().first()
    if not saved_list or saved_list.user_id != user_id:
        raise ValueError("List not found or access denied")

    detailed_items = [
        {
            "place": _enrich_place_public(item.place),
            "saved_at": item.saved_at,
        }
        for item in saved_list.items
        if item.place is not None
    ]

    return SavedListDetailSchema(
        id=saved_list.id,
        name=saved_list.name,
        created_at=saved_list.created_at,
        items=[
            SavedListItemWithPlace(place=entry["place"], saved_at=entry["saved_at"])
            for entry in detailed_items
        ],
    )


async def add_place_to_list(
    session: AsyncSession,
    list_id: uuid.UUID,
    user_id: uuid.UUID,
    req: AddPlaceToListRequest,
) -> SavedListItemSchema:
    """Add a place to a saved list."""
    saved_list = await session.get(SavedList, list_id)
    if not saved_list or saved_list.user_id != user_id:
        raise ValueError("List not found or access denied")

    place = await session.get(Place, req.place_id)
    if not place:
        raise ValueError("Place not found")

    existing = await session.execute(
        select(SavedListItem).where(
            SavedListItem.list_id == list_id, SavedListItem.place_id == req.place_id
        )
    )
    if existing.scalars().first():
        raise ValueError("Place already in list")

    item = SavedListItem(list_id=list_id, place_id=req.place_id)
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return SavedListItemSchema.model_validate(item)


async def remove_place_from_list(
    session: AsyncSession, list_id: uuid.UUID, user_id: uuid.UUID, place_id: uuid.UUID
) -> None:
    """Remove a place from a saved list."""
    saved_list = await session.get(SavedList, list_id)
    if not saved_list or saved_list.user_id != user_id:
        raise ValueError("List not found or access denied")
    res = await session.execute(
        select(SavedListItem).where(
            SavedListItem.list_id == list_id, SavedListItem.place_id == place_id
        )
    )
    item = res.scalars().first()
    if not item:
        raise ValueError("Place not found in list")
    await session.delete(item)
    await session.commit()
