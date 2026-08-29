from pydantic import BaseModel
from typing import Optional


class User(BaseModel):

    name: str
    email: str
    password_hash: str
    role: Optional[str] = "patient"