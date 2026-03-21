"""
EMSX Service — core business logic for Bloomberg EMSX order management.

Provides mock data for EMSX orders and routes, plus mock CRUD operations.
TODO: Replace mock data with actual Bloomberg/database integration.
"""

import logging
import random
from typing import Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class EMSXService:
    """
    Core service for Bloomberg EMSX order management.

    Generates mock EMSX data.
    Real implementation would delegate to Bloomberg connector or repository.
    """

    async def get_emsx_orders(
        self, status_filter: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """Get EMSX orders. TODO: Implement using Bloomberg connector."""
        logger.warning(
            "Using mock EMSX order data. Configure Bloomberg to get real data!"
        )

        tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
        brokers = ["GS", "MS", "JPM", "BAML", "CS"]
        statuses = ["Working", "Filled", "Partial Fill", "Cancelled"]
        sides = ["Buy", "Sell"]

        return [
            {
                "id": i,
                "sequence": i + 1,
                "underlying": f"{ticker} US Equity",
                "ticker": ticker,
                "broker": brokers[i % len(brokers)],
                "pos_loc": ["NY", "LN", "HK"][i % 3],
                "side": sides[i % 2],
                "status": statuses[i % len(statuses)],
                "emsx_amount": f"{random.randint(1000, 100000):,}",
                "emsx_routed": f"{random.randint(0, 50000):,}",
                "emsx_working": f"{random.randint(0, 30000):,}",
                "emsx_filled": f"{random.randint(0, 20000):,}",
            }
            for i, ticker in enumerate(tickers * 2)  # 10 records
        ]

    async def get_emsx_routes(
        self, order_id: Optional[int] = None
    ) -> list[dict[str, Any]]:
        """Get EMSX routes (executions) for orders."""
        logger.warning("Using mock EMSX route data.")

        return [
            {
                "id": i,
                "order_id": order_id or (i // 2),
                "route_id": f"ROUTE{i:04d}",
                "broker": ["GS", "MS", "JPM"][i % 3],
                "quantity": random.randint(1000, 10000),
                "filled_quantity": random.randint(0, 10000),
                "avg_price": f"{random.uniform(100, 500):.2f}",
                "status": ["Working", "Filled", "Partial Fill"][i % 3],
            }
            for i in range(5)
        ]

    async def create_emsx_order(self, order_params: dict) -> dict[str, Any]:
        """Create a new EMSX order. TODO: Implement via Bloomberg."""
        logger.warning("Mock EMSX order creation. Implement Bloomberg integration!")

        return {
            "success": True,
            "order_id": random.randint(10000, 99999),
            "message": "Mock order created (not sent to Bloomberg)",
            **order_params,
        }

    async def cancel_emsx_order(self, order_id: int) -> dict[str, Any]:
        """Cancel an existing EMSX order. TODO: Implement via Bloomberg."""
        logger.warning("Mock EMSX order cancellation.")

        return {
            "success": True,
            "order_id": order_id,
            "message": "Mock cancellation (not sent to Bloomberg)",
        }

    async def modify_emsx_order(
        self, order_id: int, modifications: dict
    ) -> dict[str, Any]:
        """Modify an existing EMSX order. TODO: Implement via Bloomberg."""
        logger.warning("Mock EMSX order modification.")

        return {
            "success": True,
            "order_id": order_id,
            "message": "Mock modification (not sent to Bloomberg)",
            **modifications,
        }

    async def subscribe_to_orders(self, callback_fn=None) -> bool:
        """Subscribe to real-time EMSX order updates. TODO: Bloomberg sub."""
        logger.info("Mock EMSX order subscription.")
        return True