"""
Core Notification Registry — pub/sub pattern for domain-driven notifications.

Provides a central registry where domain services can register
their notification providers. Framework-agnostic.
"""

import logging
from typing import Callable

logger = logging.getLogger(__name__)

# Type alias for notification provider functions
NotificationProvider = Callable[[], list[dict]]


class NotificationRegistry:
    """
    Singleton registry for notification providers.

    Domain services register their notification providers here.
    NotificationService aggregates from all registered providers.
    """

    _providers: dict[str, NotificationProvider] = {}
    _initialized: bool = False

    @classmethod
    def register(cls, name: str, provider: NotificationProvider) -> None:
        """
        Register a notification provider.

        Args:
            name: Unique identifier for the provider (e.g., "positions", "pnl")
            provider: Callable that returns a list of notification dicts
        """
        if name in cls._providers:
            logger.debug(f"Notification provider '{name}' already registered, updating")
        cls._providers[name] = provider
        logger.debug(f"Registered notification provider: {name}")

    @classmethod
    def unregister(cls, name: str) -> None:
        """Remove a provider from the registry."""
        if name in cls._providers:
            del cls._providers[name]
            logger.debug(f"Unregistered notification provider: {name}")

    @classmethod
    def get_all_notifications(cls) -> list[dict]:
        """
        Aggregate notifications from all registered providers.

        Returns:
            Combined list of notifications from all providers
        """
        notifications = []
        for name, provider in cls._providers.items():
            try:
                provider_notifications = provider()
                notifications.extend(provider_notifications)
                logger.debug(f"Provider '{name}' returned {len(provider_notifications)} notifications")
            except Exception as e:
                logger.exception(f"Error getting notifications from provider '{name}': {e}")
        return notifications

    @classmethod
    def get_provider_names(cls) -> list[str]:
        """Get list of registered provider names."""
        return list(cls._providers.keys())

    @classmethod
    def clear(cls) -> None:
        """Clear all registered providers (useful for testing)."""
        cls._providers.clear()
        cls._initialized = False

    @classmethod
    def is_initialized(cls) -> bool:
        """Check if any providers have been registered."""
        return len(cls._providers) > 0
