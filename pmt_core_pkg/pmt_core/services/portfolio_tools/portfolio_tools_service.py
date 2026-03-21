"""
Portfolio Tools Service — core business logic for portfolio tools.

Provides mock data for pay-to-hold, stock borrow, settlement,
deal indication, resets, installments, excess amounts, and portfolio CRUD.
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from typing import Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class PortfolioToolsService:
    """
    Core service for portfolio tools data.

    Generates mock portfolio tools data.
    Real implementation would delegate to a repository layer.
    """

    async def get_portfolios(self, user_id: str = None) -> list[dict[str, Any]]:
        """Get all portfolios for a user."""
        logger.warning("Using mock portfolio data. Implement real DB integration!")
        return [
            {
                "id": "1",
                "name": "Main Investment Account",
                "description": "Long-term growth strategy focused on tech and finance.",
                "holdings": [],
                "transactions": [],
                "dividends": [],
                "cash": 12500.0,
            }
        ]

    async def get_portfolio(self, portfolio_id: str) -> dict[str, Any]:
        """Get a specific portfolio by ID."""
        logger.warning("Using mock portfolio data. Implement real DB integration!")
        return {}

    async def create_portfolio(self, portfolio_data: dict) -> dict[str, Any]:
        """Create a new portfolio."""
        logger.warning("Portfolio creation mocked. Implement real DB integration!")
        return {
            "id": str(datetime.now().timestamp()),
            **portfolio_data,
            "holdings": [],
            "transactions": [],
            "dividends": [],
            "cash": 0.0,
        }

    async def add_transaction(
        self, portfolio_id: str, transaction_data: dict
    ) -> dict[str, Any]:
        """Add a transaction to a portfolio."""
        logger.warning("Transaction creation mocked. Implement real DB integration!")
        return {
            "id": str(datetime.now().timestamp()),
            **transaction_data,
        }

    async def get_transactions(
        self, portfolio_id: str, limit: int = 100
    ) -> list[dict[str, Any]]:
        """Get transactions for a portfolio."""
        logger.warning("Using mock transaction data. Implement real DB integration!")
        return []

    async def add_dividend(
        self, portfolio_id: str, dividend_data: dict
    ) -> dict[str, Any]:
        """Record a dividend payment."""
        logger.warning("Dividend recording mocked. Implement real DB integration!")
        return {
            "id": str(datetime.now().timestamp()),
            **dividend_data,
        }

    async def get_dividends(
        self, portfolio_id: str, limit: int = 100
    ) -> list[dict[str, Any]]:
        """Get dividend history for a portfolio."""
        logger.warning("Using mock dividend data. Implement real DB integration!")
        return []

    async def update_portfolio_cash(
        self, portfolio_id: str, cash_amount: float
    ) -> bool:
        """Update cash balance for a portfolio."""
        logger.warning("Cash update mocked. Implement real DB integration!")
        return True

    # =====================================================
    # Portfolio Tools Data Methods
    # =====================================================

    async def get_pay_to_hold(self) -> list[dict[str, Any]]:
        """Get pay-to-hold data. TODO: Replace with DB query."""
        logger.info("Returning mock pay-to-hold data")
        return [
            {
                "id": 1,
                "trade_date": "2026-01-11",
                "ticker": "AAPL",
                "currency": "USD",
                "counter_party": "JPM",
                "side": "Long",
                "sl_rate": "0.25%",
                "pth_amount_sod": "1,250",
                "pth_amount": "1,250",
                "emsx_order": "",
                "emsx_remark": "",
                "emsx_working": "",
                "emsx_order_col": "",
                "emsx_filled": "",
            },
        ]

    async def get_short_ecl(self) -> list[dict[str, Any]]:
        """Get short ECL data. TODO: Replace with DB query."""
        logger.info("Returning mock short ECL data")
        return [
            {
                "id": 1,
                "trade_date": "2026-01-11",
                "ticker": "TSLA",
                "company_name": "Tesla Inc.",
                "pos_loc": "US",
                "account": "Main Account",
                "short_position": "-5,000",
                "nosh": "3.2B",
                "short_ownership": "0.0002%",
                "last_volume": "98.5M",
                "short_pos_truncated": "5,000",
            },
        ]

    async def get_stock_borrow(self) -> list[dict[str, Any]]:
        """Get stock borrow data. TODO: Replace with DB query."""
        logger.info("Returning mock stock borrow data")
        return [
            {
                "id": 1,
                "trade_date": "2026-01-11",
                "ticker": "GME",
                "company_name": "GameStop Corp.",
                "jpm_req": "10,000",
                "jpm_firm": "Available",
                "borrow_rate": "12.5%",
                "bofa_req": "5,000",
                "bofa_firm": "Pending",
            },
        ]

    async def get_po_settlement(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get PO settlement data. TODO: Replace with DB query."""
        logger.info(f"Returning mock PO settlement data for date={position_date}")
        return [
            {
                "id": 1,
                "deal_num": "D001",
                "ticker": "AAPL",
                "company_name": "Apple Inc.",
                "structure": "Convert",
                "currency": "USD",
                "fx_rate": "1.00",
                "last_price": "182.50",
                "current_position": "10,000",
                "shares_allocated": "8,000",
                "shares_swap": "2,000",
                "shares_hedged": "10,000",
            },
        ]

    async def get_deal_indication(self) -> list[dict[str, Any]]:
        """Get deal indication data. TODO: Replace with DB query."""
        logger.info("Returning mock deal indication data")
        return [
            {
                "id": 1,
                "ticker": "NVDA",
                "company_name": "NVIDIA Corp.",
                "identification": "ID001",
                "deal_type": "Follow-On",
                "agent": "GS",
                "captain": "John Smith",
                "indication_date": "2026-01-15",
                "currency": "USD",
                "market_cap_loc": "1.2T",
                "gross_proceed_loc": "5B",
                "indication_amount": "100M",
            },
        ]

    async def get_reset_dates(
        self,
        ticker: str = None,
        start_date: str = None,
        end_date: str = None,
        frequency: str = None,
        reset_month: str = None,
        reset_day: str = None,
        reset_up_down: str = None,
    ) -> list[dict[str, Any]]:
        """Get reset dates data. TODO: Replace with DB query."""
        logger.info(
            f"Returning mock reset dates data (ticker={ticker}, "
            f"range={start_date}~{end_date}, freq={frequency})"
        )
        return [
            {
                "id": 1,
                "underlying": "AAPL",
                "ticker": ticker or "4592 JP_Series 1",
                "company_name": "Apple Inc.",
                "sec_type": "Warrant",
                "currency": "USD",
                "trade_date": "2025-01-01",
                "first_reset": "2025-06-01",
                "expiry": "2027-01-01",
                "latest_reset": "2025-06-01",
                "reset_date": start_date or "2026-03-03",
                "reset_up_down": reset_up_down or "Up",
                "market_price": "182.50",
            },
        ]

    async def get_coming_resets(self) -> list[dict[str, Any]]:
        """Get coming resets data. TODO: Replace with DB query."""
        logger.info("Returning mock coming resets data")
        return [
            {
                "id": 1,
                "deal_num": "D001",
                "detail_id": "DT001",
                "ticker": "AAPL",
                "account": "Main Account",
                "company_name": "Apple Inc.",
                "announce_date": "2026-01-10",
                "closing_date": "2026-01-20",
                "cal_days": "10",
                "biz_days": "7",
            },
        ]

    async def get_cb_installments(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get CB installments data. TODO: Replace with DB query."""
        logger.info(f"Returning mock CB installments data for date={position_date}")
        return [
            {
                "id": 1,
                "underlying": "MSFT",
                "ticker": "MSFT",
                "currency": "USD",
                "installment_date": "2026-02-01",
                "total_amount": "10,000,000",
                "outstanding": "8,000,000",
                "redeemed": "1,000,000",
                "deferred": "500,000",
                "converted": "500,000",
                "installment_amount": "500,000",
                "period": "Q1 2026",
            },
        ]

    async def get_excess_amount(self, position_date: str = None) -> list[dict[str, Any]]:
        """Get excess amount data. TODO: Replace with DB query."""
        logger.info(f"Returning mock excess amount data for date={position_date}")
        return [
            {
                "id": 1,
                "deal_num": "D001",
                "underlying": "AAPL",
                "ticker": "AAPL",
                "company_name": "Apple Inc.",
                "warrants": "100,000",
                "excess_amount": "5,000",
                "threshold": "95,000",
                "cb_redeem": "N",
                "redeem": "N",
            },
        ]