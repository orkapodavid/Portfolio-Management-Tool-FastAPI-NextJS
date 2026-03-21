"""
pmt_core test fixtures.

This module provides shared fixtures for pmt_core unit tests.
"""

import pytest
from typing import Generator


@pytest.fixture
def sample_position_record() -> dict:
    """Sample position record for testing."""
    return {
        "id": 1,
        "trade_date": "2026-01-17",
        "deal_num": "D001",
        "detail_id": "D001-01",
        "underlying": "ABC Corp",
        "ticker": "ABC HK",
        "company_name": "ABC Corporation Ltd",
        "sec_id": "ABC-001",
        "sec_type": "stock",
        "subtype": None,
        "currency": "HKD",
        "account_id": "MAIN",
        "pos_loc": "HK",
        "notional": "1000000",
        "position": "10000",
        "market_value": "1050000",
    }


@pytest.fixture
def sample_pnl_record() -> dict:
    """Sample P&L record for testing."""
    return {
        "id": 1,
        "trade_date": "2026-01-17",
        "underlying": "ABC Corp",
        "ticker": "ABC HK",
        "currency": "HKD",
        "pnl_ytd": "500000",
        "pnl_mtd": "50000",
        "pnl_wtd": "10000",
        "pnl_dtd": "5000",
        "pnl_chg_1d": "5000",
        "pnl_chg_1w": "10000",
        "pnl_chg_1m": "50000",
        "pnl_chg_pct_1d": "0.5%",
        "pnl_chg_pct_1w": "1.0%",
        "pnl_chg_pct_1m": "5.0%",
        "price": "105.00",
        "price_t_1": "100.00",
        "price_change": "5.00",
        "fx_rate": "7.78",
    }


@pytest.fixture
def sample_market_data_record() -> dict:
    """Sample market data record for testing."""
    return {
        "id": 1,
        "ticker": "ABC HK",
        "currency": "HKD",
        "last_price": "105.50",
        "bid": "105.40",
        "ask": "105.60",
        "vwap_price": "105.25",
        "last_volume": "1500000",
        "listed_shares": "100000000",
        "chg_1d_pct": "2.5%",
        "implied_vol_pct": "25%",
        "market_status": "open",
        "created_by": "system",
        "created_time": "2026-01-17T09:00:00",
        "updated_by": "bbg",
        "updated_time": "2026-01-17T10:00:00",
    }


@pytest.fixture
def sample_order_record() -> dict:
    """Sample order record for testing."""
    return {
        "id": 1,
        "sequence": "001",
        "underlying": "ABC Corp",
        "ticker": "ABC HK",
        "broker": "JPM",
        "pos_loc": "HK",
        "side": "buy",
        "status": "working",
        "order_amount": "10000",
        "routed_amount": "10000",
        "working_amount": "5000",
        "filled_amount": "5000",
        "limit_price": "105.00",
        "avg_fill_price": "104.80",
        "order_time": "2026-01-17T09:30:00",
        "last_update_time": "2026-01-17T09:45:00",
    }
