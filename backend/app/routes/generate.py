import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app import models, schemas

router = APIRouter()

# Mock flashcard bank — sampled to fill any request
_MOCK_CARDS = [
    {"irish": "Dia dhuit", "english": "Hello (to one person)", "pronunciation": "JEE-ah gwitch", "example_sentence": "Dia dhuit, cén chaoi a bhfuil tú?"},
    {"irish": "Dia is Muire dhuit", "english": "Hello (reply)", "pronunciation": "JEE-ah iss MWIR-ah gwitch", "example_sentence": "Dia is Muire dhuit, táim go maith."},
    {"irish": "Conas atá tú?", "english": "How are you?", "pronunciation": "KUN-us ah-TAW too", "example_sentence": "Conas atá tú inniu?"},
    {"irish": "Táim go maith", "english": "I am well", "pronunciation": "TAW-im guh MAH", "example_sentence": "Táim go maith, go raibh maith agat."},
    {"irish": "Go raibh maith agat", "english": "Thank you", "pronunciation": "guh ROH mah AH-gut", "example_sentence": "Go raibh maith agat as ucht do chabhair."},
    {"irish": "Le do thoil", "english": "Please", "pronunciation": "leh duh HUL", "example_sentence": "An féidir leat cabhrú liom, le do thoil?"},
    {"irish": "Tá brón orm", "english": "I am sorry", "pronunciation": "TAW brohn OR-um", "example_sentence": "Tá brón orm go raibh mé déanach."},
    {"irish": "Gabh mo leithscéal", "english": "Excuse me", "pronunciation": "GOV muh LEH-shkale", "example_sentence": "Gabh mo leithscéal, cá bhfuil an leithreas?"},
    {"irish": "Slán", "english": "Goodbye", "pronunciation": "SLAWN", "example_sentence": "Slán leat, feicfidh mé amárach thú."},
    {"irish": "Slán abhaile", "english": "Safe home", "pronunciation": "SLAWN ah-WAL-yeh", "example_sentence": "Slán abhaile, a chara."},
    {"irish": "Cén t-ainm atá ort?", "english": "What is your name?", "pronunciation": "kayn TAN-im ah-TAW ort", "example_sentence": "Cén t-ainm atá ort, a stór?"},
    {"irish": "Is mise ...", "english": "I am ... (introducing yourself)", "pronunciation": "iss MISH-eh", "example_sentence": "Is mise Seán, agus is as Gaillimh mé."},
    {"irish": "Cá bhfuil tú i do chónaí?", "english": "Where do you live?", "pronunciation": "kaw WILL too ih duh KHOH-nee", "example_sentence": "Cá bhfuil tú i do chónaí faoi láthair?"},
    {"irish": "Is as ... mé", "english": "I am from ...", "pronunciation": "iss oss ... may", "example_sentence": "Is as Baile Átha Cliath mé."},
    {"irish": "Lá maith", "english": "Good day", "pronunciation": "LAW mah", "example_sentence": "Lá maith agat, a chara."},
    {"irish": "Oíche mhaith", "english": "Good night", "pronunciation": "EE-heh WAH", "example_sentence": "Oíche mhaith, codladh sámh."},
    {"irish": "Maidin mhaith", "english": "Good morning", "pronunciation": "MAH-jin WAH", "example_sentence": "Maidin mhaith, conas a chodail tú?"},
    {"irish": "Tráthnóna maith", "english": "Good evening/afternoon", "pronunciation": "TRAW-noh-nah mah", "example_sentence": "Tráthnóna maith duit, a mhúinteoir."},
    {"irish": "Tá", "english": "Yes (it is)", "pronunciation": "TAW", "example_sentence": "Tá, is maith liom é."},
    {"irish": "Níl", "english": "No (it is not)", "pronunciation": "NEEL", "example_sentence": "Níl, níl sé anseo."},
    {"irish": "Is maith liom", "english": "I like", "pronunciation": "iss MAH lum", "example_sentence": "Is maith liom ceol traidisiúnta."},
    {"irish": "Ní maith liom", "english": "I don't like", "pronunciation": "nee MAH lum", "example_sentence": "Ní maith liom aimsir fhuar."},
    {"irish": "An féidir leat?", "english": "Can you?", "pronunciation": "un FAY-dir lyat", "example_sentence": "An féidir leat Gaeilge a labhairt?"},
    {"irish": "Ní thuigim", "english": "I don't understand", "pronunciation": "nee HIG-im", "example_sentence": "Ní thuigim, an féidir leat é a rá arís?"},
    {"irish": "Tuigim", "english": "I understand", "pronunciation": "TIG-im", "example_sentence": "Tuigim anois, go raibh maith agat."},
    {"irish": "Labhair níos moille", "english": "Speak more slowly", "pronunciation": "LOW-ir nees MWIL-eh", "example_sentence": "An féidir leat labhairt níos moille, le do thoil?"},
    {"irish": "Cé mhéad?", "english": "How much?", "pronunciation": "kay VAYD", "example_sentence": "Cé mhéad atá ar an leabhar seo?"},
    {"irish": "Cá bhfuil...?", "english": "Where is...?", "pronunciation": "kaw WILL", "example_sentence": "Cá bhfuil an stáisiún traenach?"},
    {"irish": "Cén uair?", "english": "What time? / When?", "pronunciation": "kayn OO-ir", "example_sentence": "Cén uair a thosaíonn an scannán?"},
    {"irish": "Inniu", "english": "Today", "pronunciation": "IN-yoo", "example_sentence": "Tá an aimsir go hálainn inniu."},
    {"irish": "Amárach", "english": "Tomorrow", "pronunciation": "ah-MAW-rukh", "example_sentence": "Feicfidh mé thú amárach."},
    {"irish": "Inné", "english": "Yesterday", "pronunciation": "in-YAY", "example_sentence": "Bhí mé tuirseach inné."},
    {"irish": "Anois", "english": "Now", "pronunciation": "ah-NISH", "example_sentence": "Caithfidh mé imeacht anois."},
    {"irish": "Uisce", "english": "Water", "pronunciation": "ISH-keh", "example_sentence": "Ba mhaith liom gloine uisce, le do thoil."},
    {"irish": "Bia", "english": "Food", "pronunciation": "BEE-ah", "example_sentence": "Tá an bia seo an-bhlasta."},
    {"irish": "Arán", "english": "Bread", "pronunciation": "ah-RAWN", "example_sentence": "Cheannaigh mé arán sa siopa."},
    {"irish": "Bainne", "english": "Milk", "pronunciation": "BON-yeh", "example_sentence": "An bhfuil bainne agat don tae?"},
    {"irish": "Tae", "english": "Tea", "pronunciation": "TAY", "example_sentence": "Ba mhaith liom cupán tae."},
    {"irish": "Caife", "english": "Coffee", "pronunciation": "KAF-eh", "example_sentence": "Ólaim caife ar maidin."},
    {"irish": "Teach", "english": "House", "pronunciation": "CHAHKH", "example_sentence": "Is mór an teach é."},
    {"irish": "Scoil", "english": "School", "pronunciation": "SKWIL", "example_sentence": "Téann na páistí ar scoil gach lá."},
    {"irish": "Leabhar", "english": "Book", "pronunciation": "LYOW-ur", "example_sentence": "Tá leabhar maith á léamh agam."},
    {"irish": "Peann", "english": "Pen", "pronunciation": "PYOWN", "example_sentence": "An féidir liom do pheann a fháil ar iasacht?"},
    {"irish": "Madra", "english": "Dog", "pronunciation": "MAH-druh", "example_sentence": "Tá madra mór ag mo chomharsa."},
    {"irish": "Cat", "english": "Cat", "pronunciation": "KAHT", "example_sentence": "Tá cat bán ag mo dheirfiúr."},
    {"irish": "Éan", "english": "Bird", "pronunciation": "AY-un", "example_sentence": "Tá éan álainn sa ghairdín."},
    {"irish": "Crann", "english": "Tree", "pronunciation": "KRAWN", "example_sentence": "Tá crann mór sa pháirc."},
    {"irish": "Abhainn", "english": "River", "pronunciation": "OW-in", "example_sentence": "Tá an abhainn an-ghlan sa Ghaeltacht."},
    {"irish": "Muir", "english": "Sea", "pronunciation": "MWIR", "example_sentence": "Is breá liom siúl cois na mara."},
    {"irish": "Trá", "english": "Beach", "pronunciation": "TRAW", "example_sentence": "Théamar go dtí an trá Dé Sathairn."},
]


