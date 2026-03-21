from fastapi import APIRouter, Depends

from app.database import User
from app.users import current_active_user
from pmt_core.services import EMSXService

router = APIRouter(tags=["orders"])

emsx_service = EMSXService()


@router.get("/")
async def get_orders(
    user: User = Depends(current_active_user),
):
    return await emsx_service.get_orders()


@router.get("/routes")
async def get_order_routes(
    user: User = Depends(current_active_user),
):
    return await emsx_service.get_routes()
