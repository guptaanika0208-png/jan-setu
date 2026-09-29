"""
Voice assistant router.
The frontend does Speech-to-Text and Text-to-Speech in-browser via the Web
Speech API (see frontend/src/hooks/useVoiceAssistant.js). This endpoint is
the server-side NLU step: it receives the transcribed text and returns a
structured intent + suggested spoken response + navigation target, so intent
logic lives in one place (testable, language-model-swappable) rather than
being duplicated in frontend JS.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.application import Application
from app.models.profile import Profile
from app.models.scheme import Scheme
from app.models.user import User
from app.utils.deps import get_current_user
from app.utils.intent_detection import detect_intent
from app.utils.scheme_engine import evaluate_eligibility
from app.core.security import decrypt_field

router = APIRouter(prefix="/api/voice", tags=["Voice Assistant"])

# Maps an intent name to a frontend route. Kept here (not scattered in JS)
# so the contract between NLU and navigation is a single source of truth.
INTENT_ROUTES = {
    "NAVIGATE_HOME": "/home",
    "NAVIGATE_ELIGIBLE_SCHEMES": "/eligible-schemes",
    "NAVIGATE_SERVICES": "/services",
    "NAVIGATE_DOCUMENTS": "/documents",
    "NAVIGATE_NOTIFICATIONS": "/notifications",
    "NAVIGATE_PROFILE": "/profile",
    "NAVIGATE_APPLICATION_STATUS": "/application-progress",
    "NAVIGATE_SETTINGS": "/settings",
    "NAVIGATE_HELP": "/help",
    "OPEN_SCHEME_EPFO": "/services",
    "APPLY_SCHOLARSHIP": "/schemes",
}


class VoiceCommandRequest(BaseModel):
    transcript: str


class VoiceCommandResponse(BaseModel):
    intent: str
    confidence: float
    route: str | None
    speak: str


@router.post("/command", response_model=VoiceCommandResponse)
def handle_voice_command(
    payload: VoiceCommandRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    detected = detect_intent(payload.transcript)
    route = INTENT_ROUTES.get(detected.intent)
    speak = _speech_for_intent(detected.intent, current_user, db)
    return VoiceCommandResponse(intent=detected.intent, confidence=detected.confidence, route=route, speak=speak)


def _speech_for_intent(intent: str, user: User, db: Session) -> str:
    if intent == "NAVIGATE_ELIGIBLE_SCHEMES":
        profile = db.query(Profile).filter(Profile.user_id == user.id).first()
        if not profile:
            return "Please complete your profile first so I can check your eligible schemes."
        income = decrypt_field(profile.annual_income_encrypted)
        income_val = int(income) if income else None
        count = 0
        for scheme in db.query(Scheme).all():
            status_str, _, _ = evaluate_eligibility(profile, scheme, income_val)
            if status_str == "eligible":
                count += 1
        return f"You are eligible for {count} government schemes. Opening the eligible schemes page."

    if intent == "NAVIGATE_APPLICATION_STATUS":
        pending = db.query(Application).filter(Application.user_id == user.id).count()
        return f"You have {pending} applications in progress. Opening application status."

    if intent == "NAVIGATE_DOCUMENTS":
        return "Opening your documents."
    if intent == "NAVIGATE_NOTIFICATIONS":
        return "Here are your notifications."
    if intent == "NAVIGATE_SERVICES":
        return "Opening services."
    if intent == "NAVIGATE_PROFILE":
        return "Opening your profile."
    if intent == "NAVIGATE_SETTINGS":
        return "Opening settings."
    if intent == "NAVIGATE_HELP":
        return "Opening help. I'm here to guide you."
    if intent == "NAVIGATE_HOME":
        return "Going to the home screen."
    if intent == "OPEN_SCHEME_EPFO":
        return "Opening EPFO services."
    if intent == "APPLY_SCHOLARSHIP":
        return "Let's start your scholarship application."
    if intent == "READ_SCREEN":
        return "Reading the current screen for you."
    if intent == "REPEAT":
        return "Repeating the last response."
    if intent == "GO_BACK":
        return "Going back."
    if intent == "CHANGE_LANGUAGE":
        return "Sure, which language would you like me to switch to?"

    return "Sorry, I didn't quite catch that. You can ask me to open a page, check eligible schemes, or read this screen."
