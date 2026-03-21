"""
pmt_core.models.risk.types - Risk TypedDict Definitions

Risk data structure for Greeks and risk measures.
"""

from typing import TypedDict, Optional


class RiskRecord(TypedDict):
    """
    Risk data structure for Greeks and risk measures.

    Aligned with: RiskMeasureItem, RiskInputItem, DeltaChangeItem
    from app/states/types.py

    Source: analytics_tab/*.report.ini
    """

    id: int
    underlying: str
    ticker: str
    company_name: Optional[str]
    sec_type: str
    currency: str
    fx_rate: str
    # Risk inputs
    spot_price: str
    valuation_price: Optional[str]
    # Greeks
    delta: Optional[str]
    gamma: Optional[str]
    vega: Optional[str]
    theta: Optional[str]
    # Position Greeks
    pos_delta: Optional[str]
    pos_gamma: Optional[str]
    # Simulation parameters
    seed: Optional[str]
    simulation_num: Optional[str]
    trial_num: Optional[str]
    # Notional
    notional: Optional[str]
    notional_used: Optional[str]
    notional_current: Optional[str]
    is_private: Optional[str]
