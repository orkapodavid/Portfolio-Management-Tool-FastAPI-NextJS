"""
pmt_core.models.market_data.types - Market Data TypedDict Definitions

Market data structure for real-time and historical data.
"""

from typing import TypedDict, Optional


class MarketDataRecord(TypedDict):
    """
    Market data structure for real-time and historical data.

    Aligned with: MarketDataItem, FXDataItem, HistoricalDataItem
    from app/states/types.py

    Source: market_data_tab/market_data.report.ini
    Data: Bloomberg real-time via worker_market_data.py
    """

    id: int
    ticker: str
    currency: Optional[str]
    # Pricing
    last_price: str
    bid: str
    ask: str
    vwap_price: Optional[str]
    # Volume
    last_volume: str
    listed_shares: Optional[str]
    # Changes
    chg_1d_pct: str
    implied_vol_pct: Optional[str]
    # Status
    market_status: str
    # Audit
    created_by: Optional[str]
    created_time: Optional[str]
    updated_by: Optional[str]
    updated_time: Optional[str]
