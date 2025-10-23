from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone
import os, re, spacy, difflib
import logging

# -----------------------------
# Setup logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI PainData Validator")

router = APIRouter(prefix="/ai", tags=["AI PainData Validator"])

# -----------------------------
# MongoDB setup
# -----------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "physio_ai")
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
pain_data_collection = db["painData"]
exercise_collection = db["exercises"]

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

def is_valid_description(text: str) -> bool:
    text = normalize_text(text)
    doc = nlp(text)
    words = [token.text for token in doc if is_real_word(token.text)]
    has_verb = any(token.pos_ == "VERB" for token in doc)
    return has_verb or len(words) >= 2

def is_similar_description(desc1: str, desc2: str, threshold: float = 0.85) -> bool:
    return difflib.SequenceMatcher(None, normalize_text(desc1), normalize_text(desc2)).ratio() >= threshold

async def get_exercise_progress(pain_data_id: str) -> float:
    exercises = await exercise_collection.find({"painDataId": pain_data_id}).to_list(length=100)
    if not exercises:
        return 100.0
    total_sets = sum(ex.get("set", 0) for ex in exercises)
    completed_sets = sum(ex.get("completedSets", 0) for ex in exercises)
    return (completed_sets / total_sets) * 100 if total_sets > 0 else 100.0

# -----------------------------
# Main endpoint
# -----------------------------
@router.post("/validatePainData")
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

    # Convert userId to ObjectId
    try:
        user_id_obj = ObjectId(data.userId)
        logger.info(f"userId converted to ObjectId: {user_id_obj}")
    except Exception as e:
        logger.error(f"Invalid userId format: {data.userId}, error: {e}")
        raise HTTPException(status_code=400, detail="Invalid userId format")

    # -----------------------------
    # Fetch existing records for user & injuryPlace
    # -----------------------------
    normalized_injury = normalize_text(data.injuryPlace)
    normalized_desc = normalize_text(data.description)

    existing_records = await pain_data_collection.find({
        "userId": user_id_obj,
        "injuryPlace": {"$regex": f"^{re.escape(normalized_injury)}$", "$options": "i"}
    }).to_list(length=100)

    logger.info(f"Fetched {len(existing_records)} existing records for user & injuryPlace")

    # -----------------------------
    # Check exact duplicates in Python (robust)
    # -----------------------------
    normalized_input_desc = normalize_text(data.description)
    input_pain_type = data.painType.strip().lower()
    input_pain_level = int(data.painLevel)

    for record in existing_records:
        rec_desc = normalize_text(record.get("description", ""))
        rec_type = record.get("painType", "").strip().lower()
        rec_level = int(record.get("painLevel", 0))

        logger.info(
            f"Comparing with record {record['_id']}: "
            f"desc='{rec_desc}', type='{rec_type}', level={rec_level}"
        )

        # Exact match check
        if rec_desc == normalized_input_desc and rec_type == input_pain_type and rec_level == input_pain_level:
            logger.warning(f"Exact duplicate found: {record}")
            raise HTTPException(
                status_code=409,
                detail="An identical pain record already exists."
            )

    logger.info("No exact duplicate found")


    # -----------------------------
    # Optional: Check similar duplicates (can pass)
    # -----------------------------
    for record in existing_records:
        existing_desc = record.get("description", "")
        description_similar = is_similar_description(existing_desc, data.description)
        type_match = record.get("painType", "").lower() == data.painType.lower()
        level_close = abs(record.get("painLevel", 0) - data.painLevel) <= 2
        logger.info(f"Checking similar record: {record['_id']}, desc_similar={description_similar}, type_match={type_match}, level_close={level_close}")

    logger.info("Validation complete: Unique pain data")
    return {"valid": True, "message": "Unique and valid pain data"}









