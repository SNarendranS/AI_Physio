from fastapi import FastAPI
from validators.pain_data_validation import router as pain_validation_router
from validators.pain_data_duplicates import router as pain_duplicates_router
from recommender.recommend_router import router as recommend_router

app = FastAPI(title="AI Physio Backend")

# Include routers
app.include_router(pain_validation_router)
app.include_router(pain_duplicates_router)
app.include_router(recommend_router)
