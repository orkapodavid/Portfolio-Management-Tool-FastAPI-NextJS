from typing import List, Optional
from pmt_core.repositories.compliance import ComplianceRepository
from pmt_core.repositories.protocols import ComplianceRepositoryProtocol
from pmt_core.models import ComplianceRecord
import logging

logger = logging.getLogger(__name__)


class ComplianceService:
    """
    Core business service for Compliance.
    Delegates data fetching to ComplianceRepository.
    """

    def __init__(self, repository: Optional[ComplianceRepositoryProtocol] = None):
        self.repository = repository or ComplianceRepository()

    async def get_restricted_list(self) -> List[ComplianceRecord]:
        """Get restricted list."""
        return await self.repository.get_restricted_list()

    async def get_undertakings(
        self, position_date: str = None
    ) -> List[ComplianceRecord]:
        """Get undertakings."""
        return await self.repository.get_undertakings(position_date=position_date)

    async def get_beneficial_ownership(
        self, position_date: str = None
    ) -> List[ComplianceRecord]:
        """Get beneficial ownership."""
        return await self.repository.get_beneficial_ownership(
            position_date=position_date
        )

    async def get_monthly_exercise_limit(self, position_date: str = None) -> List[dict]:
        """Get monthly exercise limits."""
        return await self.repository.get_monthly_exercise_limits(
            position_date=position_date
        )
