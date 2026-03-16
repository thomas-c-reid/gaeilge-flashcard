from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/sets", response_model=list[schemas.SetSummary])
async def list_sets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.FlashcardSet).order_by(models.FlashcardSet.created_at.desc())
    )
    return result.scalars().all()


@router.get("/sets/{set_id}", response_model=schemas.SetDetail)
async def get_set(set_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.FlashcardSet).where(models.FlashcardSet.id == set_id)
    )
    db_set = result.scalar_one_or_none()
    if not db_set:
        raise HTTPException(status_code=404, detail="Set not found")

    cards_result = await db.execute(
        select(models.Card).where(models.Card.set_id == set_id)
    )
    cards = cards_result.scalars().all()

    return schemas.SetDetail(
        id=db_set.id,
        title=db_set.title,
        topic=db_set.topic,
        card_count=db_set.card_count,
        created_at=db_set.created_at,
        cards=[
            schemas.CardData(
                id=c.id,
                set_id=c.set_id,
                irish=c.irish,
                english=c.english,
                pronunciation=c.pronunciation,
                example_sentence=c.example_sentence,
            )
            for c in cards
        ],
    )
