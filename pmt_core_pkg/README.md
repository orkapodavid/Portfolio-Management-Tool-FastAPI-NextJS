# pmt_core

Shared business logic for Portfolio Management Tool.

## Overview

`pmt_core` is a standalone Python package containing shared business logic, data models, and utilities used by both:

- The **Reflex web application** (`app/`)
- Future integration with **PyQt desktop application** (`source/`)

This package enables code reuse and maintains consistency between the two UIs.

## Installation

### Development (Editable Install)
```bash
# From repository root
pip install -e ./pmt_core

# Or with uv
uv pip install -e ./pmt_core
```

### Verify Installation
```python
from pmt_core import __version__
print(f"pmt_core version: {__version__}")
```

## Package Structure

```
pmt_core/
├── models/          # Data descriptions (Pydantic models, TypedDicts, Enums)
├── services/        # Business logic (Pricing, Risk, Reporting, etc.)
├── repositories/    # Data access layer (Database, File System)
├── exceptions/      # Custom exception hierarchy
├── resources/       # Static resources (Config templates, SQL queries)
└── utilities/       # Independent helpers (Logging, Dates)
```

## Usage

### Models & Enums

Imports are organized for easy access.

```python
from pmt_core.models import PositionRecord, InstrumentType, OrderStatus

def check_status(status: OrderStatus):
    if status == OrderStatus.FILLED:
        print("Order filled!")

pos: PositionRecord = {
    "symbol": "AAPL",
    "sec_type": InstrumentType.STOCK,
    "position": 100,
    "avg_cost": 150.0
}
```

### Services

Services encapsulate business logic.

```python
from pmt_core.services import ReportService, PositionService

# Services handle complex operations
# report = ReportService.generate_daily_pnl()
```

### Repositories

Repositories handle data access.

```python
from pmt_core.repositories import PositionRepository

# Repositories abstract the data storage
# positions = PositionRepository.get_all_positions()
```

### Exceptions

Structured error handling.

```python
from pmt_core.exceptions import PMTError, DataValidationError

try:
    # perform operation
    pass
except DataValidationError as e:
    print(f"Invalid data: {e}")
```

## Testing

Tests are located in `tests_core/`.

```bash
# Run all tests
pytest pmt_core_pkg/tests_core

# Run specific test file
pytest pmt_core_pkg/tests_core/unit/test_models.py
```

## Dependencies

- `pandas` - Data manipulation
- `pyodbc` - Database connectivity
- `python-dotenv` - Environment configuration

## Related Documentation

- [PMT Architecture](../docs/pmt.md)
- [Main AGENTS.md](../AGENTS.md)
