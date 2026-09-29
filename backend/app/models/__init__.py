"""
Import every model here so that a single `from app.db.database import Base`
+ `Base.metadata.create_all(engine)` (or Alembic autogenerate) discovers
the full schema.
"""
from app.models.user import User          # noqa: F401
from app.models.profile import Profile     # noqa: F401
from app.models.document import Document   # noqa: F401
from app.models.scheme import Scheme       # noqa: F401
from app.models.application import Application  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.otp import OTP             # noqa: F401
