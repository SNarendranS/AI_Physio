from dotenv import load_dotenv
load_dotenv()

import os
import json
import uuid
from typing import List, Optional, Dict, Any

from fastapi import FastAPI
from pydantic import BaseModel
import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

app = FastAPI(title="Smart Clinician PureAI v10")

class AssessmentRequest(BaseModel):
    patient_id: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    chief_complaint: str
    pain_severity_0_10: Optional[int] = None
    history: Optional[str] = None
    goals: Optional[List[str]] = []
    extra_context: Optional[str] = None
    question_rounds: Optional[int] = 0

class Exercise(BaseModel):
    name: str
    description: str
    sets: str
    reps: str
    frequency: str
    precautions: str
    demo_video_url: Optional[str] = None
    demo_image_urls: Optional[List[str]] = None

class Plan(BaseModel):
    summary: str
    exercises: List[Exercise]

class AssessmentResponse(BaseModel):
    patient_id: str
    session_id: str
    triage: str
    reasons: List[str]
    follow_up_questions: Optional[List[str]]
    plan: Optional[Plan]

async def call_llm(prompt: str) -> Optional[str]:
    if not GROQ_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=40) as client:
            res = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0
                }
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"]
    except:
        return None

def extract_json(text: Optional[str]) -> Optional[dict]:
    if not text:
        return None
    text = text.strip()
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        return json.loads(text[start:end + 1])
    except:
        return None

async def ai_triage(req: AssessmentRequest) -> Dict[str, Any]:
    prompt = f"""
You are a senior clinician performing remote triage

Think carefully about red flags
Consider age, pain severity, neurological symptoms, trauma, fever

Return ONLY valid JSON
No explanation
No markdown

{{
 "triage": "safe_for_remote" | "needs_in_person" | "urgent_referral",
 "reasons": ["short clinical reasons"],
 "follow_up_questions": ["only if needed"]
}}

Patient data
{req.dict()}
"""
    raw = await call_llm(prompt)
    parsed = extract_json(raw)
    if parsed:
        return parsed
    return {
        "triage": "safe_for_remote",
        "reasons": ["Unable to assess red flags remotely defaulting to conservative care"],
        "follow_up_questions": []
    }

async def ai_plan(req: AssessmentRequest) -> Optional[Plan]:
    prompt = f"""
You are a licensed physiotherapy assistant

Generate a realistic home exercise plan
Match exercises to complaint and pain level
Avoid aggressive movements
Prefer mobility and posture work first

Media rules
Use real YouTube educational demos
Use direct jpg or png image URLs
If unsure set media fields to null
Do not invent links

Return ONLY valid JSON
No text outside JSON

{{
 "summary": "string",
 "exercises": [
  {{
   "name": "string",
   "description": "string",
   "sets": "string",
   "reps": "string",
   "frequency": "string",
   "precautions": "string",
   "demo_video_url": "https://youtube.com/...",
   "demo_image_urls": ["https://...jpg"]
  }}
 ]
}}

Patient data
{req.dict()}
"""
    raw = await call_llm(prompt)
    parsed = extract_json(raw)
    if not parsed:
        return None
    try:
        return Plan(**parsed)
    except:
        return None

def fallback_plan(req: AssessmentRequest) -> Plan:
    return Plan(
        summary="Basic gentle mobility plan due to limited AI output",
        exercises=[
            Exercise(
                name="Gentle Neck Mobility",
                description="Slow pain free neck movement within comfort range",
                sets="2",
                reps="10",
                frequency="2x daily",
                precautions="Stop if pain increases or neurological symptoms appear",
                demo_video_url=None,
                demo_image_urls=None
            )
        ]
    )

@app.post("/assess", response_model=AssessmentResponse)
async def assess(req: AssessmentRequest):
    req.patient_id = req.patient_id or str(uuid.uuid4())
    session_id = str(uuid.uuid4())

    triage = await ai_triage(req)
    label = triage.get("triage", "safe_for_remote")

    if label == "urgent_referral":
        return AssessmentResponse(
            patient_id=req.patient_id,
            session_id=session_id,
            triage=label,
            reasons=triage.get("reasons", []),
            follow_up_questions=triage.get("follow_up_questions", []),
            plan=None
        )

    plan = await ai_plan(req)
    if not plan:
        plan = fallback_plan(req)

    return AssessmentResponse(
        patient_id=req.patient_id,
        session_id=session_id,
        triage=label,
        reasons=triage.get("reasons", []),
        follow_up_questions=triage.get("follow_up_questions", []),
        plan=plan
    )

@app.get("/health")
def health():
    return {"status": "ok"}
