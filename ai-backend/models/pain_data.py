#models/pain_data.py


from pydantic import BaseModel, Field
from typing import Optional, Literal

class DoctorSlip(BaseModel):
    data: Optional[bytes] = None
    contentType: Optional[str] = None


class PainData(BaseModel):
    userId: str
    userEmail:str
    injuryPlace: str
    painType: Literal[
        "sharp",
        "dull",
        "throbbing",
        "burning",
        "stiffness",
        "aching",
        "radiating",
        "cramping",
        "tingling"
    ]
    painLevel: int = Field(ge=1, le=10, description="Pain level between 1 (mild) and 10 (severe)")
    description: Optional[str] = None
    doctorSlip: Optional[DoctorSlip] = None
