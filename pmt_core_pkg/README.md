# pmt_core

Framework-agnostic business logic for the Portfolio Management Tool
parity rebuild.

## Overview

`pmt_core` is the shared Python package consumed by:

- The **FastAPI backend** (`fastapi_backend/`) - route handlers wrap
  `pmt_core` services and return their TypedDict / Pydantic shapes
  directly through the OpenAPI schema.
- The **Next.js frontend** (`nextjs-frontend/`), indirectly through the
  generated TypeScript client in `nextjs-frontend/app/openapi-client/`.
- The **Reflex reference app** at
  `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/`,
  which uses the same package to keep the parity spec aligned.

By isolating models, services, and repositories from any specific UI
framework, the package keeps the FastAPI rebuild and the Reflex
reference reading from one source of truth.

## Installation

The package is consumed in editable mode from the FastAPI backend
through `uv sync --all-groups`. To install it directly:

```bash
# From repository root
uv pip install -e ./pmt_core_pkg

# Or with pip
pip install -e ./pmt_core_pkg
```

Verify:

```python
from pmt_core import __version__
print(f"pmt_core version: {__version__}")
```

## Package Structure

```text
pmt_core_pkg/pmt_core/
├── models/          # TypedDicts, Pydantic models, Enums (PositionRecord, OrderStatus, ...)
├── services/        # Business logic (PositionService, NotificationService, pricers, ...)
├── repositories/    # Data access (mock data + future durable backends)
├── exceptions.py    # Structured exception hierarchy (PMTError, DataValidationError, ...)
├── resources/       # Static resources (config templates, SQL queries)
└── utilities/       # Independent helpers (logging, dates)
```

## Usage

### Models and enums

```python
from pmt_core.models import PositionRecord, InstrumentType

pos: PositionRecord = {
    "symbol": "AAPL",
    "sec_type": InstrumentType.STOCK,
    "position": 100,
    "avg_cost": 150.0,
}
```

### Services

```python
from pmt_core.services import PositionService

position_service = PositionService()
positions = await position_service.get_positions(date=None)
```

This is the same pattern FastAPI route handlers use (see
`fastapi_backend/app/routes/positions.py`).

### Exceptions

```python
from pmt_core.exceptions import PMTError, DataValidationError

try:
    ...
except DataValidationError as exc:
    raise HTTPException(status_code=422, detail=str(exc))
```

## Testing

Tests live in `pmt_core_pkg/tests_core/`:

```bash
# All tests
pytest pmt_core_pkg/tests_core

# A single module
pytest pmt_core_pkg/tests_core/unit/test_models.py
```

The FastAPI suite at `fastapi_backend/tests/` exercises `pmt_core`
through HTTP, so it doubles as integration coverage.

## Related Documentation

- Repo overview: [`../README.md`](../README.md)
- Agent operating rules: [`../AGENTS.md`](../AGENTS.md)
- Backend architecture:
  [`../docs/fastapi_backend/backend-architecture.md`](../docs/fastapi_backend/backend-architecture.md)
