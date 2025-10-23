#validators/pain_data_validation.py


from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import re, spacy, logging
from spellchecker import SpellChecker

# -----------------------------
# Setup logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PainData Validation")

router = APIRouter(prefix="/ai/validate", tags=["PainData Validation"])

# -----------------------------
# Load SpaCy model
# -----------------------------
nlp = spacy.load("en_core_web_sm")

# -----------------------------
# Constants
# -----------------------------
VALID_INJURY_PLACES = [
    "head","neck","shoulder","elbow","wrist","hand","finger",
    "chest","back","hip","thigh","knee","leg","ankle","foot","toe"
]

# -----------------------------
# Pydantic model
# -----------------------------
class PainData(BaseModel):
    userId: str
    injuryPlace: str
    painType: str
    painLevel: int
    description: str

# -----------------------------
# Helper functions
# -----------------------------
def normalize_text(text: str) -> str:
    text = re.sub(r"[^a-zA-Z\s]", "", text.lower().strip())
    text = re.sub(r"\s+", " ", text)
    return text

def is_real_word(token_text: str) -> bool:
    from spacy.lang.en.stop_words import STOP_WORDS
    token_text = token_text.lower()
    return token_text.isalpha() and token_text not in STOP_WORDS


spell = SpellChecker(distance=1)  # distance=1 allows small typos

def is_valid_description(text: str) -> bool:
    """
    Returns True if the text is a meaningful English sentence/phrase.
    Rejects gibberish like "egrgr" or "asdkfj".
    Allows minor spelling mistakes and small typos.
    """
    text = text.strip()
    if len(text) < 3:
        return False  # too short to be meaningful

    # Normalize
    normalized = re.sub(r"[^a-zA-Z\s]", " ", text.lower())
    tokens = [t for t in normalized.split() if t]

    if len(tokens) < 1:
        return False

    # Check dictionary words ratio
    correct_words = 0
    for token in tokens:
        candidates = spell.candidates(token)
        if token in spell or (candidates is not None and len(candidates) > 0):
            correct_words += 1

    # Reject if fewer than 2 dictionary words
    if correct_words < 2:
        return False

    # Also parse with SpaCy to check for verbs/nouns
    doc = nlp(text)
    has_verb_or_noun = any(tok.pos_ in ("VERB", "NOUN", "PROPN") for tok in doc)

    # Accept only if at least 2 dictionary words AND has a verb/noun
    return correct_words >= 2 and has_verb_or_noun


# -----------------------------
# Endpoint
# -----------------------------
@router.post("/")
async def validate_pain_data(request: Request):
    logger.info("📩 Received request to validate pain data")
    try:
        body = await request.json()
        logger.info(f"Received body: {body}")
    except Exception as e:
        logger.error(f"Failed to parse JSON body: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Validate Pydantic model
    try:
        data = PainData(**body)
        logger.info(f"Pydantic validation passed: {data}")
    except Exception as e:
        logger.error(f"Pydantic validation failed: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid data format: {str(e)}")

    # Injury place validation
    if data.injuryPlace.lower() not in VALID_INJURY_PLACES:
        logger.warning(f"Invalid injury place: {data.injuryPlace}")
        raise HTTPException(status_code=400, detail="Invalid injury place")

    # Description validation
    if not is_valid_description(data.description):
        logger.warning(f"Invalid description: {data.description}")
        raise HTTPException(
            status_code=400,
            detail="Invalid description — must be a meaningful English sentence"
        )

    logger.info("Validation complete: Injury place and description are valid")
    return {"valid": True, "message": "Injury place and description are valid"}
