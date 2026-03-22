from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from pmt_core.services import EMSXService

router = APIRouter(tags=["orders"])

emsx_service = EMSXService()


@router.get("/")
async def get_orders(
    user: User = Depends(current_active_user),
):
    return await emsx_service.get_emsx_orders()


@router.get("/routes")
async def get_order_routes(
    order_id: Optional[int] = Query(
        None, ge=1, description="Optional EMSX order identifier"
    ),
    user: User = Depends(current_active_user),
):
    return await emsx_service.get_emsx_routes(order_id)
