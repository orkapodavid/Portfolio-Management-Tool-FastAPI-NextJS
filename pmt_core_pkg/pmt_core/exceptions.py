"""
pmt_core.exceptions - Custom Exception Hierarchy

This module defines a hierarchy of custom exceptions for the Portfolio Management Tool.
These exceptions are shared between the Reflex web app and pmt_core services.

Exception Hierarchy:
    PMTError (base)
    ├── DatabaseConnectionError
    ├── ConfigurationError
    ├── DataExtractionError
    ├── DataValidationError
    ├── ServiceUnavailableError
    └── AuthenticationError
"""

from typing import Optional, Any


class PMTError(Exception):
    """
    Base exception for Portfolio Management Tool.

    All custom exceptions should inherit from this class to allow
    for catching any PMT-related error with a single except clause.

    Attributes:
        message: Human-readable error description.
        details: Additional context or data about the error.
    """

    def __init__(self, message: str, details: Optional[Any] = None):
        self.message = message
        self.details = details
        super().__init__(self.message)

    def __str__(self) -> str:
        if self.details:
            return f"{self.message} | Details: {self.details}"
        return self.message


class DatabaseConnectionError(PMTError):
    """
    Failed to connect to database.

    Raised when:
    - Database server is unreachable
    - Connection credentials are invalid
    - Connection pool is exhausted
    - ODBC driver is not installed
    """

    def __init__(
        self,
        message: str = "Failed to connect to database",
        server: Optional[str] = None,
        database: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.server = server
        self.database = database
        super().__init__(message, details)


class ConfigurationError(PMTError):
    """
    Invalid or missing configuration.

    Raised when:
    - Required environment variable is missing
    - Configuration file cannot be parsed
    - Configuration value is invalid
    - Report configuration (*.report.ini) is malformed
    """

    def __init__(
        self,
        message: str = "Invalid or missing configuration",
        config_key: Optional[str] = None,
        config_file: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.config_key = config_key
        self.config_file = config_file
        super().__init__(message, details)


class DataExtractionError(PMTError):
    """
    Failed to extract data from source.

    Raised when:
    - Database query fails
    - Bloomberg API request fails
    - File cannot be read
    - Report data extraction fails
    """

    def __init__(
        self,
        message: str = "Failed to extract data from source",
        source: Optional[str] = None,
        query: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.source = source
        self.query = query
        super().__init__(message, details)


class DataValidationError(PMTError):
    """
    Data validation failed.

    Raised when:
    - Required field is missing
    - Data type is incorrect
    - Value is out of range
    - Business rule is violated
    """

    def __init__(
        self,
        message: str = "Data validation failed",
        field: Optional[str] = None,
        value: Optional[Any] = None,
        expected: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.field = field
        self.value = value
        self.expected = expected
        super().__init__(message, details)


class ServiceUnavailableError(PMTError):
    """
    Required service is not available.

    Raised when:
    - External API is down
    - Bloomberg terminal is not connected
    - Required service dependency is not running
    - Service timeout occurred
    """

    def __init__(
        self,
        message: str = "Required service is not available",
        service_name: Optional[str] = None,
        timeout: Optional[float] = None,
        details: Optional[Any] = None,
    ):
        self.service_name = service_name
        self.timeout = timeout
        super().__init__(message, details)


class AuthenticationError(PMTError):
    """
    Authentication or authorization failed.

    Raised when:
    - User credentials are invalid
    - Session has expired
    - Insufficient permissions
    - API key is invalid or expired
    """

    def __init__(
        self,
        message: str = "Authentication failed",
        user: Optional[str] = None,
        resource: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.user = user
        self.resource = resource
        super().__init__(message, details)


# Convenience aliases for common patterns
ConnectionError = DatabaseConnectionError  # Alias for database errors
ExtractionError = DataExtractionError  # Shorter alias
ValidationError = DataValidationError  # Shorter alias

__all__ = [
    "PMTError",
    "DatabaseConnectionError",
    "ConfigurationError",
    "DataExtractionError",
    "DataValidationError",
    "ServiceUnavailableError",
    "AuthenticationError",
    "ConnectionError",
    "ExtractionError",
    "ValidationError",
]
