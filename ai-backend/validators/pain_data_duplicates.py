# validators/pain_data_duplicates.py

from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from models.pain_data import PainData
import os, re, logging
from sentence_transformers import SentenceTransformer, util
from rapidfuzz import fuzz
from datetime import datetime, timezone, timedelta

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
PAINDATA_COLL = os.getenv("PAINDATA_COLL")
EXERCISE_COLL = os.getenv("EXERCISES_COLL")

if not all([MONGO_URI, DB_NAME, PAINDATA_COLL]):
    raise RuntimeError("❌ Missing environment variables. Check your .env file.")

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
pain_data_collection = db[PAINDATA_COLL]
exercise_collection = db[EXERCISE_COLL]

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
    text = re.sub(r"[^a-zA-Z\s]", "", text.lower().strip())
    text = re.sub(r"\s+", " ", text)
    return text

def dynamic_threshold(desc: str) -> float:
    word_count = len(desc.split())
    if word_count <= 5:
        return 0.70
    elif word_count <= 10:
        return 0.75
    return 0.80

def is_similar_description(desc1: str, desc2: str) -> bool:
    if not desc1 or not desc2:
        return False

    desc1_norm, desc2_norm = normalize_text(desc1), normalize_text(desc2)
    embeddings = model.encode([desc1_norm, desc2_norm])
    semantic_sim = util.cos_sim(embeddings[0], embeddings[1]).item()
    fuzzy_sim = fuzz.token_set_ratio(desc1_norm, desc2_norm) / 100
    threshold = dynamic_threshold(desc1_norm)

    logger.info(
        f"Comparing:\n'{desc1_norm}' ↔ '{desc2_norm}' | "
        f"semantic={semantic_sim:.2f}, fuzzy={fuzzy_sim:.2f}, threshold={threshold:.2f}"
    )
    return semantic_sim >= threshold or fuzzy_sim >= threshold

# -----------------------------
# Endpoint
# -----------------------------
@router.post("/")
async def check_duplicates(request: Request):
    logger.info("📩 Received request to check duplicates")

    try:
        body = await request.json()
        data = PainData(**body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid data format: {e}")

    user_email = data.userEmail.lower().strip()
    normalized_injury = normalize_text(data.injuryPlace)
    normalized_desc = normalize_text(data.description or "")

    all_records = await pain_data_collection.find({"userEmail": user_email}).to_list(length=500)
    filtered_records = [r for r in all_records if normalize_text(r.get("injuryPlace", "")) == normalized_injury]

    # ✅ Step 1: Direct duplicates
    for record in filtered_records:
        if normalize_text(record.get("description") or "") == normalized_desc:
            raise HTTPException(
                status_code=409,
                detail="Duplicate pain data entry found (same injury & description).",
                headers={"matchedPainDataId": str(record["_id"])}
            )

    # ✅ Step 2: Doctor-like logic (smart check)
    for record in filtered_records:
        desc = record.get("description") or ""
        if is_similar_description(desc, data.description or ""):
            record_time = record.get("createdAt")
            if record_time:
                record_time = record_time.replace(tzinfo=timezone.utc)
                days_diff = (datetime.now(timezone.utc) - record_time).days

                if days_diff < 7:
                    raise HTTPException(
                        status_code=409,
                        detail=f"This pain seems too recent ({days_diff} days ago). Try updating your exercises instead.",
                        headers={"matchedPainDataId": str(record["_id"])}
                    )

            # 🧩 Fetch exercise progress for this pain data
            linked_exercise = await exercise_collection.find_one({"painDataId": record["_id"]})
            if linked_exercise:
                progress = linked_exercise.get("progressPercent", 0)
                updated_at = linked_exercise.get("updatedAt")
                hours_diff = 999
                if updated_at:
                    updated_at = updated_at.replace(tzinfo=timezone.utc)
                    hours_diff = (datetime.now(timezone.utc) - updated_at).total_seconds() / 3600

                if progress < 100 or hours_diff < 2:
                    raise HTTPException(
                        status_code=409,
                        detail="Exercise routine for this pain is still ongoing. Please complete it before logging new pain data.",
                        headers={"matchedPainDataId": str(record["_id"])}
                    )

    logger.info("✅ No duplicates or ongoing pains found.")
    return {"valid": True, "message": "No duplicate or overlapping pain entries detected."}
