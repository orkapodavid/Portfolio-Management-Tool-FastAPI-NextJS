"""
Unit tests for pmt_core.models module.
"""

import pytest
from pmt_core.models import (
    PositionRecord,
    PnLRecord,
    MarketDataRecord,
    OrderRecord,
    ComplianceRecord,
    RiskRecord,
    InstrumentType,
    DashboardSection,
    OrderStatus,
    ComplianceType,
)
from pmt_core.models.common import OrderSide, MarketStatus, Currency


class TestTypeDefinitions:
    """Test that TypedDict definitions are properly structured."""

    def test_position_record_structure(self, sample_position_record):
        """Test PositionRecord has expected fields."""
        # TypedDict provides type hints, not runtime validation
        # This test verifies the sample data matches expected structure
        assert "id" in sample_position_record
        assert "ticker" in sample_position_record
        assert "sec_type" in sample_position_record
        assert "currency" in sample_position_record

    def test_pnl_record_structure(self, sample_pnl_record):
        """Test PnLRecord has expected fields."""
        assert "pnl_ytd" in sample_pnl_record
        assert "pnl_chg_1d" in sample_pnl_record
        assert "pnl_chg_pct_1d" in sample_pnl_record

    def test_market_data_record_structure(self, sample_market_data_record):
        """Test MarketDataRecord has expected fields."""
        assert "last_price" in sample_market_data_record
        assert "bid" in sample_market_data_record
        assert "ask" in sample_market_data_record

    def test_order_record_structure(self, sample_order_record):
        """Test OrderRecord has expected fields."""
        assert "status" in sample_order_record
        assert "side" in sample_order_record
        assert "filled_amount" in sample_order_record


class TestEnums:
    """Test enum definitions."""

    def test_instrument_type_values(self):
        """Test InstrumentType enum values."""
        assert InstrumentType.STOCK == "stock"
        assert InstrumentType.WARRANT == "warrant"
        assert InstrumentType.BOND == "bond"
        assert InstrumentType.CONVERTIBLE == "convertible"

    def test_dashboard_section_values(self):
        """Test DashboardSection enum values."""
        assert DashboardSection.POSITIONS == "positions"
        assert DashboardSection.PNL == "pnl"
        assert DashboardSection.COMPLIANCE == "compliance"
        assert DashboardSection.RISK == "risk"

    def test_order_status_values(self):
        """Test OrderStatus enum values."""
        assert OrderStatus.WORKING == "working"
        assert OrderStatus.FILLED == "filled"
        assert OrderStatus.CANCELLED == "cancelled"

    def test_order_side_values(self):
        """Test OrderSide enum values."""
        assert OrderSide.BUY == "buy"
        assert OrderSide.SELL == "sell"

    def test_compliance_type_values(self):
        """Test ComplianceType enum values."""
        assert ComplianceType.RESTRICTED == "restricted"
        assert ComplianceType.UNDERTAKING == "undertaking"

    def test_market_status_values(self):
        """Test MarketStatus enum values."""
        assert MarketStatus.OPEN == "open"
        assert MarketStatus.CLOSED == "closed"

    def test_currency_values(self):
        """Test Currency enum values."""
        assert Currency.USD == "USD"
        assert Currency.HKD == "HKD"
        assert Currency.JPY == "JPY"

    def test_enum_string_behavior(self):
        """Test that string enums work as strings."""
        # .value gives the string value
        assert InstrumentType.STOCK.value == "stock"

        # Comparison with strings should work due to str inheritance
        assert InstrumentType.STOCK == "stock"

        # Can be used in f-strings via .value
        assert f"Type: {InstrumentType.BOND.value}" == "Type: bond"
