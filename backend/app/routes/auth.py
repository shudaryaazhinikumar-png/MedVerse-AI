from fastapi import APIRouter, HTTPException

from app.utils.jwt import (
    create_access_token,
    create_password_reset_token,
    decode_password_reset_token
)

from app.database.mongodb import get_database

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
    ChangePassword,
    ForgotPasswordRequest,
    ResetPassword
)

from app.services.auth_service import (
    hash_password,
    verify_password
)

from app.services.email_service import (
    send_password_reset_email
)

from app.core.config import settings


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -------------------------
# REGISTER USER
# -------------------------

@router.post("/register")
async def register(user: UserRegister):

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": user.email
        }
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_document = {

        "name": user.name,

        "email": user.email,

        "password_hash":
            hash_password(user.password),

        "role": user.role
    }

    result = await db.users.insert_one(
        user_document
    )

    return {

        "message":
            "User created successfully",

        "user_id":
            str(result.inserted_id)
    }


# -------------------------
# LOGIN USER
# -------------------------

@router.post("/login")
async def login(user: UserLogin):

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": user.email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    password_match = verify_password(
        user.password,
        existing_user["password_hash"]
    )

    if not password_match:

        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    access_token = create_access_token(
        {
            "user_id":
                str(existing_user["_id"]),

            "email":
                existing_user["email"],

            "role":
                existing_user["role"]
        }
    )

    return {

        "message":
            "Login successful",

        "access_token":
            access_token,

        "token_type":
            "bearer"
    }


# -------------------------
# CHANGE PASSWORD
# -------------------------

@router.post("/change-password")
async def change_password(
    user: ChangePassword
):

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": user.email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    password_match = verify_password(
        user.current_password,
        existing_user["password_hash"]
    )

    if not password_match:

        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )

    new_password_hash = hash_password(
        user.new_password
    )

    await db.users.update_one(
        {
            "_id": existing_user["_id"]
        },
        {
            "$set": {
                "password_hash":
                    new_password_hash
            }
        }
    )

    return {
        "message":
            "Password changed successfully"
    }


# -------------------------
# FORGOT PASSWORD
# -------------------------

@router.post("/forgot-password")
async def forgot_password(
    user: ForgotPasswordRequest
):

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": user.email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    reset_token = create_password_reset_token(
        user.email
    )

    reset_link = (
        f"{settings.FRONTEND_URL}"
        f"/reset-password?token={reset_token}"
    )

    try:

        send_password_reset_email(
            user.email,
            reset_link
        )

    except Exception as error:

        print(
            "Email sending error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send reset email"
        )

    return {
        "message":
            "Password reset link sent to your email"
    }


# -------------------------
# RESET PASSWORD
# -------------------------

@router.post("/reset-password")
async def reset_password(
    user: ResetPassword
):

    payload = decode_password_reset_token(
        user.token
    )

    if not payload:

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    email = payload.get("email")

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Invalid reset token"
        )

    db = get_database()

    existing_user = await db.users.find_one(
        {
            "email": email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_password_hash = hash_password(
        user.new_password
    )

    await db.users.update_one(
        {
            "_id": existing_user["_id"]
        },
        {
            "$set": {
                "password_hash":
                    new_password_hash
            }
        }
    )

    return {
        "message":
            "Password reset successfully"
    }