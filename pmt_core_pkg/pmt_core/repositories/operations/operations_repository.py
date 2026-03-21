from typing import Any, List
from pmt_core.repositories.common import DatabaseRepository
import logging

logger = logging.getLogger(__name__)


class OperationsRepository(DatabaseRepository):
    """Repository for Operations data."""

    async def get_daily_procedures(self) -> List[dict[str, Any]]:
        """Get daily procedure check data."""
        if self.mock_mode:
            logger.info("Returning mock daily procedures data")
            return [
                {
                    "id": 1,
                    "check_date": "2026-01-11",
                    "host_run_date": "2026-01-11",
                    "scheduled_time": "06:00",
                    "procedure_name": "EOD Price Feed",
                    "status": "Completed",
                    "error_message": "",
                    "frequency": "Daily",
                    "scheduled_day": "All",
                    "created_by": "System",
                    "created_time": "2026-01-11 06:00:00",
                },
                {
                    "id": 2,
                    "check_date": "2026-01-11",
                    "host_run_date": "2026-01-11",
                    "scheduled_time": "07:00",
                    "procedure_name": "Position Reconciliation",
                    "status": "Completed",
                    "error_message": "",
                    "frequency": "Daily",
                    "scheduled_day": "All",
                    "created_by": "System",
                    "created_time": "2026-01-11 07:00:00",
                },
                {
                    "id": 3,
                    "check_date": "2026-01-11",
                    "host_run_date": "2026-01-11",
                    "scheduled_time": "08:00",
                    "procedure_name": "Risk Calculation",
                    "status": "Running",
                    "error_message": "",
                    "frequency": "Daily",
                    "scheduled_day": "All",
                    "created_by": "System",
                    "created_time": "2026-01-11 08:00:00",
                },
            ]
        return []

    async def get_operation_processes(self) -> List[dict[str, Any]]:
        """Get operation process status."""
        if self.mock_mode:
            logger.info("Returning mock operation processes data")
            return [
                {
                    "id": 1,
                    "process": "Bloomberg Feed",
                    "status": "Running",
                    "last_run_time": "2026-01-11 09:00:00",
                },
                {
                    "id": 2,
                    "process": "P&L Calculator",
                    "status": "Idle",
                    "last_run_time": "2026-01-11 08:30:00",
                },
                {
                    "id": 3,
                    "process": "Risk Engine",
                    "status": "Running",
                    "last_run_time": "2026-01-11 09:15:00",
                },
                {
                    "id": 4,
                    "process": "Trade Settlement",
                    "status": "Completed",
                    "last_run_time": "2026-01-11 07:00:00",
                },
            ]
        return []
