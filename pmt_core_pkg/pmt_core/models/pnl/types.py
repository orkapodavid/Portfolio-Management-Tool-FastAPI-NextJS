"""
pmt_core.models.pnl.types - PnL TypedDict Definitions

Profit and Loss data structures.
"""

from typing import TypedDict, Optional


class PnLRecord(TypedDict):
    """
    Profit and Loss data structure.

    Aligned with: PnLFullItem, PnLSummaryItem, PnLChangeItem
    from app/states/types.py

    Source: pnl_tab/*.report.ini
    """

    id: int
    trade_date: str
    underlying: str
    ticker: str
    currency: str
    # P&L values
    pnl_ytd: str
    pnl_mtd: Optional[str]
    pnl_wtd: Optional[str]
    pnl_dtd: Optional[str]
    # P&L changes
    pnl_chg_1d: str
    pnl_chg_1w: str
    pnl_chg_1m: str
    # P&L change percentages
    pnl_chg_pct_1d: str
    pnl_chg_pct_1w: str
    pnl_chg_pct_1m: str
    # Market data
    price: Optional[str]
    price_t_1: Optional[str]
    price_change: Optional[str]
    fx_rate: Optional[str]
