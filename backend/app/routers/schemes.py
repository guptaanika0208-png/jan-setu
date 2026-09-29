"""
Schemes router.
- GET /api/schemes            -> full public catalogue (browse/search)
- GET /api/schemes/{id}       -> single scheme detail
- GET /api/schemes/eligibility -> personalized eligible / possibly_eligible /
                                   not_eligible buckets for the logged-in
                                   citizen, computed via utils/scheme_engine.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import decrypt_field
from app.db.database import get_db
from app.models.profile import Profile
from app.models.scheme import Scheme
from app.models.user import User
from app.schemas.scheme import EligibilityListResponse, EligibilityResult, SchemeResponse
from app.utils.deps import get_current_user
from app.utils.scheme_engine import evaluate_eligibility

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])


def _scheme_to_response(scheme: Scheme) -> SchemeResponse:
    return SchemeResponse(
        id=scheme.id,
        name=scheme.name,
        department=scheme.department,
        category=scheme.category,
        short_description=scheme.short_description,
        full_description=scheme.full_description,
        benefits=scheme.benefits,
        official_link=scheme.official_link,
        icon=scheme.icon,
        required_documents=scheme.required_documents or [],
        application_deadline=scheme.application_deadline,
    )


@router.get("", response_model=list[SchemeResponse])
def list_schemes(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Scheme)
    if category:
        query = query.filter(Scheme.category == category)
    return [_scheme_to_response(s) for s in query.all()]


@router.get("/eligibility", response_model=EligibilityListResponse)
def get_eligibility(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Complete your profile first to see personalized schemes")

    decrypted_income = decrypt_field(profile.annual_income_encrypted)
    income_val = int(decrypted_income) if decrypted_income else None

    eligible, possibly, not_elig = [], [], []
    for scheme in db.query(Scheme).all():
        status_str, reasons, score = evaluate_eligibility(profile, scheme, income_val)
        result = EligibilityResult(
            scheme=_scheme_to_response(scheme),
            status=status_str,
            reasons=reasons,
            match_score=score,
        )
        if status_str == "eligible":
            eligible.append(result)
        elif status_str == "possibly_eligible":
            possibly.append(result)
        else:
            not_elig.append(result)

    eligible.sort(key=lambda r: r.match_score, reverse=True)
    possibly.sort(key=lambda r: r.match_score, reverse=True)

    return EligibilityListResponse(eligible=eligible, possibly_eligible=possibly, not_eligible=not_elig)


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scheme not found")
    return _scheme_to_response(scheme)
