"""
Reverse Inquiry Service — core business logic for reverse inquiry data.

Provides mock data generation with position_date filtering.
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# Mock reference data
_TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "AMZN", "META", "JPM"]
_COMPANIES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corp.",
    "TSLA": "Tesla Inc.",
    "NVDA": "NVIDIA Corp.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "META": "Meta Platforms Inc.",
    "JPM": "JPMorgan Chase & Co.",
}
_AGENTS = [
    "Goldman Sachs",
    "Morgan Stanley",
    "JP Morgan",
    "Citibank",
    "UBS",
    "Barclays",
    "Deutsche Bank",
    "Credit Suisse",
]
_DEAL_TYPES = [
    "Block Trade",
    "Swap Unwind",
    "CB Conversion",
    "Rights Issue",
    "Secondary Offering",
    "Share Buyback",
]


class ReverseInquiryService:
    """
    Service for managing reverse inquiry data.

    Generates mock reverse inquiry records based on position_date.
    Real implementation would delegate to a repository layer.
    """

    async def get_reverse_inquiry(
        self, position_date: Optional[str] = None
    ) -> list[dict]:
        """
        Get reverse inquiry data for a given position date.

        Args:
            position_date: Date string in YYYY-MM-DD format.
                           Defaults to today if not provided.

        Returns:
            List of reverse inquiry records as dicts.
        """
        if position_date:
            try:
                base_date = datetime.strptime(position_date, "%Y-%m-%d")
            except ValueError:
                logger.warning(
                    f"Invalid position_date '{position_date}', using today"
                )
                base_date = datetime.now()
        else:
            base_date = datetime.now()

        logger.info(
            f"Returning mock reverse inquiry data for {base_date.strftime('%Y-%m-%d')}"
        )

        rows: list[dict] = []
        for i in range(15):
            ticker = _TICKERS[i % len(_TICKERS)]
            agent = _AGENTS[i % len(_AGENTS)]
            deal_type = _DEAL_TYPES[i % len(_DEAL_TYPES)]

            # Inquiry dates spread around the base date
            inquiry_offset = timedelta(days=-(i % 7))
            inquiry_date = base_date + inquiry_offset

            # Expiry 30 days after inquiry
            expiry_date = inquiry_date + timedelta(days=30)

            # Deal point varies by row — use a seed based on date + index
            seed_val = base_date.toordinal() + i
            bps = 25 + (seed_val % 200)

            rows.append(
                {
                    "id": i + 1,
                    "ticker": ticker,
                    "company": _COMPANIES[ticker],
                    "inquiry_date": inquiry_date.strftime("%Y-%m-%d"),
                    "expiry_date": expiry_date.strftime("%Y-%m-%d"),
                    "deal_point": f"{bps} bps",
                    "agent": agent,
                    "notes": f"{deal_type} inquiry for {ticker}",
                }
            )

        return rows
