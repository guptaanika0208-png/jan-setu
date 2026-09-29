import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Profile(Base):
    """
    One-to-one profile record. Filled once by the citizen, then used to:
      1. Drive the scheme eligibility engine (utils/scheme_engine.py)
      2. Auto-fill downstream government application forms
    Fields that are sensitive PII (aadhaar_number, income) are stored
    encrypted at rest using app.core.security.encrypt_field/decrypt_field.
    The router layer is responsible for encrypting before save and
    decrypting after read - never leave plaintext PII in this model's
    docstring assumptions.
    """
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True, nullable=False)

    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)  # male | female | other | prefer_not_to_say
    state = Column(String(60), nullable=True)
    district = Column(String(60), nullable=True)
    occupation = Column(String(80), nullable=True)

    # Encrypted at rest (Fernet/AES) - stored as ciphertext strings
    annual_income_encrypted = Column(String(500), nullable=True)
    aadhaar_number_encrypted = Column(String(500), nullable=True)

    category = Column(String(20), nullable=True)  # general | obc | sc | st | ews
    education_level = Column(String(60), nullable=True)
    disability_status = Column(Boolean, default=False)
    disability_type = Column(String(80), nullable=True)

    is_complete = Column(Boolean, default=False)
