from typing import Any, Dict, Optional

from pydantic import BaseModel


class ApplicationCreateRequest(BaseModel):
    scheme_id: str


class ApplicationAutosaveRequest(BaseModel):
    current_step: int
    draft_data: Dict[str, Any]


class ApplicationSubmitRequest(BaseModel):
    draft_data: Dict[str, Any]


class ApplicationResponse(BaseModel):
    id: str
    scheme_id: str
    status: str
    current_step: int
    total_steps: int
    draft_data: Dict[str, Any]

    model_config = {"from_attributes": True}
