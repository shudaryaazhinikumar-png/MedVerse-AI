from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class PatientProfile(BaseModel):

    user_id: str

    age: Optional[int] = None

    gender: Optional[str] = None

    blood_group: Optional[str] = None

    height: Optional[float] = None

    weight: Optional[float] = None

    allergies: List[str] = []

    existing_conditions: List[str] = []

    emergency_contact: Optional[str] = None

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )