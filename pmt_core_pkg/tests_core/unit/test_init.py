"""
Unit tests for pmt_core package initialization.
"""

import pytest


class TestPackageInit:
    """Test package initialization and imports."""

    def test_version_defined(self):
        """Test that __version__ is defined."""
        from pmt_core import __version__

        assert __version__ == "0.1.0"

    def test_type_imports(self):
        """Test that types can be imported from package root."""
        from pmt_core import (
            PositionRecord,
            PnLRecord,
            MarketDataRecord,
            OrderRecord,
            ComplianceRecord,
            RiskRecord,
        )

        # Just verify imports work
        assert PositionRecord is not None
        assert PnLRecord is not None

    def test_enum_imports(self):
        """Test that enums can be imported from package root."""
        from pmt_core import (
            InstrumentType,
            DashboardSection,
            OrderStatus,
            ComplianceType,
        )

        # Just verify imports work
        assert InstrumentType is not None
        assert DashboardSection is not None


class TestUtilities:
    """Test utility functions."""

    def test_setup_logging(self):
        """Test logging setup function."""
        from pmt_core.utilities import setup_logging

        logger = setup_logging(level="DEBUG", logger_name="test_logger")
        assert logger is not None
        assert logger.name == "test_logger"

    def test_get_logger(self):
        """Test get_logger function."""
        from pmt_core.utilities import get_logger

        logger = get_logger("test_module")
        assert logger is not None
        assert logger.name == "pmt_core.test_module"

    def test_default_logger(self):
        """Test default logger is available."""
        from pmt_core.utilities import logger

        assert logger is not None
        assert logger.name == "pmt_core"
