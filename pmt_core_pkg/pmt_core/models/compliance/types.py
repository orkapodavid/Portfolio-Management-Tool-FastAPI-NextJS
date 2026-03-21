"""
pmt_core.models.compliance.types - Compliance TypedDict Definitions

Compliance data structure for restricted lists and undertakings.
"""

from typing import TypedDict, Optional


class ComplianceRecord(TypedDict):
    """
    Compliance data structure for restricted lists and undertakings.

    Aligned with: RestrictedListItem, UndertakingItem, BeneficialOwnershipItem
    from app/states/types.py

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
