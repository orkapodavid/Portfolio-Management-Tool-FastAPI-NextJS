from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from app.routes._validation import validate_date
from pmt_core.services import RiskService

router = APIRouter(tags=["risk"])

risk_service = RiskService()


@router.get("/delta-change")
async def get_delta_change(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await risk_service.get_delta_changes(date)


@router.get("/measures")
async def get_risk_measures(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await risk_service.get_risk_measures(date)


@router.get("/inputs")
async def get_risk_inputs(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await risk_service.get_risk_inputs(date)
