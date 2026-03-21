from typing import List, Optional
from pmt_core.repositories.positions import PositionRepository
from pmt_core.repositories.protocols import PositionRepositoryProtocol
from pmt_core.models import PositionRecord
import logging

logger = logging.getLogger(__name__)


class PositionService:
    """
    Core business service for Positions.
    Delegates data fetching to PositionRepository.
    """

    def __init__(self, repository: Optional[PositionRepositoryProtocol] = None):
        self.repository = repository or PositionRepository()

    async def get_positions(
        self, position_date: Optional[str] = None
    ) -> List[PositionRecord]:
        """Get all positions."""
        return await self.repository.get_positions(position_date)

    async def get_stock_positions(
        self, position_date: Optional[str] = None
    ) -> List[PositionRecord]:
        """Get stock positions only."""
        positions = await self.repository.get_positions(position_date)
        # Filter for stocks (mock logic in repo might need updating to support varied types,
        # but for now we filter what we get or return all if mock data is generic)
        # Real impl would pass filter to repo or filter here
        return [
            p for p in positions if p.get("sec_type") == "Equity"
        ]  # Using generic string check for now or InstrumentType

    async def get_warrant_positions(
        self, position_date: Optional[str] = None
    ) -> List[PositionRecord]:
        """Get warrant positions only."""
        # For mock purposes, asking repo for warrants specifically if supported, or filtering
        # Since repo mock returns generic mixed or we can just ask repo to return warrants
        # Ideally repo execution handles SQL filter.
        # Here we just mock return from repo or filter
        positions = await self.repository.get_positions(position_date)
        return [p for p in positions if p.get("sec_type") == "Warrant"]

    async def get_bond_positions(
        self, position_date: Optional[str] = None
    ) -> List[PositionRecord]:
        """Get bond positions only."""
        positions = await self.repository.get_positions(position_date)
        return [p for p in positions if p.get("sec_type") in ["Bond", "Convertible"]]

    async def get_trade_summary(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> list[dict]:
        """Get trade summary for date range. TODO: Replace with DB query."""
        logger.info("Returning mock trade summary data")
        return [
            {
                "id": i,
                "deal_num": f"TDEAL{i:03d}",
                "detail_id": f"TD{i:03d}",
                "ticker": f"TRD{i}",
                "underlying": f"TRD{i} US Equity",
                "account_id": f"ACC00{i % 3 + 1}",
                "company_name": f"Trade Co {i}",
                "sec_id": f"TSEC{i:06d}",
                "sec_type": ["Equity", "Warrant", "Bond"][i % 3],
                "subtype": ["Common", "Call", "Corporate"][i % 3],
                "currency": "USD",
                "closing_date": "2026-01-31",
                "divisor": f"{1.0 + i * 0.05:.4f}",
            }
            for i in range(8)
        ]
