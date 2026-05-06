"""
pmt_core.models.compliance.types - Compliance TypedDict Definitions

Compliance data structures for restricted lists, undertakings, and beneficial
ownership. The shapes mirror the Reflex reference at
`Portfolio-Management-Tool-reflex/app/states/compliance/types.py` so both
front-ends consume the same contract.
"""

from typing import TypedDict, Optional


class ComplianceRecord(TypedDict):
    """
    Compliance data structure for restricted lists and undertakings.

    Aligned with: RestrictedListItem, UndertakingItem from the reflex
    `app/states/compliance/types.py`.

    Source: compliance_tab/*.report.ini
    """

    id: int
    ticker: str
    company_name: str
    # Compliance status
    compliance_type: str  # 'restricted', 'undertaking', 'beneficial_ownership'
    in_emsx: Optional[str]
    firm_block: Optional[str]
    # Dates
    compliance_start: Optional[str]
    nda_end: Optional[str]
    mnpi_end: Optional[str]
    wc_end: Optional[str]
    undertaking_expiry: Optional[str]
    # Details
    account: Optional[str]
    undertaking_type: Optional[str]
    undertaking_details: Optional[str]


class BeneficialOwnershipRecord(TypedDict):
    """
    Beneficial ownership data structure.

    Aligned with: BeneficialOwnershipItem from the reflex
    `app/states/compliance/types.py`. The grid headers
    (Trade Date / Ticker / Company / NOSH Reported / NOSH BBG /
    NOSH Proforma / Stock / Warrant / Bond / Total Shares) come straight
    from this shape.
    """

    id: int
    trade_date: str
    ticker: str
    company_name: str
    nosh_reported: str
    nosh_bbg: str
    nosh_proforma: str
    stock_shares: str
    warrant_shares: str
    bond_shares: str
    total_shares: str
