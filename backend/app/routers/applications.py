"""
Applications router - implements the "Form Auto Fill" + "Auto Save /
Resume Draft" system from the spec:

  1. POST /api/applications            -> create a draft, pre-filled from
                                           the citizen's Profile so they
                                           never retype the same details.
  2. PATCH /api/applications/{id}/autosave -> called on a debounce from the
                                           frontend as the user types; if
                                           the network drops, GET the same
                                           application to resume exactly at
                                           `current_step`.
  3. POST /api/applications/{id}/submit -> final submission after the
                                           frontend shows a confirmation
                                           screen.
  4. GET  /api/applications             -> "Application Progress" page feed.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import decrypt_field
from app.db.database import get_db
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.profile import Profile
from app.models.scheme import Scheme
from app.models.user import User
from app.schemas.application import (
    ApplicationAutosaveRequest,
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationSubmitRequest,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def _autofill_from_profile(profile: Profile | None) -> dict:
    if not profile:
        return {}
    income = decrypt_field(profile.annual_income_encrypted)
    return {
        "age": profile.age,
        "gender": profile.gender,
        "state": profile.state,
        "district": profile.district,
        "occupation": profile.occupation,
        "annual_income": int(income) if income else None,
        "category": profile.category,
        "education_level": profile.education_level,
    }


@router.get("", response_model=list[ApplicationResponse])
def list_my_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.updated_at.desc()).all()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scheme = db.query(Scheme).filter(Scheme.id == payload.scheme_id).first()
    if not scheme:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scheme not found")

    existing_draft = (
        db.query(Application)
        .filter(Application.user_id == current_user.id, Application.scheme_id == scheme.id, Application.status == "draft")
        .first()
    )
    if existing_draft:
        return existing_draft  # resume instead of duplicating

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    application = Application(
        user_id=current_user.id,
        scheme_id=scheme.id,
        draft_data=_autofill_from_profile(profile),
        current_step=0,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.patch("/{application_id}/autosave", response_model=ApplicationResponse)
def autosave_application(
    application_id: str,
    payload: ApplicationAutosaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = _get_owned_application(db, application_id, current_user.id)
    application.current_step = payload.current_step
    application.draft_data = {**(application.draft_data or {}), **payload.draft_data}
    db.commit()
    db.refresh(application)
    return application


@router.post("/{application_id}/submit", response_model=ApplicationResponse)
def submit_application(
    application_id: str,
    payload: ApplicationSubmitRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = _get_owned_application(db, application_id, current_user.id)
    application.draft_data = {**(application.draft_data or {}), **payload.draft_data}
    application.status = "submitted"
    application.submitted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(application)

    db.add(AuditLog(
        user_id=current_user.id,
        action="application_submit",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        metadata_json=f'{{"application_id": "{application.id}"}}',
    ))
    db.commit()
    return application


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_owned_application(db, application_id, current_user.id)


def _get_owned_application(db: Session, application_id: str, user_id: str) -> Application:
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    if application.user_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your application")
    return application
