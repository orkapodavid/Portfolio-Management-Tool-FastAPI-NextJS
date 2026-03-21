"""
pmt_core.models.orders.types - Order TypedDict Definitions

Order data structure for EMSX trading orders.
"""

from typing import TypedDict, Optional


class OrderRecord(TypedDict):
    """
    Order data structure for EMSX trading orders.

    Aligned with: EMSXOrderItem from app/states/types.py

    Source: trading_tab/emsx_order.report.ini, emsx_order_class.py
    Data: Live EMSX via EMSXOrderWorker + DB fallback
    """

    id: int
    sequence: str
    underlying: str
    ticker: str
    broker: str
    pos_loc: str
    side: str  # 'buy', 'sell'
    status: str  # 'working', 'filled', 'cancelled', etc.
    # Amounts
    order_amount: str
    routed_amount: str
    working_amount: str
    filled_amount: str
    # Pricing
    limit_price: Optional[str]
    avg_fill_price: Optional[str]
    # Timing
    order_time: Optional[str]
    last_update_time: Optional[str]
