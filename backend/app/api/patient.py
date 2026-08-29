from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)


@router.get("/profile")
async def profile(
    current_user=Depends(get_current_user)
):

    return {
        "message": "Patient profile API working",
        "user": current_user
    }