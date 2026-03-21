from typing import Any, List
from pmt_core.repositories.common import DatabaseRepository
import logging

logger = logging.getLogger(__name__)


class ReconRepository(DatabaseRepository):
    """
    Repository for accessing Reconciliation data.
    """

    async def get_pps_recon(self) -> List[dict[str, Any]]:
        """Get PPS reconciliation data."""
        if self.mock_mode:
            logger.info("Returning mock PPS reconciliation data")
            tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL"]
            return [
                {
                    "id": i + 1,
                    "value_date": f"2026-01-{11 + i}",
                    "trade_date": f"2026-01-{10 + i}",
                    "underlying": tickers[i % len(tickers)],
                    "ticker": tickers[i % len(tickers)],
                    "code": f"PPS{i + 1:03d}",
                    "company_name": f"{tickers[i % len(tickers)]} Inc.",
                    "sec_type": ["Equity", "Warrant", "Bond"][i % 3],
                    "pos_loc": ["US", "HK", "UK"][i % 3],
                    "account": f"ACC{(i % 3) + 1:03d}",
                }
                for i in range(10)
            ]
        return []

    async def get_settlement_recon(self) -> List[dict[str, Any]]:
        """Get settlement reconciliation data."""
        if self.mock_mode:
            logger.info("Returning mock settlement reconciliation data")
            tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL"]
            return [
                {
                    "id": i + 1,
                    "trade_date": f"2026-01-{10 + i}",
                    "ml_report_date": f"2026-01-{11 + i}",
                    "underlying": tickers[i % len(tickers)],
                    "ticker": tickers[i % len(tickers)],
                    "company_name": f"{tickers[i % len(tickers)]} Inc.",
                    "pos_loc": ["US", "HK", "UK"][i % 3],
                    "currency": ["USD", "HKD", "GBP"][i % 3],
                    "sec_type": ["Equity", "Warrant", "Bond"][i % 3],
                    "position_settled": f"{(i + 1) * 1000:,}",
                    "ml_inventory": f"{(i + 1) * 1000:,}",
                }
                for i in range(8)
            ]
        return []

    async def get_failed_trades(self) -> List[dict[str, Any]]:
        """Get failed trades data."""
        if self.mock_mode:
            logger.info("Returning mock failed trades data")
            tickers = ["TSLA", "AMD", "NVDA"]
            return [
                {
                    "id": i + 1,
                    "report_date": f"2026-01-{11 + i}",
                    "trade_date": f"2026-01-{10 + i}",
                    "value_date": f"2026-01-{11 + i}",
                    "settlement_date": f"2026-01-{12 + i}",
                    "portfolio_code": f"PFOLIO{i + 1:02d}",
                    "instrument_ref": f"INST{i + 1:04d}",
                    "instrument_name": f"{tickers[i % len(tickers)]} Option",
                    "ticker": tickers[i % len(tickers)],
                    "company_name": f"{tickers[i % len(tickers)]} Inc.",
                    "isin": f"US{i + 1:010d}",
                    "sedol": f"B{i + 1:06d}",
                    "broker": ["GS", "MS", "JPM"][i % 3],
                    "glass_reference": f"GLASS{i + 1:05d}",
                    "trade_reference": f"TRADE{i + 1:05d}",
                    "deal_type": ["Buy", "Sell"][i % 2],
                    "q": f"{(i + 1) * 500}",
                }
                for i in range(5)
            ]
        return []

    async def get_risk_input_recon(self) -> List[dict[str, Any]]:
        """Get risk input reconciliation data."""
        if self.mock_mode:
            logger.info("Returning mock risk input reconciliation data")
            tickers = ["AAPL", "TSLA", "NVDA", "META", "AMD"]
            return [
                {
                    "id": i + 1,
                    "value_date": f"2026-01-{11 + i}",
                    "underlying": tickers[i % len(tickers)],
                    "ticker": tickers[i % len(tickers)],
                    "sec_type": ["Equity", "Warrant", "Bond"][i % 3],
                    "spot_mc": f"{150 + i * 5:.2f}",
                    "spot_ppd": f"{150 + i * 5 + 0.5:.2f}",
                    "position": f"{(i + 1) * 1000:,}",
                    "value_mc": f"${(i + 1) * 150000:,.2f}",
                    "value_ppd": f"${(i + 1) * 150000 + 500:,.2f}",
                }
                for i in range(10)
            ]
        return []
