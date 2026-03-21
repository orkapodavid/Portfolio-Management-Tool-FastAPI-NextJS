from typing import Any, List
from pmt_core.repositories.common import DatabaseRepository
from pmt_core.models import ComplianceRecord
from pmt_core.models.common import ComplianceType
import logging
import random
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class ComplianceRepository(DatabaseRepository):
    """
    Repository for accessing Compliance data.
    """

    async def get_restricted_list(self) -> List[ComplianceRecord]:
        """Get restricted list data."""
        if self.mock_mode:
            logger.info("Returning mock restricted list data")
            tickers = ["AAPL", "TSLA", "NVDA", "META", "GOOGL", "AMD"]
            return [
                ComplianceRecord(
                    id=i + 1,
                    ticker=tickers[i % len(tickers)],
                    company_name=f"{tickers[i % len(tickers)]} Inc.",
                    compliance_type=ComplianceType.RESTRICTED.value,
                    in_emsx="Yes" if random.random() > 0.3 else "No",
                    firm_block="Yes" if random.random() > 0.7 else "No",
                    compliance_start="2026-01-01",
                    nda_end="2026-12-31",
                    mnpi_end=None,
                    wc_end=None,
                    undertaking_expiry=None,
                    account=None,
                    undertaking_type=None,
                    undertaking_details=None,
                )
                for i in range(8)
            ]
        return []

    async def get_undertakings(self, position_date: str = None) -> List[ComplianceRecord]:
        """Get undertakings data."""
        if self.mock_mode:
            logger.info(f"Returning mock undertakings data for date={position_date}")
            tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "META"]
            return [
                ComplianceRecord(
                    id=i + 1,
                    ticker=tickers[i % len(tickers)],
                    company_name=f"{tickers[i % len(tickers)]} Inc.",
                    compliance_type=ComplianceType.UNDERTAKING.value,
                    in_emsx=None,
                    firm_block=None,
                    compliance_start=None,
                    nda_end=None,
                    mnpi_end=None,
                    wc_end=None,
                    undertaking_expiry=(datetime.now() + timedelta(days=30)).strftime(
                        "%Y-%m-%d"
                    ),
                    account="ACC001",
                    undertaking_type="Lock-up",
                    undertaking_details="Details...",
                )
                for i in range(6)
            ]
        return []

    async def get_beneficial_ownership(self, position_date: str = None) -> List[ComplianceRecord]:
        """Get beneficial ownership data."""
        if self.mock_mode:
            logger.info(f"Returning mock beneficial ownership data for date={position_date}")
            tickers = ["AAPL", "TSLA", "NVDA", "AMD", "META", "GOOGL"]
            return [
                ComplianceRecord(
                    id=i + 1,
                    ticker=tickers[i % len(tickers)],
                    company_name=f"{tickers[i % len(tickers)]} Inc.",
                    compliance_type=ComplianceType.BENEFICIAL_OWNERSHIP.value,
                    in_emsx=None,
                    firm_block=None,
                    compliance_start="2026-01-01",
                    nda_end=None,
                    mnpi_end=None,
                    wc_end=None,
                    undertaking_expiry=None,
                    account=None,
                    undertaking_type=None,
                    undertaking_details=None,
                )
                for i in range(10)
            ]
        return []

    async def get_monthly_exercise_limits(self, position_date: str = None) -> List[dict[str, Any]]:
        """Get monthly exercise limits data."""
        if self.mock_mode:
            logger.info(f"Returning mock monthly exercise limits data for date={position_date}")
            tickers = ["AAPL", "TSLA", "NVDA", "META"]
            return [
                {
                    "id": i + 1,
                    "deal_num": f"DEAL{i + 1:03d}",
                    "underlying": tickers[i % len(tickers)],  # Required for row_id_key
                    "ticker": tickers[i % len(tickers)],
                    "company_name": f"{tickers[i % len(tickers)]} Inc.",
                    "month": f"2026-{(i % 12) + 1:02d}",
                    "exercise_limit": f"{(i + 1) * 10000:,}",
                    "exercised_qty": f"{(i + 1) * 5000:,}",
                    "remaining_qty": f"{(i + 1) * 5000:,}",
                    "limit_type": ["Soft", "Hard"][i % 2],
                    "original_quantity": "100M",
                    "monthly_sal": "10%",
                }
                for i in range(8)
            ]
        return []
