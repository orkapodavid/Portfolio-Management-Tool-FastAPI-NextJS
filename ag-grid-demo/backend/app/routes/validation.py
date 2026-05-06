"""Validation endpoints (Req 7).

Note: Demo 07 validates client-side for instant feedback. These endpoints
are available for external consumers or future server-side validation.
"""

import math
import re

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/validation", tags=["validation"])

VALID_FIELDS = {"symbol", "price", "qty", "change", "sector"}
VALID_SECTORS = {"Technology", "Finance", "Healthcare", "Energy"}


class CellValidation(BaseModel):
    field: str
    value: str


class ValidationResult(BaseModel):
    valid: bool
    error: str | None = None


def _parse_finite_float(value: str) -> float:
    """Parse a string to float, rejecting NaN and infinity."""
    v = float(value)
    if not math.isfinite(v):
        raise ValueError("Value must be a finite number")
    return v


@router.post("/validate")
async def validate_cell(cell: CellValidation) -> ValidationResult:
    field = cell.field
    value = cell.value

    if field not in VALID_FIELDS:
        return ValidationResult(valid=False, error=f"Unknown field: {field}")

    if field == "symbol":
        if not re.match(r"^[A-Z]{1,5}$", value):
            return ValidationResult(
                valid=False, error="Symbol must be 1-5 uppercase letters"
            )

    elif field == "price":
        try:
            v = _parse_finite_float(value)
            if v < 0 or v > 1_000_000:
                return ValidationResult(
                    valid=False, error="Price must be between 0 and 1,000,000"
                )
        except ValueError:
            return ValidationResult(valid=False, error="Price must be a finite number")

    elif field == "qty":
        try:
            v = int(value)
            if v < 1 or v > 10_000:
                return ValidationResult(
                    valid=False, error="Quantity must be between 1 and 10,000"
                )
        except ValueError:
            return ValidationResult(valid=False, error="Quantity must be an integer")

    elif field == "change":
        try:
            v = _parse_finite_float(value)
            if v < -100 or v > 100:
                return ValidationResult(
                    valid=False, error="Change must be between -100 and 100"
                )
        except ValueError:
            return ValidationResult(valid=False, error="Change must be a finite number")

    elif field == "sector":
        if value not in VALID_SECTORS:
            return ValidationResult(
                valid=False,
                error=f"Invalid sector. Must be one of: {', '.join(sorted(VALID_SECTORS))}",
            )

    return ValidationResult(valid=True)


@router.get("/rules")
async def get_validation_rules():
    return [
        {
            "field": "symbol",
            "type": "string",
            "constraints": "Pattern: A-Z, 1-5 chars",
            "errorMessage": "Symbol must be 1-5 uppercase letters",
        },
        {
            "field": "price",
            "type": "number",
            "constraints": "Range: 0 - 1,000,000",
            "errorMessage": "Price must be between 0 and 1,000,000",
        },
        {
            "field": "qty",
            "type": "integer",
            "constraints": "Range: 1 - 10,000",
            "errorMessage": "Quantity must be between 1 and 10,000",
        },
        {
            "field": "change",
            "type": "number",
            "constraints": "Range: -100 to 100",
            "errorMessage": "Change must be between -100% and 100%",
        },
        {
            "field": "sector",
            "type": "enum",
            "constraints": "Technology, Finance, Healthcare, Energy",
            "errorMessage": "Invalid sector",
        },
    ]
