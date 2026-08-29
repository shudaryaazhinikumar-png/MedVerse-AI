from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings


# -------------------------
# ACCESS TOKEN
# -------------------------

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


# -------------------------
# DECODE ACCESS TOKEN
# -------------------------

def decode_access_token(token: str):

    try:

        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        if payload.get("type") != "access":
            return None

        return payload

    except Exception:

        return None


# -------------------------
# PASSWORD RESET TOKEN
# -------------------------

def create_password_reset_token(email: str):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=15
    )

    payload = {
        "email": email,
        "exp": expire,
        "type": "password_reset"
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return token


# -------------------------
# DECODE PASSWORD RESET TOKEN
# -------------------------

def decode_password_reset_token(token: str):

    try:

        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        if payload.get("type") != "password_reset":
            return None

        return payload

    except Exception:

        return None