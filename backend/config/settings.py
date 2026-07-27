"""
Central application configuration.
All values are read from environment variables — never hardcode secrets here.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---------------- App ----------------
    APP_NAME: str = "MarketPulse AI"
    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # ---------------- Database ----------------
    DATABASE_URL: str = (
        "postgresql+psycopg2://user:password@localhost:5432/marketpulse"
    )

    # ---------------- Clerk ----------------
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_JWKS_URL: str = ""
    CLERK_ISSUER: str = ""

    # ---------------- Gemini ----------------
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # ---------------- Groq ----------------
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ---------------- ML ----------------
    MODEL_ARTIFACT_DIR: str = "ml/artifacts"

    # ---------------- CORS ----------------
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    FRONTEND_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        raw_origins = self.FRONTEND_ORIGINS or self.FRONTEND_ORIGIN
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",   # Ignore unused variables in .env
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()