from typing import Any, List, Optional

from pydantic import BaseModel


class SchemeResponse(BaseModel):
    id: str
    name: str
    department: str
    category: str
    short_description: str
    full_description: str
    benefits: str
    official_link: Optional[str]
    icon: str
    required_documents: List[str]
    application_deadline: Optional[str]

    model_config = {"from_attributes": True}


class EligibilityResult(BaseModel):
    scheme: SchemeResponse
    status: str  # eligible | possibly_eligible | not_eligible
    reasons: List[str]
    match_score: float  # 0.0 - 1.0, used for sorting "Suggested Schemes"


class EligibilityListResponse(BaseModel):
    eligible: List[EligibilityResult]
    possibly_eligible: List[EligibilityResult]
    not_eligible: List[EligibilityResult]
