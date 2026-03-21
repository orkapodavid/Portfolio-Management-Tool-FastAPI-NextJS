import os
import logging
from typing import Optional, Any
from contextlib import contextmanager

try:
    import pyodbc

    PYODBC_AVAILABLE = True
except ImportError:
    PYODBC_AVAILABLE = False
    logging.warning("pyodbc not installed. Database functionality will be limited.")

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    logging.warning(
        "python-dotenv not installed. Environment variables must be set manually."
    )

logger = logging.getLogger(__name__)


class DatabaseRepository:
    """
    Base repository for database interactions.
    Handles connection management and query execution.
    """

    def __init__(self):
        self.server = os.getenv("DB_SERVER", "localhost")
        self.database = os.getenv("DB_NAME", "portfolio_management")
        self.username = os.getenv("DB_USERNAME", "")
        self.password = os.getenv("DB_PASSWORD", "")
        self.driver = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
        self.connection_timeout = int(os.getenv("DB_CONNECTION_TIMEOUT", "30"))

        # Mock Data Mode toggle
        # Services can set this to True to force mock data return
        self.mock_mode = os.getenv("USE_MOCK_DATA", "True").lower() == "true"

    def get_connection_string(self) -> str:
        """Build MS SQL Server connection string."""
        if self.username and self.password:
            # SQL Server Authentication
            return (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.server};"
                f"DATABASE={self.database};"
                f"UID={self.username};"
                f"PWD={self.password};"
                f"Connection Timeout={self.connection_timeout};"
            )
        else:
            # Windows Authentication
            return (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.server};"
                f"DATABASE={self.database};"
                f"Trusted_Connection=yes;"
                f"Connection Timeout={self.connection_timeout};"
            )

    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        if self.mock_mode:
            logger.info("Mock mode enabled: yielding None connection.")
            yield None
            return

        if not PYODBC_AVAILABLE:
            raise ImportError("pyodbc is not installed. Run: pip install pyodbc")

        connection = None
        try:
            conn_str = self.get_connection_string()
            connection = pyodbc.connect(conn_str)
            yield connection
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if connection:
                connection.close()

    async def execute_query(
        self, query: str, params: Optional[tuple] = None
    ) -> list[dict[str, Any]]:
        """
        Execute a SELECT query and return results as list of dictionaries.
        This method should be used by subclasses when fetching real data.
        """
        if self.mock_mode:
            logger.warning("execute_query called in mock mode. Returning empty list.")
            return []

        # Implementation for real DB execution (simplistic version)
        with self.get_connection() as conn:
            if not conn:
                return []
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            columns = [column[0] for column in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            return results

    async def execute_stored_proc(
        self, proc_name: str, params: Optional[list] = None
    ) -> list[dict[str, Any]]:
        """Execute a stored procedure."""
        if self.mock_mode:
            logger.warning(
                "execute_stored_proc called in mock mode. Returning empty list."
            )
            return []

        # TODO: Implement stored proc execution
        return []
