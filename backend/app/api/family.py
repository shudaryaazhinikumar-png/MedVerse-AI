from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/family",
    tags=["Family Members"]
)


# -----------------------------
# Request schema
# -----------------------------

class FamilyMemberCreate(BaseModel):
    name: str = Field(..., min_length=1)
    relationship: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=120)


# -----------------------------
# ADD FAMILY MEMBER
# -----------------------------

@router.post("/add")
async def add_family_member(
    member: FamilyMemberCreate,
    current_user=Depends(get_current_user)
):
    database = get_database()

    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid user information"
        )

    family_member = {
        "user_id": user_id,
        "name": member.name,
        "relationship": member.relationship,
        "age": member.age,
    }

    result = await database.family_members.insert_one(
        family_member
    )

    return {
        "message": "Family member added successfully",
        "member_id": str(result.inserted_id)
    }


# -----------------------------
# GET FAMILY MEMBERS
# -----------------------------

@router.get("/my-family")
async def get_family_members(
    current_user=Depends(get_current_user)
):
    database = get_database()

    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid user information"
        )

    members = await database.family_members.find(
        {"user_id": user_id}
    ).to_list(length=100)

    for member in members:
        member["_id"] = str(member["_id"])

    return {
        "members": members
    }


# -----------------------------
# DELETE FAMILY MEMBER
# -----------------------------

@router.delete("/{member_id}")
async def delete_family_member(
    member_id: str,
    current_user=Depends(get_current_user)
):
    database = get_database()

    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid user information"
        )

    if not ObjectId.is_valid(member_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid family member ID"
        )

    result = await database.family_members.delete_one(
        {
            "_id": ObjectId(member_id),
            "user_id": user_id
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Family member not found"
        )

    return {
        "message": "Family member deleted successfully"
    }