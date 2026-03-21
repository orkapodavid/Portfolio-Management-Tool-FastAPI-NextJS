"""
pmt_core.models.positions.types - Position TypedDict Definitions

Position data structure for holdings across all instrument types.
"""

from typing import TypedDict, Optional


class PositionRecord(TypedDict):
    """
    Position data structure for holdings across all instrument types.

    Aligned with: PositionItem, StockPositionItem, WarrantPositionItem, BondPositionItem
    from app/states/types.py

    Source: position_full.report.ini, position_tab/*
    """

    id: int
    trade_date: str
    deal_num: str
    detail_id: str
    underlying: str
    ticker: str
    company_name: str
    sec_id: str
    sec_type: str  # 'stock', 'warrant', 'bond', 'convertible'
    subtype: Optional[str]
    currency: str
    account_id: str
    pos_loc: str  # Position location
    notional: Optional[str]
    position: Optional[str]  # Quantity
    market_value: Optional[str]
