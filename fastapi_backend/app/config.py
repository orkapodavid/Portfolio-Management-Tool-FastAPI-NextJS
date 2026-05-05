from pathlib import Path
from typing import Literal, Set

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from .runtime import parse_cors_origins


BACKEND_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    # OpenAPI docs
    OPENAPI_URL: str = "/openapi.json"

    # Database
    DATABASE_URL: str
    TEST_DATABASE_URL: str | None = None
    EXPIRE_ON_COMMIT: bool = False

    # User
    ACCESS_SECRET_KEY: str
    RESET_PASSWORD_SECRET_KEY: str
    VERIFICATION_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 3600

    # Email
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None
    MAIL_SERVER: str | None = None
    MAIL_PORT: int | None = None
    MAIL_FROM_NAME: str = "Portfolio Management Tool"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    TEMPLATE_DIR: str = "email_templates"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Runtime
    RUNTIME_MODE: Literal["server", "desktop"] = Field(
        default="server",
        validation_alias=AliasChoices("PMT_RUNTIME_MODE", "PMT_RUNTIME"),
    )
    APP_DATA_DIR: str | None = Field(
        default=None,
        validation_alias=AliasChoices("PMT_APP_DATA_DIR", "PMT_DESKTOP_APP_DATA_DIR"),
    )

    # CORS
    CORS_ORIGINS: Set[str]

    # PMT Settings
    MOCK_DATA: bool = True  # Use mock data from pmt_core

    # Dev-only escape hatch for parity work against the Reflex reference. When true,
    # protected /api/* routes return a synthetic user instead of going through
    # fastapi-users. Default False; never enable in production.
    AUTH_DISABLED: bool = Field(
        default=False,
        validation_alias=AliasChoices("PMT_AUTH_DISABLED", "AUTH_DISABLED"),
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origin_values(cls, value: object) -> Set[str]:
        return parse_cors_origins(value)

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
