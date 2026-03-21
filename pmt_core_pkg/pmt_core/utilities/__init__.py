"""
pmt_core.utilities - Configuration and Logging Helpers

UI-free utility functions for configuration management and logging.
"""

import logging
import os
from typing import Optional


def setup_logging(
    level: Optional[str] = None,
    format_string: Optional[str] = None,
    logger_name: str = "pmt_core",
) -> logging.Logger:
    """
    Configure logging for pmt_core.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
               Defaults to LOG_LEVEL environment variable or INFO.
        format_string: Custom log format string.
        logger_name: Name of the logger to configure.

    Returns:
        Configured logger instance.
    """
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO")

    if format_string is None:
        format_string = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    logger = logging.getLogger(logger_name)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Add handler if none exists
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(format_string))
        logger.addHandler(handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a child logger under the pmt_core namespace.

    Args:
        name: Logger name (will be prefixed with pmt_core.)

    Returns:
        Logger instance.
    """
    return logging.getLogger(f"pmt_core.{name}")


from .config_loader import ConfigLoader

# Initialize default logger
logger = setup_logging()

__all__ = ["setup_logging", "get_logger", "logger", "ConfigLoader"]
