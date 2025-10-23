# validators/pain_data_duplicates.py

from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from models.pain_data import PainData
import os, re, logging
from sentence_transformers import SentenceTransformer, util
from rapidfuzz import fuzz

# -----------------------------
# Setup logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PainData Duplicates")

router = APIRouter(prefix="/ai/checkDuplicates", tags=["PainData Duplicates"])

# -----------------------------
# MongoDB setup
# -----------------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLL_NAME = os.getenv("COLL_NAME_PAINDATA")

if not all([MONGO_URI, DB_NAME, COLL_NAME]):
    raise RuntimeError("❌ Missing environment variables. Check your .env file.")

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
pain_data_collection = db[COLL_NAME]

# -----------------------------
# Load Semantic Model once
# -----------------------------
logger.info("Loading SentenceTransformer model (paraphrase-mpnet-base-v2)...")
model = SentenceTransformer("paraphrase-mpnet-base-v2")
logger.info("Model loaded successfully.")

# -----------------------------
# Helper functions
# -----------------------------
def normalize_text(text: str) -> str:
    """Lowercase, remove punctuation, and extra spaces"""
    text = re.sub(r"[^a-zA-Z\s]", "", text.lower().strip())
    text = re.sub(r"\s+", " ", text)
    return text

def dynamic_threshold(desc: str) -> float:
    """Lower threshold for short descriptions"""
    word_count = len(desc.split())
    if word_count <= 5:
        return 0.75
    elif word_count <= 10:
        return 0.8
    return 0.85

def is_similar_description(desc1: str, desc2: str) -> bool:
    """Hybrid similarity: semantic embeddings + fuzzy ratio"""
    if not desc1 or not desc2:
        return False

    desc1_norm = normalize_text(desc1)
    desc2_norm = normalize_text(desc2)

    # 1️⃣ Semantic similarity
    embeddings = model.encode([desc1_norm, desc2_norm])
    semantic_sim = util.cos_sim(embeddings[0], embeddings[1]).item()

    # 2️⃣ Fuzzy token ratio (better for short strings)
    fuzzy_sim = fuzz.token_set_ratio(desc1_norm, desc2_norm) / 100

    # 3️⃣ Determine threshold dynamically
    threshold = dynamic_threshold(desc1_norm)

    logger.info(
        f"Comparing descriptions:\n"
        f"'{desc1_norm}' ↔ '{desc2_norm}' | semantic={semantic_sim:.2f}, fuzzy={fuzzy_sim:.2f}, threshold={threshold:.2f}"
    )

    return semantic_sim >= threshold or fuzzy_sim >= threshold

# -----------------------------
# Endpoint
# -----------------------------
@router.post("/")
async def check_duplicates(request: Request):
    logger.info("📩 Received request to check duplicates")

    # Parse request
    try:
        body = await request.json()
        data = PainData(**body)
        logger.info(f"Parsed PainData: {data}")
    except Exception as e:
        logger.error(f"Invalid data format: {e}")
        raise HTTPException(status_code=400, detail="Invalid data format")

    user_email = data.userEmail.lower().strip()
    normalized_injury = normalize_text(data.injuryPlace)
    normalized_desc = normalize_text(data.description or "")

    logger.info(f"Normalized input: email='{user_email}', injuryPlace='{normalized_injury}', description='{normalized_desc}'")

    # Fetch all records for this user
    all_records = await pain_data_collection.find({"userEmail": user_email}).to_list(length=500)
    logger.info(f"Fetched {len(all_records)} records for user '{user_email}'")

    # Filter by injuryPlace (case-insensitive)
    filtered_records = [r for r in all_records if normalize_text(r.get("injuryPlace", "")) == normalized_injury]
    logger.info(f"Records matching injuryPlace '{normalized_injury}': {len(filtered_records)}")

    # 1️⃣ Exact duplicate check
    for record in filtered_records:
        rec_desc = normalize_text(record.get("description") or "")
        rec_type = record.get("painType", "").strip().lower()
        rec_level = int(record.get("painLevel") or 0)

        if rec_desc == normalized_desc and rec_type == data.painType.strip().lower() and rec_level == data.painLevel:
            logger.warning(f"⚠️ Exact duplicate found with _id={record['_id']}")
            raise HTTPException(
                status_code=409,
                detail="An identical pain record already exists (same description, painType, and painLevel)."
            )

    # 2️⃣ Similar / near-duplicate check
    for record in filtered_records:
        existing_desc = record.get("description") or ""
        existing_type = record.get("painType", "").lower()
        existing_level = int(record.get("painLevel") or 0)

        if is_similar_description(existing_desc, data.description or "") and \
           existing_type == data.painType.lower() and \
           abs(existing_level - data.painLevel) <= 2:
            logger.warning(f"⚠️ Similar pain data found with _id={record['_id']}")
            raise HTTPException(
                status_code=409,
                detail=f"A similar pain record already exists: '{existing_desc}' (injuryPlace='{record.get('injuryPlace')}')."
            )

    logger.info("✅ No duplicates found")
    return {
        "valid": True,
        "message": "No exact or similar duplicates found."
    }