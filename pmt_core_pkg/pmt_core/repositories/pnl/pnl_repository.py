from typing import Any, List, Optional
from pmt_core.repositories.common import DatabaseRepository
from pmt_core.models import PnLRecord
import logging
import random
from datetime import datetime

logger = logging.getLogger(__name__)


class PnLRepository(DatabaseRepository):
    """
    Repository for accessing PnL data.
    """

    async def get_pnl_changes(
        self, trade_date: Optional[str] = None
    ) -> List[PnLRecord]:
        """Get P&L changes."""
        if self.mock_mode:
            logger.info("Returning mock P&L changes")
            date_str = trade_date or datetime.now().strftime("%Y-%m-%d")
            tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"]

            return [
                PnLRecord(
                    id=i,
                    trade_date=date_str,
                    underlying=f"{ticker} US Equity",
                    ticker=ticker,
                    currency="USD",
                    pnl_ytd=f"${random.uniform(-50000, 150000):,.2f}",
                    pnl_mtd=f"${random.uniform(-10000, 30000):,.2f}",
                    pnl_wtd=f"${random.uniform(-5000, 15000):,.2f}",
                    pnl_dtd=f"${random.uniform(-2000, 5000):,.2f}",
                    pnl_chg_1d=f"${random.uniform(-5000, 5000):,.2f}",
                    pnl_chg_1w=f"${random.uniform(-15000, 15000):,.2f}",
                    pnl_chg_1m=f"${random.uniform(-50000, 50000):,.2f}",
                    pnl_chg_pct_1d=f"{random.uniform(-3, 3):.2f}%",
                    pnl_chg_pct_1w=f"{random.uniform(-8, 8):.2f}%",
                    pnl_chg_pct_1m=f"{random.uniform(-15, 15):.2f}%",
                    price=f"{random.uniform(100, 500):.2f}",
                    price_t_1=f"{random.uniform(100, 500):.2f}",
                    price_change=f"{random.uniform(-10, 10):.2f}",
                    fx_rate="1.0000",
                )
                for i, ticker in enumerate(tickers)
            ]
        return []

    async def get_pnl_recon(self) -> List[dict[str, Any]]:
        """Get P&L reconciliation data."""
        if self.mock_mode:
            logger.info("Returning mock P&L reconciliation data")
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
        return []
