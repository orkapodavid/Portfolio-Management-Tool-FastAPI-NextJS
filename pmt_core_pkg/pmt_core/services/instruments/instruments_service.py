"""
Instruments Service — core business logic for instruments data.

Provides mock data for stock screener, ticker data, special terms,
instrument data, and instrument terms.
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class InstrumentsService:
    """
    Service for managing instruments data.

    Generates mock instruments data.
    Real implementation would delegate to a repository layer.
    """

    async def get_stock_screener(self) -> list[dict[str, Any]]:
        """Get stock screener data. TODO: Replace with DB query."""
        logger.info("Returning mock stock screener data")
        return [
            {
                "id": 1,
                "dtl10": "5",
                "ticker": "AAPL",
                "company": "Apple Inc.",
                "country": "USA",
                "industry": "Technology",
                "last_price": "182.50",
                "mkt_cap_loc": "2,950,000",
                "mkt_cap_usd": "2950000",
                "adv_3m": "54200000",
                "adv_3m_usd": "54200000",
                "locate_qty_mm": "100",
                "locate_f": "Y",
            },
            {
                "id": 2,
                "dtl10": "12",
                "ticker": "MSFT",
                "company": "Microsoft Corp.",
                "country": "USA",
                "industry": "Technology",
                "last_price": "405.12",
                "mkt_cap_loc": "3,010,000",
                "mkt_cap_usd": "3010000",
                "adv_3m": "22400000",
                "adv_3m_usd": "22400000",
                "locate_qty_mm": "80",
                "locate_f": "Y",
            },
            {
                "id": 3,
                "dtl10": "3",
                "ticker": "SHEL",
                "company": "Shell PLC",
                "country": "UK",
                "industry": "Energy",
                "last_price": "28.45",
                "mkt_cap_loc": "185,000",
                "mkt_cap_usd": "230000",
                "adv_3m": "12500000",
                "adv_3m_usd": "15600000",
                "locate_qty_mm": "60",
                "locate_f": "Y",
            },
            {
                "id": 4,
                "dtl10": "8",
                "ticker": "7203",
                "company": "Toyota Motor Corp.",
                "country": "Japan",
                "industry": "Automotive",
                "last_price": "2,845.00",
                "mkt_cap_loc": "42,500,000",
                "mkt_cap_usd": "285000",
                "adv_3m": "8500000",
                "adv_3m_usd": "57000",
                "locate_qty_mm": "40",
                "locate_f": "N",
            },
            {
                "id": 5,
                "dtl10": "15",
                "ticker": "SAP",
                "company": "SAP SE",
                "country": "Germany",
                "industry": "Technology",
                "last_price": "182.30",
                "mkt_cap_loc": "224,000",
                "mkt_cap_usd": "245000",
                "adv_3m": "3200000",
                "adv_3m_usd": "3500000",
                "locate_qty_mm": "30",
                "locate_f": "Y",
            },
            {
                "id": 6,
                "dtl10": "2",
                "ticker": "LVMH",
                "company": "LVMH Moët Hennessy",
                "country": "France",
                "industry": "Luxury",
                "last_price": "875.60",
                "mkt_cap_loc": "440,000",
                "mkt_cap_usd": "482000",
                "adv_3m": "1800000",
                "adv_3m_usd": "1970000",
                "locate_qty_mm": "15",
                "locate_f": "N",
            },
            {
                "id": 7,
                "dtl10": "20",
                "ticker": "0700",
                "company": "Tencent Holdings",
                "country": "Hong Kong",
                "industry": "Technology",
                "last_price": "375.80",
                "mkt_cap_loc": "3,600,000",
                "mkt_cap_usd": "460000",
                "adv_3m": "18000000",
                "adv_3m_usd": "2300000",
                "locate_qty_mm": "50",
                "locate_f": "Y",
            },
            {
                "id": 8,
                "dtl10": "7",
                "ticker": "TSLA",
                "company": "Tesla Inc.",
                "country": "USA",
                "industry": "Automotive",
                "last_price": "248.90",
                "mkt_cap_loc": "790,000",
                "mkt_cap_usd": "790000",
                "adv_3m": "98000000",
                "adv_3m_usd": "98000000",
                "locate_qty_mm": "120",
                "locate_f": "Y",
            },
            {
                "id": 9,
                "dtl10": "25",
                "ticker": "NVDA",
                "company": "NVIDIA Corp.",
                "country": "USA",
                "industry": "Semiconductors",
                "last_price": "875.30",
                "mkt_cap_loc": "2,150,000",
                "mkt_cap_usd": "2150000",
                "adv_3m": "42000000",
                "adv_3m_usd": "42000000",
                "locate_qty_mm": "95",
                "locate_f": "Y",
            },
            {
                "id": 10,
                "dtl10": "1",
                "ticker": "AZN",
                "company": "AstraZeneca PLC",
                "country": "UK",
                "industry": "Healthcare",
                "last_price": "118.25",
                "mkt_cap_loc": "183,000",
                "mkt_cap_usd": "228000",
                "adv_3m": "5600000",
                "adv_3m_usd": "7000000",
                "locate_qty_mm": "55",
                "locate_f": "Y",
            },
        ]

    async def get_ticker_data(self) -> list[dict[str, Any]]:
        """Get ticker data for instruments. TODO: Replace with DB query."""
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

    async def get_special_terms(self, position_date: str = "") -> list[dict[str, Any]]:
        """Get special terms data. TODO: Replace with DB query."""
        logger.info("Returning mock special terms data for date: %s", position_date)
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

    async def get_instrument_data(self) -> list[dict[str, Any]]:
        """Get instrument data. TODO: Replace with DB query."""
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
            {
                "id": 2,
                "deal_num": "D002",
                "detail_id": "DT002",
                "underlying": "MSFT",
                "ticker": "MSFT",
                "company_name": "Microsoft Corp.",
                "sec_id": "SEC002",
                "sec_type": "Equity",
                "pos_loc": "US",
                "account": "Main Account",
            },
        ]

    async def get_instrument_terms(self) -> list[dict[str, Any]]:
        """Get instrument terms data. TODO: Replace with DB query."""
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
