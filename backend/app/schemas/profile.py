from typing import Optional

from pydantic import BaseModel, Field


class ProfileUpsertRequest(BaseModel):
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[int] = Field(default=None, ge=0)  # plaintext in transit (HTTPS), encrypted at rest
    aadhaar_number: Optional[str] = Field(default=None, min_length=12, max_length=12)
    category: Optional[str] = None
    education_level: Optional[str] = None
    disability_status: Optional[bool] = False
    disability_type: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    age: Optional[int]
    gender: Optional[str]
    state: Optional[str]
    district: Optional[str]
    occupation: Optional[str]
    annual_income: Optional[int] = None  # decrypted for the owning user only
    aadhaar_last4: Optional[str] = None  # masked, never return full number to client
    category: Optional[str]
    education_level: Optional[str]
    disability_status: bool
    disability_type: Optional[str]
    is_complete: bool
