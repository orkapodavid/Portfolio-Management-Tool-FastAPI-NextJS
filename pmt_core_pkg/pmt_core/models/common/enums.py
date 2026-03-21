"""
pmt_core.models.common.enums - Shared Enumeration Types

Placeholder enums based on PMT documentation (docs/pmt.md).
These will be refined once PyQt source code is available.
"""

from enum import Enum


class InstrumentType(str, Enum):
    """
    Types of financial instruments supported by the system.

    Source: source/models/enum_*.py (pending access)
    """

    STOCK = "stock"
    WARRANT = "warrant"
    BOND = "bond"
    CONVERTIBLE = "convertible"
    OPTION = "option"
    SWAP = "swap"


class DashboardSection(str, Enum):
    """
    Dashboard sections/tabs in the application.

    Maps to: dashboard_name in .report.ini files
    """

    POSITIONS = "positions"
    PNL = "pnl"
    COMPLIANCE = "compliance"
    RISK = "risk"
    TRADING = "trading"
    MARKET_DATA = "market_data"
    INSTRUMENTS = "instruments"
    EVENTS = "events"
    OPERATIONS = "operations"
    RECONCILIATION = "reconciliation"
    PORTFOLIO_TOOLS = "portfolio_tools"
    ANALYTICS = "analytics"


class OrderStatus(str, Enum):
    """
    EMSX order status values.

    Source: trading_tab/emsx_order.report.ini
    """

    NEW = "new"
    WORKING = "working"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    EXPIRED = "expired"
    PENDING_NEW = "pending_new"
    PENDING_CANCEL = "pending_cancel"


class OrderSide(str, Enum):
    """
    Order side (buy/sell) values.
    """

    BUY = "buy"
    SELL = "sell"
    SHORT = "short"
    COVER = "cover"


class ComplianceType(str, Enum):
    """
    Compliance record types.

    Source: compliance_tab/*.report.ini
    """

    RESTRICTED = "restricted"
    UNDERTAKING = "undertaking"
    BENEFICIAL_OWNERSHIP = "beneficial_ownership"
    NDA = "nda"
    MNPI = "mnpi"
    WALL_CROSS = "wall_cross"


class MarketStatus(str, Enum):
    """
    Market trading status values.
    """

    OPEN = "open"
    CLOSED = "closed"
    PRE_MARKET = "pre_market"
    AFTER_HOURS = "after_hours"
    HALTED = "halted"


class Currency(str, Enum):
    """
    Common currency codes used in the system.
    """

    USD = "USD"
    HKD = "HKD"
    JPY = "JPY"
    CNY = "CNY"
    EUR = "EUR"
    GBP = "GBP"
    AUD = "AUD"
    SGD = "SGD"
    KRW = "KRW"
    TWD = "TWD"
    INR = "INR"


class ReconciliationStatus(str, Enum):
    """
    Reconciliation status values.
    """

    MATCHED = "matched"
    UNMATCHED = "unmatched"
    PARTIAL = "partial"
    PENDING = "pending"
    FAILED = "failed"
