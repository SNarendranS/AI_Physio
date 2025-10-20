from fastapi import FastAPI
from models.pain_data import PainData
from models.exercise import ExerciseResponse, InnerExercise
from recommender.recommender import recommend_exercises
import uuid

app = FastAPI()

@app.post("/recommend", response_model=ExerciseResponse)
async def recommend_exercise(data: PainData):
    exercises = recommend_exercises(
        injury_place=data.injuryPlace,
        pain_level=data.painLevel,
        pain_type=data.painType
    )

    generated_exercises = []

    for ex in exercises:
        generated_exercises.append(
            InnerExercise(
                exerciseName=ex["exerciseName"],
                exerciseType=ex["exerciseType"],
                rep=ex.get("rep"),
                holdTime=ex.get("holdTime"),
                set=ex.get("set", 3),
                completedSets=0,
                targetArea=ex.get("targetArea"),
                difficulty=ex.get("difficulty", "easy"),
                equipmentNeeded=ex.get("equipmentNeeded", "None"),
                aiTrackingEnabled=ex.get("aiTrackingEnabled", True),
                description=ex.get("description", ""),
                demoVideo=ex.get("demoVideo", ""),
                image=ex.get("image", "")
            )
        )

    return ExerciseResponse(
        exercises=generated_exercises,
        progress=0
    )
