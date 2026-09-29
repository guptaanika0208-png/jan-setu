import uuid

from sqlalchemy import JSON, Column, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Scheme(Base):
    """
    Master catalogue of government schemes. `eligibility_rules` is a
    small declarative JSON ruleset consumed by
    app.utils.scheme_engine.evaluate_eligibility - this keeps the rule
    definitions data-driven instead of hardcoded if/else chains, so new
    schemes can be added via seed data / admin panel without a code change.

    Example eligibility_rules:
    {
      "max_age": 35, "min_age": 18,
      "income_below": 250000,
      "categories": ["sc", "st", "obc", "ews"],
      "states": ["ANY"],
      "occupation_in": ["student"],
      "disability_required": false
    }
    """
    __tablename__ = "schemes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    department = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # education | health | employment | agriculture | housing | pension | women | disability
    short_description = Column(String(300), nullable=False)
    full_description = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    official_link = Column(String(300), nullable=True)
    icon = Column(String(50), default="FaLandmark")  # react-icons key rendered on frontend

    eligibility_rules = Column(JSON, nullable=False, default=dict)
    required_documents = Column(JSON, nullable=False, default=list)  # e.g. ["aadhaar", "income_certificate"]

    application_deadline = Column(String(50), nullable=True)  # ISO date or "rolling"
