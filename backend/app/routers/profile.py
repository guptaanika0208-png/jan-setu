"""
Profile router.
Handles the one-time citizen profile that powers:
  1. Scheme eligibility matching (utils/scheme_engine.py)
  2. Application form auto-fill (routers/applications.py)
Sensitive fields (aadhaar, income) are encrypted before persisting and
decrypted only for the owning authenticated user on read.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.security import decrypt_field, encrypt_field
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpsertRequest
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def _to_response(profile: Profile) -> ProfileResponse:
    income = decrypt_field(profile.annual_income_encrypted)
    aadhaar = decrypt_field(profile.aadhaar_number_encrypted)
    return ProfileResponse(
        id=profile.id,
        age=profile.age,
        gender=profile.gender,
        state=profile.state,
        district=profile.district,
        occupation=profile.occupation,
        annual_income=int(income) if income else None,
        aadhaar_last4=aadhaar[-4:] if aadhaar else None,
        category=profile.category,
        education_level=profile.education_level,
        disability_status=profile.disability_status,
        disability_type=profile.disability_type,
        is_complete=profile.is_complete,
    )


@router.get("/me", response_model=ProfileResponse | None)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return None
    return _to_response(profile)


@router.put("/me", response_model=ProfileResponse)
def upsert_my_profile(
    payload: ProfileUpsertRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.age = payload.age
    profile.gender = payload.gender
    profile.state = payload.state
    profile.district = payload.district
    profile.occupation = payload.occupation
    profile.category = payload.category
    profile.education_level = payload.education_level
    profile.disability_status = bool(payload.disability_status)
    profile.disability_type = payload.disability_type

    if payload.annual_income is not None:
        profile.annual_income_encrypted = encrypt_field(str(payload.annual_income))
    if payload.aadhaar_number is not None:
        profile.aadhaar_number_encrypted = encrypt_field(payload.aadhaar_number)

    profile.is_complete = all(
        [profile.age, profile.gender, profile.state, profile.occupation, profile.category]
    )

    db.commit()
    db.refresh(profile)

    db.add(AuditLog(
        user_id=current_user.id,
        action="profile_update",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))
    db.commit()

    return _to_response(profile)
