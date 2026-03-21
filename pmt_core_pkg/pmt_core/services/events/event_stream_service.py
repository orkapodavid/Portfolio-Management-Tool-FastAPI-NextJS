"""
Event Stream Service — core business logic for event stream data.

Provides mock data for event streams (alerts, notifications).
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class EventStreamService:
    """
    Service for managing event stream data.

    Generates mock event stream data.
    Real implementation would delegate to a repository layer.
    """

    async def get_event_stream(self) -> list[dict[str, Any]]:
        """Get event stream data. TODO: Replace with DB query."""
        logger.info("Returning mock event stream data")
        tickers = ["AAPL", "TSLA", "NVDA", "META", "AMD"]
        event_types = ["Price Alert", "Volume Spike", "News", "Filing", "Announcement"]
        days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        return [
            {
                "id": i + 1,
                "symbol": tickers[i % len(tickers)],
                "record_date": f"2026-01-{10 + i}",
                "event_date": f"2026-01-{11 + i}",
                "day_of_week": days[i % len(days)],
                "event_type": event_types[i % len(event_types)],
                "subject": f"{event_types[i % len(event_types)]} for {tickers[i % len(tickers)]}",
                "notes": f"Alert triggered on {tickers[i % len(tickers)]}",
                "alerted": ["Yes", "No"][i % 2],
                "recur": ["Daily", "Weekly", "Once"][i % 3],
                "created_by": "System",
                "created_time": f"2026-01-{10 + i} 09:00:00",
                "updated_by": "System",
                "updated_time": f"2026-01-{10 + i} 09:30:00",
            }
            for i in range(8)
        ]
