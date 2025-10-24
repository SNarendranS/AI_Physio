# models/pain_data.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # make sure .env is loaded

def get_allowed_pain_types():
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DB_NAME")]
    meta_collection = db[os.getenv("METADATA_COLL")]
    meta = meta_collection.find_one({"dataName": "pain_types"})
    if meta and "data" in meta:
        return meta["data"]
    return []

class DoctorSlip(BaseModel):
    data: Optional[bytes] = None
    contentType: Optional[str] = None

class PainData(BaseModel):
    userId: str
    userEmail: str
    injuryPlace: str
    painType: str  # we will validate dynamically
    painLevel: int = Field(ge=1, le=10, description="Pain level between 1 (mild) and 10 (severe)")
    description: Optional[str] = None
    doctorSlip: Optional[DoctorSlip] = None

    @validator("painType")
    def validate_pain_type(cls, v):
        allowed = get_allowed_pain_types()
        if v not in allowed:
            raise ValueError(f"painType must be one of {allowed}")
        return v
