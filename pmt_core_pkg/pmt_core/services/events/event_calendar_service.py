"""
Event Calendar Service — core business logic for event calendar data.

Provides mock data for corporate event calendars.
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class EventCalendarService:
    """
    Service for managing event calendar data.

    Generates mock event calendar data.
    Real implementation would delegate to a repository layer.
    """

    async def get_event_calendar(
        self, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """Get event calendar data, optionally filtered by date bounds."""
        logger.info("Returning mock event calendar data")
        tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "META"]
        event_types = ["Earnings", "Dividend", "Split", "Conference", "Guidance"]
        days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        rows = [
            {
                "id": i + 1,
                "underlying": tickers[i % len(tickers)],
                "ticker": tickers[i % len(tickers)],
                "company": f"{tickers[i % len(tickers)]} Inc.",
                "event_date": f"2026-01-{15 + i}",
                "day_of_week": days[i % len(days)],
                "event_type": event_types[i % len(event_types)],
                "time": f"{9 + (i % 4):02d}:00 AM",
            }
            for i in range(10)
        ]

        return [
            row
            for row in rows
            if (start_date is None or row["event_date"] >= start_date)
            and (end_date is None or row["event_date"] <= end_date)
        ]
