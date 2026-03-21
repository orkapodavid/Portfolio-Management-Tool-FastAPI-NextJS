"""
Core Notification Service — framework-agnostic CRUD operations.

Aggregates notifications from all registered providers in NotificationRegistry,
applies filters, and provides create/read/update/delete operations.
"""

import logging
import random
from typing import Optional

from pmt_core.services.notifications.notification_registry import NotificationRegistry

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for managing notifications.

    Aggregates notifications from all registered providers in NotificationRegistry.
    """

    def __init__(self):
        """Initialize notification service."""
        pass

    async def get_notifications(
        self,
        category: Optional[str] = None,
        unread_only: bool = False,
        limit: Optional[int] = None,
    ) -> list[dict]:
        """
        Get notifications, optionally filtered by category.

        Aggregates from all registered notification providers.

        Args:
            category: Filter by category ('Alerts', 'Portfolio', 'News', 'System')
            unread_only: Only return unread notifications
            limit: Maximum number of notifications to return

        Returns:
            List of notification dictionaries
        """
        # Aggregate from registry
        all_notifications = NotificationRegistry.get_all_notifications()

        logger.debug(
            f"Aggregated {len(all_notifications)} notifications from "
            f"{len(NotificationRegistry.get_provider_names())} providers"
        )

        # Apply category filter
        if category and category != "All":
            all_notifications = [
                n for n in all_notifications if n["category"] == category
            ]

        # Apply unread filter
        if unread_only:
            all_notifications = [n for n in all_notifications if not n["is_read"]]

        # Apply limit
        if limit:
            all_notifications = all_notifications[:limit]

        return all_notifications

    async def mark_as_read(self, notification_id: str) -> bool:
        """
        Mark a notification as read.

        TODO: Update database to mark notification as read.
        """
        logger.info(f"Mock: Marking notification {notification_id} as read")
        return True

    async def mark_all_as_read(self, category: Optional[str] = None) -> int:
        """
        Mark all notifications as read.

        TODO: Batch update database records.
        """
        logger.info(f"Mock: Marking all notifications as read (category: {category})")
        return 10  # Mock count

    async def delete_notification(self, notification_id: str) -> bool:
        """
        Delete a notification.

        TODO: Delete from database.
        """
        logger.info(f"Mock: Deleting notification {notification_id}")
        return True

    async def delete_all(self, category: Optional[str] = None) -> int:
        """
        Delete all notifications.

        TODO: Batch delete from database.
        """
        logger.info(f"Mock: Deleting all notifications (category: {category})")
        return 10  # Mock count

    async def create_notification(
        self,
        category: str,
        title: str,
        message: str,
        icon: str = "bell",
        color: str = "blue",
        module: str = "Market Data",
        subtab: str = "Market Data",
        row_id: str = "",
        grid_id: str = "market_data_grid",
    ) -> dict:
        """
        Create a new notification.

        TODO: Insert into database and potentially push to client.
        """
        logger.info(f"Mock: Creating notification - {title}")

        return {
            "id": str(random.randint(1000, 9999)),
            "category": category,
            "title": title,
            "message": message,
            "time_ago": "Just now",
            "is_read": False,
            "icon": icon,
            "color": color,
            "module": module,
            "subtab": subtab,
            "row_id": row_id,
            "grid_id": grid_id,
        }
