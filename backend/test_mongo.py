import asyncio

from app.database import get_database
from app.database.mongodb import connect_database


async def test():

    await connect_database()

    db = get_database()

    user = {
        "name": "Test User",
        "email": "test@gmail.com",
        "password": "123456",
        "role": "patient"
    }

    result = await db.users.insert_one(user)

    print("Inserted ID:", result.inserted_id)


asyncio.run(test())