"""
Operations Service — core business logic for operations data.

Provides mock data for daily procedures and operation processes.
TODO: Replace mock data with actual database/repository calls.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class OperationsService:
    """
    Service for managing operations data.

    Generates mock daily procedures and operation processes data.
    Real implementation would delegate to a repository layer.
    """

    async def get_daily_procedures(self) -> list[dict[str, Any]]:
        """Get daily procedure check data. TODO: Replace with DB query."""
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

    async def get_operation_processes(self) -> list[dict[str, Any]]:
        """Get operation process status. TODO: Replace with DB query."""
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

    async def rerun_process(self, process_id: int, process_name: str = "") -> dict[str, Any]:
        """Rerun an operation process. TODO: Replace with actual orchestration call."""
        logger.info(f"Mock rerun requested for process id={process_id} name='{process_name}'")
        return {
            "success": True,
            "message": f"Process '{process_name}' (id={process_id}) has been queued for rerun.",
        }

    async def kill_process(self, process_id: int, process_name: str = "") -> dict[str, Any]:
        """Kill a running operation process. TODO: Replace with actual orchestration call."""
        logger.info(f"Mock kill requested for process id={process_id} name='{process_name}'")
        return {
            "success": True,
            "message": f"Process '{process_name}' (id={process_id}) has been terminated.",
        }
