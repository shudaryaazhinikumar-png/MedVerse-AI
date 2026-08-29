from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings


client = None
database = None


async def connect_database():

    global client, database

    client = AsyncIOMotorClient(
        settings.MONGODB_URL
    )

    database = client[
        settings.DATABASE_NAME
    ]

    print("MongoDB connected")


async def close_database():

    global client

    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():

    return database