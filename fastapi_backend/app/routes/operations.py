from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import User
from app.users import current_active_user
from pmt_core.services import OperationsService

router = APIRouter(tags=["operations"])

operations_service = OperationsService()


class ProcessActionRequest(BaseModel):
    process_name: str = ""


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


@router.post("/processes/{process_id}/rerun")
async def rerun_process(
    process_id: int,
    payload: ProcessActionRequest = ProcessActionRequest(),
    user: User = Depends(current_active_user),
):
    return await operations_service.rerun_process(
        process_id, payload.process_name
    )


@router.post("/processes/{process_id}/kill")
async def kill_process(
    process_id: int,
    payload: ProcessActionRequest = ProcessActionRequest(),
    user: User = Depends(current_active_user),
):
    return await operations_service.kill_process(
        process_id, payload.process_name
    )
