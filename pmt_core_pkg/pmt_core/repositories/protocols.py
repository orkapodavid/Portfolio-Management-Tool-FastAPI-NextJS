"""
Repository Protocol Interfaces — structural typing for dependency injection.

Each Protocol mirrors the public async methods of the corresponding concrete
repository, enabling type-safe DI in services and easy mock substitution in tests.

Usage in service __init__:
    def __init__(self, repository: PnLRepositoryProtocol | None = None):
        self.repository = repository or PnLRepository()
"""

from __future__ import annotations

from typing import Any, List, Optional, Protocol, runtime_checkable


# ─── PnL ────────────────────────────────────────────────────────────────────


@runtime_checkable
class PnLRepositoryProtocol(Protocol):
    """Protocol for PnL data access."""

    async def get_pnl_changes(self, trade_date: Optional[str] = None) -> List[Any]: ...

    async def get_pnl_recon(self) -> List[dict[str, Any]]: ...


# ─── Positions ──────────────────────────────────────────────────────────────


@runtime_checkable
class PositionRepositoryProtocol(Protocol):
    """Protocol for Position and Instrument data access."""

    async def get_positions(self, position_date: Optional[str] = None) -> List[Any]: ...

    async def get_instrument_data(self) -> List[dict[str, Any]]: ...

    async def get_instrument_terms(self) -> List[dict[str, Any]]: ...

    async def get_special_terms(self) -> List[dict[str, Any]]: ...

    async def get_ticker_data(self) -> List[dict[str, Any]]: ...

    async def get_stock_screener(self) -> List[dict[str, Any]]: ...


# ─── Compliance ─────────────────────────────────────────────────────────────


@runtime_checkable
class ComplianceRepositoryProtocol(Protocol):
    """Protocol for Compliance data access."""

    async def get_restricted_list(self) -> List[Any]: ...

    async def get_undertakings(self, position_date: str = None) -> List[Any]: ...

    async def get_beneficial_ownership(
        self, position_date: str = None
    ) -> List[Any]: ...

    async def get_monthly_exercise_limits(
        self, position_date: str = None
    ) -> List[dict[str, Any]]: ...


# ─── Operations ─────────────────────────────────────────────────────────────


@runtime_checkable
class OperationsRepositoryProtocol(Protocol):
    """Protocol for Operations data access."""

    async def get_daily_procedures(self) -> List[dict[str, Any]]: ...

    async def get_operation_processes(self) -> List[dict[str, Any]]: ...


# ─── Events ─────────────────────────────────────────────────────────────────


@runtime_checkable
class EventRepositoryProtocol(Protocol):
    """Protocol for Event data access."""

    async def get_event_calendar(self) -> List[dict[str, Any]]: ...

    async def get_event_stream(self) -> List[dict[str, Any]]: ...

    async def get_reverse_inquiry(self) -> List[dict[str, Any]]: ...


# ─── Reconciliation ────────────────────────────────────────────────────────


@runtime_checkable
class ReconRepositoryProtocol(Protocol):
    """Protocol for Reconciliation data access."""

    async def get_pps_recon(self) -> List[dict[str, Any]]: ...

    async def get_settlement_recon(self) -> List[dict[str, Any]]: ...

    async def get_failed_trades(self) -> List[dict[str, Any]]: ...

    async def get_risk_input_recon(self) -> List[dict[str, Any]]: ...
