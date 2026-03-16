from sqlalchemy import Column, String, Integer, ForeignKey

from app.database import Base


class FlashcardSet(Base):
    __tablename__ = "flashcard_sets"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    card_count = Column(Integer, nullable=False, default=0)
    created_at = Column(String, nullable=False)


class Card(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True)
    set_id = Column(String, ForeignKey("flashcard_sets.id", ondelete="CASCADE"), nullable=False)
    irish = Column(String, nullable=False)
    english = Column(String, nullable=False)
    pronunciation = Column(String, nullable=False, default="")
    example_sentence = Column(String, nullable=False, default="")