def _mock_generate(topic: str, count: int) -> dict:
    pool = _MOCK_CARDS * (count // len(_MOCK_CARDS) + 1)
    selected = random.sample(pool, min(count, len(pool)))[:count]
    return {
        "title": f"{topic.title()} — Gaeilge Flashcards",
        "cards": selected,
    }


@router.post("/generate", response_model=schemas.SetDetail)
async def generate_set(request: schemas.GenerateRequest, db: AsyncSession = Depends(get_db)):
    data = _mock_generate(request.topic, request.count)

    set_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db_set = models.FlashcardSet(
        id=set_id,
        title=data["title"],
        topic=request.topic,
        card_count=len(data["cards"]),
        created_at=now,
    )
    db.add(db_set)
    await db.flush()

    db_cards = []
    for c in data["cards"]:
        card = models.Card(
            id=str(uuid.uuid4()),
            set_id=set_id,
            irish=c.get("irish", ""),
            english=c.get("english", ""),
            pronunciation=c.get("pronunciation", ""),
            example_sentence=c.get("example_sentence", ""),
        )
        db.add(card)
        db_cards.append(card)

    await db.commit()

    return schemas.SetDetail(
        id=set_id,
        title=db_set.title,
        topic=db_set.topic,
        card_count=db_set.card_count,
        created_at=now,
        cards=[
            schemas.CardData(
                id=c.id,
                set_id=c.set_id,
                irish=c.irish,
                english=c.english,
                pronunciation=c.pronunciation,
                example_sentence=c.example_sentence,
            )
            for c in db_cards
        ],
    )
