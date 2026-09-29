"""
Scheme Eligibility Engine
==========================
Data-driven rule evaluator that compares a citizen's Profile against every
Scheme's `eligibility_rules` JSON and produces a graded verdict:

    eligible          -> every rule satisfied
    possibly_eligible  -> most rules satisfied, but 1+ rule couldn't be
                          checked confidently (e.g. missing profile field)
    not_eligible       -> a hard rule is violated (age/income/category/state)

Each result carries human-readable `reasons`, so the frontend can show
"WHY the user qualifies" per the product spec, and a `match_score` used to
rank the "Suggested Schemes" carousel on the home page.

This is intentionally rule-based (transparent, auditable, explainable) as
appropriate for a government-benefits decision - a black-box ML classifier
would be inappropriate here since citizens are legally entitled to know
*why* they were or weren't matched. The AI/NLU layer of Jan Setu is used
for the voice assistant's intent detection instead (see routers/voice.py).
"""
from dataclasses import dataclass, field
from typing import Any, Dict, List

from app.models.profile import Profile
from app.models.scheme import Scheme


@dataclass
class RuleCheckOutcome:
    satisfied: bool
    confident: bool
    reason: str


def _check_age(profile: Profile, rules: Dict[str, Any]) -> RuleCheckOutcome:
    if "min_age" not in rules and "max_age" not in rules:
        return RuleCheckOutcome(True, True, "")
    if profile.age is None:
        return RuleCheckOutcome(True, False, "Add your age to your profile to confirm age eligibility.")
    min_age = rules.get("min_age", 0)
    max_age = rules.get("max_age", 200)
    if min_age <= profile.age <= max_age:
        return RuleCheckOutcome(True, True, f"Your age ({profile.age}) is within the eligible range {min_age}-{max_age}.")
    return RuleCheckOutcome(False, True, f"This scheme requires age between {min_age} and {max_age}.")


def _check_income(profile: Profile, rules: Dict[str, Any], decrypted_income: int | None) -> RuleCheckOutcome:
    if "income_below" not in rules:
        return RuleCheckOutcome(True, True, "")
    if decrypted_income is None:
        return RuleCheckOutcome(True, False, "Add your annual income to your profile to confirm income eligibility.")
    threshold = rules["income_below"]
    if decrypted_income < threshold:
        return RuleCheckOutcome(True, True, f"Your household income is below the ₹{threshold:,} threshold.")
    return RuleCheckOutcome(False, True, f"This scheme requires annual income below ₹{threshold:,}.")


def _check_category(profile: Profile, rules: Dict[str, Any]) -> RuleCheckOutcome:
    allowed = rules.get("categories")
    if not allowed or "ANY" in allowed:
        return RuleCheckOutcome(True, True, "")
    if not profile.category:
        return RuleCheckOutcome(True, False, "Add your category to your profile to confirm eligibility.")
    if profile.category.lower() in [c.lower() for c in allowed]:
        return RuleCheckOutcome(True, True, f"Your category ({profile.category.upper()}) is eligible for this scheme.")
    return RuleCheckOutcome(False, True, f"This scheme is limited to: {', '.join(allowed).upper()}.")


def _check_state(profile: Profile, rules: Dict[str, Any]) -> RuleCheckOutcome:
    allowed = rules.get("states")
    if not allowed or "ANY" in allowed:
        return RuleCheckOutcome(True, True, "")
    if not profile.state:
        return RuleCheckOutcome(True, False, "Add your state to your profile to confirm eligibility.")
    if profile.state.lower() in [s.lower() for s in allowed]:
        return RuleCheckOutcome(True, True, f"Available in your state ({profile.state}).")
    return RuleCheckOutcome(False, True, f"This scheme is only available in: {', '.join(allowed)}.")


def _check_occupation(profile: Profile, rules: Dict[str, Any]) -> RuleCheckOutcome:
    allowed = rules.get("occupation_in")
    if not allowed:
        return RuleCheckOutcome(True, True, "")
    if not profile.occupation:
        return RuleCheckOutcome(True, False, "Add your occupation to your profile to confirm eligibility.")
    if profile.occupation.lower() in [o.lower() for o in allowed]:
        return RuleCheckOutcome(True, True, f"Open to your occupation ({profile.occupation}).")
    return RuleCheckOutcome(False, True, f"This scheme targets: {', '.join(allowed)}.")


def _check_disability(profile: Profile, rules: Dict[str, Any]) -> RuleCheckOutcome:
    if not rules.get("disability_required"):
        return RuleCheckOutcome(True, True, "")
    if profile.disability_status:
        return RuleCheckOutcome(True, True, "This scheme is for persons with disabilities, which matches your profile.")
    return RuleCheckOutcome(False, True, "This scheme requires a registered disability status.")


def evaluate_eligibility(profile: Profile, scheme: Scheme, decrypted_income: int | None) -> tuple[str, List[str], float]:
    """
    Returns (status, reasons, match_score) for a single profile/scheme pair.
    """
    rules = scheme.eligibility_rules or {}
    checks = [
        _check_age(profile, rules),
        _check_income(profile, rules, decrypted_income),
        _check_category(profile, rules),
        _check_state(profile, rules),
        _check_occupation(profile, rules),
        _check_disability(profile, rules),
    ]

    reasons = [c.reason for c in checks if c.reason]
    hard_fail = any((not c.satisfied) and c.confident for c in checks)
    any_unconfident = any(not c.confident for c in checks)

    total_checks = max(len(checks), 1)
    satisfied_count = sum(1 for c in checks if c.satisfied)
    match_score = round(satisfied_count / total_checks, 2)

    if hard_fail:
        return "not_eligible", reasons, match_score
    if any_unconfident:
        return "possibly_eligible", reasons, match_score
    return "eligible", reasons, match_score
