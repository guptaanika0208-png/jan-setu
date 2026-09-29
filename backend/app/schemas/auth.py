from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    phone_number: str = Field(min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    password: str = Field(min_length=8, max_length=128)

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) < 10:
            raise ValueError("Enter a valid phone number")
        return digits

    @field_validator("email", mode="before")
    @classmethod
    def blank_email_to_none(cls, v):
        return v or None


class LoginRequest(BaseModel):
    phone_number: str
    password: str


class OTPRequest(BaseModel):
    phone_number: str
    purpose: str = "signup"  # signup | login | reset_password


class OTPVerifyRequest(BaseModel):
    phone_number: str
    otp: str = Field(min_length=4, max_length=8)
    purpose: str = "signup"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    id: str
    full_name: str
    phone_number: str
    email: Optional[str] = None
    role: str
    is_phone_verified: bool
    preferred_language: str
    high_contrast_mode: bool

    model_config = {"from_attributes": True}
