from fastapi import APIRouter

from app.config import settings
from app.runtime import database_backend_from_url


router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "runtime": settings.RUNTIME_MODE,
        "database_backend": database_backend_from_url(settings.DATABASE_URL),
    }
