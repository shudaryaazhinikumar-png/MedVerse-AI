from fastapi import Header, HTTPException

from app.utils.jwt import decode_access_token



async def get_current_user(
    authorization: str | None = Header(None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Token missing"
        )


    token = authorization.replace(
        "Bearer ",
        ""
    )


    user = decode_access_token(token)


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


    return user