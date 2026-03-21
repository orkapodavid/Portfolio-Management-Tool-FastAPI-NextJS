from typing import Any, List, Optional
from pmt_core.repositories.common import DatabaseRepository
from pmt_core.models import PositionRecord, InstrumentType
import logging

logger = logging.getLogger(__name__)


class PositionRepository(DatabaseRepository):
    """
    Repository for accessing Position and Instrument related data.
    Returns pmt_core models.
    """

    async def get_positions(
        self, position_date: Optional[str] = None
    ) -> List[PositionRecord]:
        """Get all positions."""
        if self.mock_mode:
            logger.info("Returning mock positions")
            # Using basic dicts that match PositionRecord structure, relying on TypedDict
            # In a real scenario, we would map SQL rows to PositionRecord
            positions = []
            
            # Generate 10 Equity positions
            for i in range(10):
                positions.append(
                    PositionRecord(
                        id=i,
                        trade_date=position_date or "2026-01-17",
                        deal_num=f"DEAL{i:03d}",
                        detail_id=f"D{i:03d}",
                        underlying=f"TKR{i} US Equity",
                        ticker=f"TKR{i}",
                        company_name=f"Company {i}",
                        sec_id=f"SEC{i:06d}",
                        sec_type="Equity",
                        subtype=None,
                        currency="USD",
                        account_id="ACC001",
                        pos_loc="NY",
                        notional=f"${(i + 1) * 50000:,.2f}",
                        position=f"{(i + 1) * 1000}",
                        market_value=f"${(i + 1) * 52500:,.2f}",
                    )
                )
            
            # Generate 5 Warrant positions
            for i in range(5):
                positions.append(
                    PositionRecord(
                        id=100 + i,
                        trade_date=position_date or "2026-01-17",
                        deal_num=f"WDEAL{i:03d}",
                        detail_id=f"WD{i:03d}",
                        underlying=f"WRT{i} US Warrant",
                        ticker=f"WRT{i}",
                        company_name=f"Warrant Co {i}",
                        sec_id=f"WSEC{i:06d}",
                        sec_type="Warrant",
                        subtype="Call",
                        currency="USD",
                        account_id="ACC002",
                        pos_loc="NY",
                        notional=f"${(i + 1) * 25000:,.2f}",
                        position=f"{(i + 1) * 500}",
                        market_value=f"${(i + 1) * 26250:,.2f}",
                    )
                )
            
            # Generate 5 Bond positions
            for i in range(5):
                positions.append(
                    PositionRecord(
                        id=200 + i,
                        trade_date=position_date or "2026-01-17",
                        deal_num=f"BDEAL{i:03d}",
                        detail_id=f"BD{i:03d}",
                        underlying=f"BND{i} US Bond",
                        ticker=f"BND{i}",
                        company_name=f"Bond Issuer {i}",
                        sec_id=f"BSEC{i:06d}",
                        sec_type="Bond",
                        subtype="Corporate",
                        currency="USD",
                        account_id="ACC003",
                        pos_loc="LN",
                        notional=f"${(i + 1) * 100000:,.2f}",
                        position=f"{(i + 1) * 100}",
                        market_value=f"${(i + 1) * 101500:,.2f}",
                    )
                )
            
            return positions
        return []

    async def get_instrument_data(self) -> List[dict[str, Any]]:
        """Get instrument data."""
        if self.mock_mode:
            logger.info("Returning mock instrument data")
            return [
                {
                    "id": 1,
                    "deal_num": "D001",
                    "detail_id": "DT001",
                    "underlying": "AAPL",
                    "ticker": "AAPL",
                    "company_name": "Apple Inc.",
                    "sec_id": "SEC001",
                    "sec_type": "Equity",
                    "pos_loc": "US",
                    "account": "Main Account",
                },
            ]
        return []

    async def get_instrument_terms(self) -> List[dict[str, Any]]:
        """Get instrument terms data."""
        if self.mock_mode:
            logger.info("Returning mock instrument terms data")
            return [
                {
                    "id": 1,
                    "deal_num": "D001",
                    "detail_id": "DT001",
                    "underlying": "AAPL",
                    "ticker": "AAPL",
                    "company_name": "Apple Inc.",
                    "sec_type": "Warrant",
                    "effective_date": "2025-01-01",
                    "maturity_date": "2027-01-01",
                    "first_reset_da": "2025-06-01",
                },
            ]
        return []

    async def get_special_terms(self) -> List[dict[str, Any]]:
        """Get special terms data."""
        if self.mock_mode:
            logger.info("Returning mock special terms data")
            return [
                {
                    "id": 1,
                    "deal_num": "D001",
                    "ticker": "AAPL",
                    "company_name": "Apple Inc.",
                    "sec_type": "Equity",
                    "pos_loc": "US",
                    "account": "Main Account",
                    "effective_date": "2025-01-01",
                    "position": "10,000",
                },
            ]
        return []

    async def get_ticker_data(self) -> List[dict[str, Any]]:
        """Get ticker data."""
        if self.mock_mode:
            logger.info("Returning mock ticker data")
            tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "META", "AMZN", "AMD"]
            sectors = [
                "Technology",
                "Technology",
                "Automotive",
                "Technology",
                "Technology",
                "Technology",
                "Consumer",
                "Technology",
            ]
            return [
                {
                    "id": i + 1,
                    "ticker": tickers[i],
                    "currency": "USD",
                    "fx_rate": "1.0000",
                    "sector": sectors[i],
                    "company": f"{tickers[i]} Inc.",
                    "po_lead_manager": [
                        "Goldman Sachs",
                        "Morgan Stanley",
                        "JP Morgan",
                        "Citibank",
                    ][i % 4],
                    "fmat_cap": f"${(2.5 + i * 0.3):.2f}T",
                    "smkt_cap": f"${(2.5 + i * 0.3):.2f}T",
                    "chg_1d_pct": f"{(-1.5 + i * 0.5):.2f}%",
                    "dtl": f"{30 + i * 5}",
                }
                for i in range(len(tickers))
            ]
        return []

    async def get_stock_screener(self) -> List[dict[str, Any]]:
        """Get stock screener data."""
        if self.mock_mode:
            logger.info("Returning mock stock screener data")
            return [
                {
                    "id": 1,
                    "otl": "1",
                    "mkt_cap_37_pct": "12.5%",
                    "ticker": "AAPL",
                    "company": "Apple Inc.",
                    "country": "USA",
                    "industry": "Technology",
                    "last_price": "182.50",
                    "mkt_cap_loc": "2.95T",
                    "mkt_cap_usd": "2.95T",
                    "adv_3m": "54.2M",
                    "locate_qty_mm": "100",
                    "locate_f": "Y",
                },
            ]
        return []
