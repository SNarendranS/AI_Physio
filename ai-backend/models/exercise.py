from pydantic import BaseModel, Field
from typing import Optional, List

class InnerExercise(BaseModel):
    exerciseName: str
    exerciseType: str = Field(..., pattern="^(repetition|hold)$")
    rep: Optional[int] = None
    holdTime: Optional[int] = None
    set: int = 3
    completedSets: int = 0
    targetArea: Optional[str] = None
    difficulty: str = "easy"
    equipmentNeeded: str = "None"
    aiTrackingEnabled: bool = True
    description: Optional[str] = None
    demoVideo: Optional[str] = None
    image: Optional[str] = None  # base64 or URL

class ExerciseResponse(BaseModel):
    exercises: List[InnerExercise]
    progress: float = 0.0
