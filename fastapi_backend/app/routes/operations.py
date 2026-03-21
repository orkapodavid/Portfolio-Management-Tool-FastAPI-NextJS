from fastapi import APIRouter, Depends

from app.database import User
from app.users import current_active_user
from pmt_core.services import OperationsService

router = APIRouter(tags=["operations"])

operations_service = OperationsService()


@router.get("/daily-procedures")
async def get_daily_procedures(
    user: User = Depends(current_active_user),
):
    return await operations_service.get_daily_procedures()


@router.get("/processes")
async def get_operation_processes(
    user: User = Depends(current_active_user),
):
    return await operations_service.get_operation_processes()
