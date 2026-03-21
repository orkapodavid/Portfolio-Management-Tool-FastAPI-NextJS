"""
Tests for pmt_core.services module.
"""

import pytest
from pmt_core.services import ReportService


class TestReportService:
    """Tests for ReportService."""

    def test_report_service_instantiation(self):
        """Test ReportService can be instantiated."""
        service = ReportService()
        assert service is not None

    def test_extract_report_data(self):
        """Test extract_report_data returns list."""
        service = ReportService()
        result = service.extract_report_data(
            report_type="position_full",
            params={"position_date": "2026-01-17"},
        )
        assert isinstance(result, list)

    def test_merge_report_data(self):
        """Test merge_report_data performs left join."""
        service = ReportService()
        primary = [
            {"id": 1, "name": "A"},
            {"id": 2, "name": "B"},
        ]
        secondary = [
            {"id": 1, "value": 100},
            {"id": 3, "value": 300},
        ]
        result = service.merge_report_data(
            primary_data=primary,
            secondary_data=secondary,
            primary_key="id",
            secondary_key="id",
        )
        assert len(result) == 2
        assert result[0].get("value") == 100
        assert "value" not in result[1]

    def test_process_report_data(self):
        """Test process_report_data returns status."""
        service = ReportService()
        result = service.process_report_data(
            report_type="test",
            data=[{"id": 1}],
            action="upsert",
        )
        assert result["status"] == "success"
        assert result["records_processed"] == 1

    def test_get_report_config(self):
        """Test get_report_config returns config dict."""
        service = ReportService()
        result = service.get_report_config("position_full")
        assert "report_type" in result
        assert "report_name" in result
        assert result["report_type"] == "position_full"

    def test_cache_and_retrieve(self):
        """Test caching functionality."""
        service = ReportService()
        test_data = [{"id": 1, "value": "test"}]

        service.cache_report("test_report", test_data)
        cached = service.get_cached_report("test_report")

        assert cached == test_data

    def test_evaluate_rules(self):
        """Test evaluate_rules returns list."""
        service = ReportService()
        result = service.evaluate_rules(
            report_type="test",
            data=[{"id": 1}],
        )
        assert isinstance(result, list)
