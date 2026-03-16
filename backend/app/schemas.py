from pydantic import BaseModel


class CardData(BaseModel):
    id: str
    set_id: str
    irish: str
    english: str
    pronunciation: str
    example_sentence: str

    model_config = {"from_attributes": True}


class SetSummary(BaseModel):
    id: str
    title: str
    topic: str
    card_count: int
    created_at: str

    model_config = {"from_attributes": True}


class SetDetail(SetSummary):
    cards: list[CardData]


class GenerateRequest(BaseModel):
    topic: str
    count: int = 20
