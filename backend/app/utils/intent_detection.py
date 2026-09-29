"""
Voice Assistant Intent Detection
==================================
Lightweight, explainable, keyword/pattern-based NLU for the Jan Setu voice
assistant. The frontend does browser-side Speech-to-Text (Web Speech API)
and sends the transcribed text here; this returns a structured intent the
frontend uses to navigate + speak a response (Text-to-Speech), matching the
spec's example:

    "Show me all the schemes I am eligible for."
        -> intent: NAVIGATE_ELIGIBLE_SCHEMES
        -> frontend navigates to /eligible-schemes and speaks the count.

For a production system this keyword matcher would be swapped for a proper
multilingual NLU model (e.g. an intent-classification transformer per
language, or a hosted LLM prompt) - the INTENT_PATTERNS map below is the
seam where that swap happens; nothing else in the app needs to change since
routers/voice.py only depends on `detect_intent()`'s return contract.
"""
import re
from dataclasses import dataclass
from typing import Optional

# Intent name -> list of regex patterns (English canonical form).
# Non-English input is expected to be pre-translated to English by the
# frontend i18n layer OR matched against per-language pattern sets in a
# full build-out (see docs/VOICE_ASSISTANT.md for the extension plan).
INTENT_PATTERNS: dict[str, list[str]] = {
    "NAVIGATE_HOME": [r"\bgo (to )?home\b", r"\bhome page\b"],
    "NAVIGATE_ELIGIBLE_SCHEMES": [
        r"schemes? (i am|i'm) eligible",
        r"eligible schemes",
        r"which schemes.*(eligible|qualify)",
    ],
    "NAVIGATE_SERVICES": [r"\bshow services\b", r"\bopen services\b"],
    "NAVIGATE_DOCUMENTS": [r"\bgo to documents\b", r"\bmy documents\b", r"\bopen documents\b"],
    "NAVIGATE_NOTIFICATIONS": [r"\bshow notifications\b", r"\bany notifications\b"],
    "NAVIGATE_PROFILE": [r"\bmy profile\b", r"\bopen profile\b"],
    "NAVIGATE_APPLICATION_STATUS": [r"application status", r"read my application", r"track my application"],
    "NAVIGATE_SETTINGS": [r"\bopen settings\b", r"\bgo to settings\b"],
    "NAVIGATE_HELP": [r"\bhelp\b", r"\bi need help\b"],
    "OPEN_SCHEME_EPFO": [r"\bopen epfo\b", r"\bepfo\b"],
    "APPLY_SCHOLARSHIP": [r"apply.*scholarship", r"scholarship.*apply"],
    "READ_SCREEN": [r"\bread screen\b", r"\bread this page\b", r"\bread this\b"],
    "REPEAT": [r"\brepeat\b", r"\bsay (that )?again\b"],
    "GO_BACK": [r"\bgo back\b", r"\bprevious page\b"],
    "CHANGE_LANGUAGE": [r"change language", r"switch (the )?language", r"speak in (?P<lang>\w+)"],
}


@dataclass
class DetectedIntent:
    intent: str
    confidence: float
    slots: dict


def detect_intent(transcript: str) -> DetectedIntent:
    """
    Matches a lowercase, punctuation-light transcript against
    INTENT_PATTERNS. Returns the first (highest-priority) match, or a
    FALLBACK intent with the raw transcript if nothing matched, so the
    frontend can hand off to a general Q&A / search fallback.
    """
    normalized = transcript.strip().lower()
    normalized = re.sub(r"[^\w\s']", " ", normalized)

    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, normalized)
            if match:
                slots = {k: v for k, v in (match.groupdict() or {}).items() if v}
                return DetectedIntent(intent=intent, confidence=0.92, slots=slots)

    return DetectedIntent(intent="FALLBACK_SEARCH", confidence=0.3, slots={"query": transcript})
