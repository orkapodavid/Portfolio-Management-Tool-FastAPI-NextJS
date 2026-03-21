"""
Reconciliation Service — core business logic for reconciliation data.

Provides mock data for PPS recon, settlement recon, failed trades,
P&L recon, and risk input recon.
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class ReconciliationService:
    """
    Service for managing reconciliation data.

    Generates mock reconciliation data.
    Real implementation would delegate to a repository layer.
    """

    async def get_pps_recon(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get PPS reconciliation data. TODO: Replace with DB query."""
        logger.info(f"Returning mock PPS reconciliation data for date={position_date}")
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

    async def get_settlement_recon(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get settlement reconciliation data. TODO: Replace with DB query."""
        logger.info(f"Returning mock settlement reconciliation data for date={position_date}")
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

    async def get_failed_trades(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get failed trades data. TODO: Replace with DB query."""
        logger.info(f"Returning mock failed trades data for date={position_date}")
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

    async def get_pnl_recon(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get P&L reconciliation data. TODO: Replace with DB query."""
        logger.info(f"Returning mock P&L reconciliation data for date={position_date}")
        tickers = ["AAPL", "MSFT", "TSLA", "NVDA"]
        return [
            {
                "id": i + 1,
                "trade_date": f"2026-01-{10 + i}",
                "report_date": f"2026-01-{11 + i}",
                "deal_num": f"DEAL{i + 1:03d}",
                "row_index": f"{i + 1}",
                "underlying": tickers[i % len(tickers)],
                "pos_loc": ["US", "HK", "UK"][i % 3],
                "stock_sec_id": f"STK{i + 1:04d}",
                "warrant_sec_id": f"WRT{i + 1:04d}",
                "bond_sec_id": f"BND{i + 1:04d}",
                "stock_position": f"{(i + 1) * 1000:,}",
            }
            for i in range(8)
        ]

    async def get_risk_input_recon(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get risk input reconciliation data. TODO: Replace with DB query."""
        logger.info(f"Returning mock risk input reconciliation data for date={position_date}")
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
