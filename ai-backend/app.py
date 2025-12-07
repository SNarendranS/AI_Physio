from dotenv import load_dotenv
load_dotenv()

import os
import json
import uuid
import asyncio
from typing import List, Optional, Dict, Any

from fastapi import FastAPI
from pydantic import BaseModel
import httpx

# ================= CONFIG =================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

app = FastAPI(title="Smart Clinician PureAI v8")

# ================= MODELS =================
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

# ================= CORE LLM CALL =================
async def call_llm(prompt: str) -> Optional[str]:
    if not GROQ_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={"model": MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0}
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"].strip()
    except:
        return None

# ================= FALLBACK PLAN =================
def fallback_plan(req: AssessmentRequest) -> Plan:
    text = f"{req.chief_complaint} {req.extra_context}".lower()

    if "neck" in text:
        area = "neck"
        moves = [("Neck Rolls", "Slow circular head rotation"), ("Chin Tucks", "Draw chin backward slowly")]
    elif "knee" in text:
        area = "knee"
        moves = [("Quad Sets", "Tighten thigh muscle"), ("Heel Slides", "Slide heel toward body slowly")]
    elif "back" in text:
        area = "back"
        moves = [("Pelvic Tilts", "Flatten lower back gently"), ("Cat-Cow", "Slow spine flexion/extension")]
    elif "shoulder" in text:
        area = "shoulder"
        moves = [("Shoulder Rolls", "Slow circular rolls"), ("Wall Slides", "Slide arms up wall")]
    else:
        area = "general"
        moves = [("Gentle Mobility", "Move joints slowly"), ("Deep Breathing", "Slow nasal breathing")]

    exercises = []
    for n, d in moves:
        exercises.append(Exercise(
            name=n,
            description=d,
            sets="3",
            reps="10",
            frequency="2x daily",
            precautions="Stop if sharp pain, numbness, or dizziness."
        ))

    return Plan(
        summary=f"Conservative self-care plan for {area} discomfort.",
        exercises=exercises
    )

# ================= AI TRIAGE =================
async def ai_triage(req: AssessmentRequest) -> Dict[str, Any]:
    prompt = f"""
You are a senior clinician.

ONLY return JSON:
{{
 "triage": "safe_for_remote" | "needs_in_person" | "urgent_referral",
 "reasons": ["..."],
 "follow_up_questions": ["..."]
}}

Case:
{req.dict()}
"""
    raw = await call_llm(prompt)
    if not raw:
        return {"triage": "safe_for_remote", "reasons": ["AI unavailable – conservative approach"], "follow_up_questions": []}

    try:
        return json.loads(raw)
    except:
        return {"triage": "safe_for_remote", "reasons": ["AI recovery mode – conservative approach"], "follow_up_questions": []}

# ================= AI PLAN GENERATOR =================
async def ai_plan(req: AssessmentRequest) -> Optional[Plan]:
    prompt = f"""
Return ONLY JSON:

{{
 "summary": "...",
 "exercises": [
  {{"name":"...","description":"...","sets":"...","reps":"...","frequency":"...","precautions":"..."}}
 ]
}}

Patient:
{req.dict()}
"""

    raw = await call_llm(prompt)
    if not raw:
        return None

    try:
        return Plan(**json.loads(raw))
    except:
        return None

# ================= MAIN ENDPOINT =================
@app.post("/assess", response_model=AssessmentResponse)
async def assess(req: AssessmentRequest):
    req.patient_id = req.patient_id or str(uuid.uuid4())
    session_id = str(uuid.uuid4())

    triage = await ai_triage(req)
    label = triage.get("triage", "safe_for_remote")

    # Hard block only if AI explicitly says so
    if label == "urgent_referral":
        return AssessmentResponse(
            patient_id=req.patient_id,
            session_id=session_id,
            triage="urgent_referral",
            reasons=triage.get("reasons", []),
            follow_up_questions=triage.get("follow_up_questions", []),
            plan=None
        )

    # If AI wants in-person, still give gentle plan
    if label == "needs_in_person":
        plan = await ai_plan(req) or fallback_plan(req)
        return AssessmentResponse(
            patient_id=req.patient_id,
            session_id=session_id,
            triage="needs_in_person",
            reasons=triage.get("reasons", []),
            follow_up_questions=triage.get("follow_up_questions", []),
            plan=plan
        )

    # Safe → always guaranteed exercises
    plan = await ai_plan(req) or fallback_plan(req)

    return AssessmentResponse(
        patient_id=req.patient_id,
        session_id=session_id,
        triage="safe_for_remote",
        reasons=triage.get("reasons", []),
        follow_up_questions=triage.get("follow_up_questions", []),
        plan=plan
    )

@app.get("/health")
def health():
    return {"status": "ok"}
