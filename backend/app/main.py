from fastapi import FastAPI
from app.api.progress import router as progress_router
from app.database.mongodb import (
    connect_database,
    close_database
)
from app.routes import reports
from app.routes import auth
from app.api import patient
from app.api import analysis
from fastapi.middleware.cors import CORSMiddleware
from app.api import family
app = FastAPI(
    title="MedVerse AI",
    version="1.0.0"
)
from app.api import chatbot
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(
    patient.router
)


app.include_router(
    auth.router
)

app.include_router(
    reports.router
)
app.include_router(
    analysis.router
)
app.include_router(family.router)
app.include_router(progress_router)
app.include_router(chatbot.router)
@app.on_event("startup")
async def startup():

    await connect_database()


@app.on_event("shutdown")
async def shutdown():

    await close_database()


@app.get("/")
def home():

    return {
        "message": "MedVerse AI API Running"
    }