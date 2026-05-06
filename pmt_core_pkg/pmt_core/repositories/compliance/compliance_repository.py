from typing import Any, List
from pmt_core.repositories.common import DatabaseRepository
from pmt_core.models import (
    BeneficialOwnershipRecord,
    ComplianceRecord,
    MonthlyExerciseLimitRecord,
)
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

    async def get_beneficial_ownership(
        self, position_date: str = None
    ) -> List[BeneficialOwnershipRecord]:
        """Get beneficial ownership data.

        Mirrors `BeneficialOwnershipItem` from the Reflex reference: the
        grid expects trade-date / ticker / company / NOSH (reported, BBG,
        proforma) / shares (stock, warrant, bond, total). Numeric fields
        are returned as comma-formatted strings to match the Reflex
        renderer.
        """
        if self.mock_mode:
            logger.info(
                f"Returning mock beneficial ownership data for date={position_date}"
            )
            tickers = ["AAPL", "TSLA", "NVDA", "AMD", "META", "GOOGL"]
            today = (position_date or datetime.now().strftime("%Y-%m-%d"))
            records: List[BeneficialOwnershipRecord] = []
            for i in range(10):
                stock = (i + 1) * 250_000
                warrant = (i + 1) * 50_000
                bond = (i + 1) * 25_000
                total = stock + warrant + bond
                nosh = (i + 1) * 5_000_000
                records.append(
                    BeneficialOwnershipRecord(
                        id=i + 1,
                        trade_date=today,
                        ticker=tickers[i % len(tickers)],
                        company_name=f"{tickers[i % len(tickers)]} Inc.",
                        nosh_reported=f"{nosh:,}",
                        nosh_bbg=f"{nosh + 100_000:,}",
                        nosh_proforma=f"{nosh + 50_000:,}",
                        stock_shares=f"{stock:,}",
                        warrant_shares=f"{warrant:,}",
                        bond_shares=f"{bond:,}",
                        total_shares=f"{total:,}",
                    )
                )
            return records
        return []

    async def get_monthly_exercise_limits(
        self, position_date: str = None
    ) -> List[MonthlyExerciseLimitRecord]:
        """Get monthly exercise limits data.

        Mirrors `MonthlyExerciseLimitItem` from the Reflex reference. The
        grid expects underlying / ticker / company / sec_type plus the
        original-NOSH/quantity columns and the monthly exercised
        quantity, percent, and SAL.
        """
        if self.mock_mode:
            logger.info(
                f"Returning mock monthly exercise limits data for date={position_date}"
            )
            tickers = ["AAPL", "TSLA", "NVDA", "META"]
            sec_types = ["Warrant", "Convertible", "Warrant", "Convertible"]
            records: List[MonthlyExerciseLimitRecord] = []
            for i in range(8):
                original_qty = (i + 1) * 1_000_000
                exercised = original_qty // 10
                pct = (exercised / original_qty) * 100
                records.append(
                    MonthlyExerciseLimitRecord(
                        id=i + 1,
                        underlying=tickers[i % len(tickers)],
                        ticker=tickers[i % len(tickers)],
                        company_name=f"{tickers[i % len(tickers)]} Inc.",
                        sec_type=sec_types[i % len(sec_types)],
                        original_nosh=f"{(i + 1) * 5_000_000:,}",
                        original_quantity=f"{original_qty:,}",
                        monthly_exercised_quantity=f"{exercised:,}",
                        monthly_exercised_pct=f"{pct:.2f}%",
                        monthly_sal=f"{exercised // 4:,}",
                    )
                )
            return records
        return []
