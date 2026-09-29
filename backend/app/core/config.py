"""
Central application configuration.
Loaded once as a singleton `settings` object, sourced from environment
variables / .env file. Never hardcode secrets elsewhere in the codebase.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://jansetu_user:jansetu_pass@localhost:5432/jansetu_db"

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Field-level encryption (AES via Fernet) for sensitive PII columns
    FIELD_ENCRYPTION_KEY: str = "dev-key-not-secure-replace-in-prod-32byte"

    # App
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # OTP
    OTP_MOCK_MODE: bool = True
    OTP_EXPIRY_SECONDS: int = 300

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
