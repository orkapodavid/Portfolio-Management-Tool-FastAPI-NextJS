from fastapi import APIRouter, Depends

from app.database import User
from app.users import current_active_user
from pmt_core.services import PerformanceService

router = APIRouter(tags=["performance"])

performance_service = PerformanceService()


@router.get("/kpi")
async def get_kpi_data(
    user: User = Depends(current_active_user),
):
    return await performance_service.get_kpi_data()


@router.get("/top-movers")
async def get_top_movers(
    user: User = Depends(current_active_user),
):
    return await performance_service.get_top_movers()
