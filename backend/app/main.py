from fastapi import FastAPI

from app.database.mongodb import (
    connect_database,
    close_database
)
from app.routes import reports
from app.routes import auth
from app.api import patient
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="MedVerse AI",
    version="1.0.0"
)

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