from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):

    name: str
    email: EmailStr
    password: str
    role: str = "patient"


class UserLogin(BaseModel):

    email: EmailStr
    password: str


# -------------------------
# CHANGE PASSWORD
# -------------------------

class ChangePassword(BaseModel):

    email: EmailStr
    current_password: str
    new_password: str


# -------------------------
# FORGOT PASSWORD
# -------------------------

class ForgotPasswordRequest(BaseModel):

    email: EmailStr


# -------------------------
# RESET PASSWORD
# -------------------------

class ResetPassword(BaseModel):

    token: str
    new_password: str