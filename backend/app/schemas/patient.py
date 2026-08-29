from pydantic import BaseModel
from typing import List


class PatientCreate(BaseModel):

    age: int

    gender: str

    blood_group: str

    height: float

    weight: float

    allergies: List[str] = []

    existing_conditions: List[str] = []

    emergency_contact: str