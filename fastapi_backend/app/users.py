import uuid
import re

from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, Response
from fastapi_users import (
    BaseUserManager,
    FastAPIUsers,
    UUIDIDMixin,
    InvalidPasswordException,
)

from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

from .config import settings
from .database import get_user_db
from .email import send_reset_password_email
from .models import User
from .schemas import UserCreate

AUTH_URL_PATH = "auth"


class PMTBearerTransport(BearerTransport):
    async def get_logout_response(self) -> Response:
        return JSONResponse(
            {"detail": "Successfully logged out"},
            status_code=status.HTTP_200_OK,
        )

    @staticmethod
    def get_openapi_logout_responses_success():
        return {
            status.HTTP_200_OK: {
                "description": "Successful Response",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {"detail": {"type": "string"}},
                        },
                        "example": {"detail": "Successfully logged out"},
                    }
                },
            }
        }


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.RESET_PASSWORD_SECRET_KEY
    verification_token_secret = settings.VERIFICATION_SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        await send_reset_password_email(user, token)

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

    async def validate_password(
        self,
        password: str,
        user: UserCreate,
    ) -> None:
        errors = []

        if len(password) < 8:
            errors.append("Password should be at least 8 characters.")
        if user.email in password:
            errors.append("Password should not contain e-mail.")
        if not any(char.isupper() for char in password):
            errors.append("Password should contain at least one uppercase letter.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password should contain at least one special character.")

        if errors:
            raise InvalidPasswordException(reason=errors)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = PMTBearerTransport(tokenUrl=f"{AUTH_URL_PATH}/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.ACCESS_SECRET_KEY,
        lifetime_seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    )


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

# Underlying fastapi-users dep that returns User | None instead of raising 401.
# Wrapping it lets `current_active_user` short-circuit when AUTH_DISABLED is on.
_optional_current_user = fastapi_users.current_user(active=True, optional=True)

_NOAUTH_USER_ID = UUID("00000000-0000-0000-0000-0000000000a1")


def _build_noauth_user() -> User:
    return User(
        id=_NOAUTH_USER_ID,
        email="noauth@local",
        hashed_password="",
        is_active=True,
        is_superuser=False,
        is_verified=True,
    )


async def current_active_user(
    user: Optional[User] = Depends(_optional_current_user),
) -> User:
    if settings.AUTH_DISABLED:
        return _build_noauth_user()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user
