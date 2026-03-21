"""Shared input validation helpers for API routes."""

import re
from typing import Optional

from fastapi import HTTPException


def validate_date(value: Optional[str], field: str) -> Optional[str]:
    """Validate and return a YYYY-MM-DD date string, or raise 422."""
    if value is None:
        return None
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        raise HTTPException(
            status_code=422, detail=f"{field} must be YYYY-MM-DD format"
        )
    return value
