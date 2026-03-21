from typing import List, Optional, Dict, Any
from pmt_core.repositories.pnl import PnLRepository
from pmt_core.repositories.protocols import PnLRepositoryProtocol
from pmt_core.models import PnLRecord
import logging

logger = logging.getLogger(__name__)


class PnLService:
    """
    Core business service for PnL.
    Delegates data fetching to PnLRepository.
    """

    def __init__(self, repository: Optional[PnLRepositoryProtocol] = None):
        self.repository = repository or PnLRepository()

    async def get_pnl_changes(
        self, trade_date: Optional[str] = None
    ) -> List[PnLRecord]:
        """Get P&L changes."""
        return await self.repository.get_pnl_changes(trade_date)

    async def get_pnl_summary(
        self, trade_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get P&L summary as dicts. TODO: Replace with DB query."""
        logger.info("Returning mock PnL summary data")
        return [
            {
                "trade_date": "2026-01-31",
                "underlying": "Toyota Motor",
                "currency": "JPY",
                "price": "2,876.50",
                "price_t_1": "2,845.00",
                "price_change": "+1.11%",
                "fx_rate": "149.8500",
                "fx_rate_t_1": "149.2300",
                "fx_rate_change": "+0.42%",
                "dtl": "0",
                "last_volume": "5,234,567",
                "adv_3m": "4,567,890",
            },
            {
                "trade_date": "2026-01-31",
                "underlying": "Sony Group",
                "currency": "JPY",
                "price": "14,234.00",
                "price_t_1": "14,123.00",
                "price_change": "+0.79%",
                "fx_rate": "149.8500",
                "fx_rate_t_1": "149.2300",
                "fx_rate_change": "+0.42%",
                "dtl": "2",
                "last_volume": "2,345,678",
                "adv_3m": "2,123,456",
            },
            {
                "trade_date": "2026-01-31",
                "underlying": "Nintendo",
                "currency": "JPY",
                "price": "8,567.00",
                "price_t_1": "8,456.00",
                "price_change": "+1.31%",
                "fx_rate": "149.8500",
                "fx_rate_t_1": "149.2300",
                "fx_rate_change": "+0.42%",
                "dtl": "0",
                "last_volume": "3,456,789",
                "adv_3m": "3,234,567",
            },
            {
                "trade_date": "2026-01-31",
                "underlying": "SoftBank Group",
                "currency": "JPY",
                "price": "9,123.00",
                "price_t_1": "9,345.00",
                "price_change": "-2.37%",
                "fx_rate": "149.8500",
                "fx_rate_t_1": "149.2300",
                "fx_rate_change": "+0.42%",
                "dtl": "5",
                "last_volume": "6,789,012",
                "adv_3m": "5,678,901",
            },
            {
                "trade_date": "2026-01-31",
                "underlying": "ASML Holdings",
                "currency": "EUR",
                "price": "678.90",
                "price_t_1": "672.50",
                "price_change": "+0.95%",
                "fx_rate": "0.9234",
                "fx_rate_t_1": "0.9189",
                "fx_rate_change": "+0.49%",
                "dtl": "1",
                "last_volume": "1,234,567",
                "adv_3m": "1,123,456",
            },
            {
                "trade_date": "2026-01-31",
                "underlying": "HSBC Holdings",
                "currency": "GBP",
                "price": "745.60",
                "price_t_1": "742.30",
                "price_change": "+0.44%",
                "fx_rate": "0.7923",
                "fx_rate_t_1": "0.7891",
                "fx_rate_change": "+0.41%",
                "dtl": "3",
                "last_volume": "8,901,234",
                "adv_3m": "7,890,123",
            },
        ]

    async def get_pnl_by_currency(
        self, trade_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get P&L broken down by currency. TODO: Replace with DB query."""
        logger.info("Returning mock PnL by currency data")
        return [
            {
                "trade_date": "2026-01-31",
                "currency": "USD",
                "fx_rate": "1.0000",
                "fx_rate_t_1": "1.0000",
                "fx_rate_change": "0.00%",
                "ccy_exposure": "$45,678,901",
                "usd_exposure": "$45,678,901",
                "pos_ccy_expo": "$45,678,901",
                "ccy_hedged_pnl": "$123,456",
                "pos_ccy_pnl": "$123,456",
                "net_ccy": "$123,456",
                "pos_c_truncated": "$123.5K",
            },
            {
                "trade_date": "2026-01-31",
                "currency": "JPY",
                "fx_rate": "149.8500",
                "fx_rate_t_1": "149.2300",
                "fx_rate_change": "+0.42%",
                "ccy_exposure": "¥12,345,000,000",
                "usd_exposure": "$82,456,789",
                "pos_ccy_expo": "¥12,345,000,000",
                "ccy_hedged_pnl": "¥234,567,890",
                "pos_ccy_pnl": "$1,567,890",
                "net_ccy": "¥234.6M",
                "pos_c_truncated": "$1.57M",
            },
            {
                "trade_date": "2026-01-31",
                "currency": "EUR",
                "fx_rate": "0.9234",
                "fx_rate_t_1": "0.9189",
                "fx_rate_change": "+0.49%",
                "ccy_exposure": "€23,456,789",
                "usd_exposure": "$25,402,345",
                "pos_ccy_expo": "€23,456,789",
                "ccy_hedged_pnl": "€345,678",
                "pos_ccy_pnl": "$374,567",
                "net_ccy": "€345.7K",
                "pos_c_truncated": "$374.6K",
            },
            {
                "trade_date": "2026-01-31",
                "currency": "GBP",
                "fx_rate": "0.7923",
                "fx_rate_t_1": "0.7891",
                "fx_rate_change": "+0.41%",
                "ccy_exposure": "£8,901,234",
                "usd_exposure": "$11,234,567",
                "pos_ccy_expo": "£8,901,234",
                "ccy_hedged_pnl": "£89,012",
                "pos_ccy_pnl": "$112,345",
                "net_ccy": "£89.0K",
                "pos_c_truncated": "$112.3K",
            },
            {
                "trade_date": "2026-01-31",
                "currency": "HKD",
                "fx_rate": "7.8145",
                "fx_rate_t_1": "7.8102",
                "fx_rate_change": "+0.06%",
                "ccy_exposure": "HK$156,789,012",
                "usd_exposure": "$20,067,890",
                "pos_ccy_expo": "HK$156,789,012",
                "ccy_hedged_pnl": "HK$1,234,567",
                "pos_ccy_pnl": "$158,012",
                "net_ccy": "HK$1.23M",
                "pos_c_truncated": "$158.0K",
            },
        ]

    async def get_kpi_metrics(self) -> List[Dict[str, Any]]:
        """Get KPI metrics. TODO: Replace with real calculation."""
        logger.info("Returning mock KPI metrics")
        return [
            {
                "label": "Total NAV",
                "value": "$2.4B",
                "is_positive": True,
                "trend_data": "+2.5%",
            },
            {
                "label": "Daily P&L",
                "value": "+$12.5M",
                "is_positive": True,
                "trend_data": "+0.5%",
            },
        ]

    async def get_pnl_full(
        self, trade_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get full P&L detailed view. TODO: Replace with DB query."""
        logger.info("Returning mock full PnL data")
        companies = [
            ("Toyota Motor", "7203.T"),
            ("Sony Group", "6758.T"),
            ("Nintendo", "7974.T"),
            ("SoftBank Group", "9984.T"),
            ("Keyence", "6861.T"),
            ("Fast Retailing", "9983.T"),
            ("Tokyo Electron", "8035.T"),
            ("Shin-Etsu Chemical", "4063.T"),
            ("Hitachi", "6501.T"),
            ("Mitsubishi UFJ", "8306.T"),
            ("Recruit Holdings", "6098.T"),
            ("Daikin Industries", "6367.T"),
            ("KDDI", "9433.T"),
            ("Fanuc", "6954.T"),
            ("Murata Manufacturing", "6981.T"),
        ]

        pnl_data = [
            ("$1,234,567", "$12,345", "$45,678", "$123,456", "+1.2%", "+3.5%", "+8.7%"),
            ("$987,654", "-$8,765", "$23,456", "$67,890", "-0.9%", "+2.1%", "+5.4%"),
            (
                "$2,345,678",
                "$34,567",
                "$78,901",
                "$234,567",
                "+2.3%",
                "+4.8%",
                "+12.1%",
            ),
            (
                "($456,789)",
                "-$45,678",
                "-$89,012",
                "($156,789)",
                "-3.2%",
                "-5.6%",
                "-9.8%",
            ),
            (
                "$3,456,789",
                "$56,789",
                "$123,456",
                "$345,678",
                "+1.8%",
                "+5.2%",
                "+15.3%",
            ),
            ("$567,890", "$6,789", "$12,345", "$56,789", "+0.7%", "+1.9%", "+4.2%"),
            (
                "$1,890,123",
                "-$23,456",
                "$45,678",
                "$189,012",
                "-1.1%",
                "+2.8%",
                "+7.6%",
            ),
            ("$789,012", "$7,890", "$15,678", "$78,901", "+0.9%", "+2.3%", "+6.1%"),
            ("$1,234,567", "$23,456", "$56,789", "$123,456", "+1.5%", "+3.9%", "+9.2%"),
            (
                "($234,567)",
                "-$12,345",
                "-$34,567",
                "($78,901)",
                "-1.8%",
                "-4.2%",
                "-7.5%",
            ),
            ("$890,123", "$8,901", "$17,890", "$89,012", "+1.0%", "+2.5%", "+6.8%"),
            ("$456,789", "$4,567", "$9,012", "$45,678", "+0.6%", "+1.7%", "+3.9%"),
            ("$345,678", "-$3,456", "$6,789", "$34,567", "-0.5%", "+1.2%", "+3.2%"),
            ("$678,901", "$6,789", "$13,456", "$67,890", "+0.8%", "+2.1%", "+5.5%"),
            ("$1,567,890", "$15,678", "$31,234", "$156,789", "+1.3%", "+3.1%", "+8.1%"),
        ]

        result = []
        for i, ((name, ticker), data) in enumerate(zip(companies, pnl_data)):
            result.append(
                {
                    "id": i + 1,
                    "trade_date": "2026-01-31",
                    "underlying": name,
                    "ticker": ticker,
                    "pnl_ytd": data[0],
                    "pnl_chg_1d": data[1],
                    "pnl_chg_1w": data[2],
                    "pnl_chg_1m": data[3],
                    "pnl_chg_pct_1d": data[4],
                    "pnl_chg_pct_1w": data[5],
                    "pnl_chg_pct_1m": data[6],
                }
            )
        return result

    async def calculate_daily_pnl(
        self, portfolio_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculate daily PnL."""
        return {
            "daily_pnl": 0.0,
            "daily_pnl_pct": 0.0,
            "ytd_pnl": 0.0,
            "ytd_pnl_pct": 0.0,
        }
