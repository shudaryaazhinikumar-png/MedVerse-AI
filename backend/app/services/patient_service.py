from app.database.mongodb import get_database


async def create_patient_profile(
    user_id: str,
    data: dict
):

    db = get_database()


    existing = await db.patients.find_one(
        {
            "user_id": user_id
        }
    )


    if existing:
        return None


    data["user_id"] = user_id


    result = await db.patients.insert_one(
        data
    )


    return str(result.inserted_id)



async def get_patient_profile(
    user_id: str
):

    db = get_database()


    return await db.patients.find_one(
        {
            "user_id": user_id
        }
    )



async def update_patient_profile(
    user_id: str,
    data: dict
):

    db = get_database()


    await db.patients.update_one(
        {
            "user_id": user_id
        },
        {
            "$set": data
        }
    )