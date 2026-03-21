"""
Core Notification Constants — framework-agnostic.

Categories, data schema, and type definitions for the notification system.
UI-specific enums (Tailwind colors, Lucide icons) stay in the app layer.
"""

from enum import StrEnum
from typing import TypedDict


class NotificationCategory(StrEnum):
    """Categories for raw notifications from service providers."""

    ALERTS = "Alerts"
    PORTFOLIO = "Portfolio"
    NEWS = "News"
    SYSTEM = "System"


class RawNotification(TypedDict, total=False):
    """Schema for notifications from service providers.

    This is the format returned by provider functions registered
    with NotificationRegistry.
    """

    id: str
    category: str  # NotificationCategory value
    title: str
    message: str
    time_ago: str
    is_read: bool
    icon: str  # Generic icon key (mapped to Lucide names in app layer)
    color: str  # Generic color key (mapped to Tailwind classes in app layer)
    module: str
    subtab: str
    row_id: str
    grid_id: str
    ticker: str
