"""
pmt_core.repositories - Data Access Layer

This module exports all repository classes for use throughout the application.
Import from module-specific paths for new code, or use these re-exports for
backward compatibility.
"""

# Common base class
from pmt_core.repositories.common import DatabaseRepository

# Module-specific repository imports (new structure)
from pmt_core.repositories.positions import PositionRepository
from pmt_core.repositories.pnl import PnLRepository
from pmt_core.repositories.compliance import ComplianceRepository
from pmt_core.repositories.recon import ReconRepository
from pmt_core.repositories.operations import OperationsRepository
from pmt_core.repositories.events import EventRepository

# Protocol interfaces for dependency injection
from pmt_core.repositories.protocols import (
    PnLRepositoryProtocol,
    PositionRepositoryProtocol,
    ComplianceRepositoryProtocol,
    OperationsRepositoryProtocol,
    EventRepositoryProtocol,
    ReconRepositoryProtocol,
)

__all__ = [
    "DatabaseRepository",
    "PositionRepository",
    "PnLRepository",
    "ComplianceRepository",
    "ReconRepository",
    "OperationsRepository",
    "EventRepository",
    # Protocols
    "PnLRepositoryProtocol",
    "PositionRepositoryProtocol",
    "ComplianceRepositoryProtocol",
    "OperationsRepositoryProtocol",
    "EventRepositoryProtocol",
    "ReconRepositoryProtocol",
]
