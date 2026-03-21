from typing import Any, List
from pmt_core.repositories.common import DatabaseRepository
import logging

logger = logging.getLogger(__name__)


class EventRepository(DatabaseRepository):
    """Repository for Event data."""

    async def get_event_calendar(self) -> List[dict[str, Any]]:
        """Get event calendar data."""
        if self.mock_mode:
            logger.info("Returning mock event calendar data")
            tickers = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "META"]
            event_types = ["Earnings", "Dividend", "Split", "Conference", "Guidance"]
            days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
            return [
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
        return []

    async def get_event_stream(self) -> List[dict[str, Any]]:
        """Get event stream data."""
        if self.mock_mode:
            logger.info("Returning mock event stream data")
            tickers = ["AAPL", "TSLA", "NVDA", "META", "AMD"]
            event_types = [
                "Price Alert",
                "Volume Spike",
                "News",
                "Filing",
                "Announcement",
            ]
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
        return []

    async def get_reverse_inquiry(self) -> List[dict[str, Any]]:
        """Get reverse inquiry data."""
        if self.mock_mode:
            logger.info("Returning mock reverse inquiry data")
            tickers = ["AAPL", "MSFT", "TSLA", "NVDA"]
            agents = ["Goldman Sachs", "Morgan Stanley", "JP Morgan", "Citibank"]
            return [
                {
                    "id": i + 1,
                    "ticker": tickers[i % len(tickers)],
                    "company": f"{tickers[i % len(tickers)]} Inc.",
                    "inquiry_date": f"2026-01-{5 + i}",
                    "expiry_date": f"2026-02-{5 + i}",
                    "deal_point": f"{(i + 1) * 50} bps",
                    "agent": agents[i % len(agents)],
                    "notes": f"Inquiry for {tickers[i % len(tickers)]} position",
                }
                for i in range(6)
            ]
        return []
