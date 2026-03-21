from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from app.routes._validation import validate_date
from pmt_core.services import PnLService

router = APIRouter(tags=["pnl"])

pnl_service = PnLService()


@router.get("/changes")
async def get_pnl_changes(
    trade_date: Optional[str] = Query(None, description="Trade date (YYYY-MM-DD)"),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await pnl_service.get_pnl_changes(date)


@router.get("/summary")
async def get_pnl_summary(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await pnl_service.get_pnl_summary(date)


@router.get("/currency")
async def get_pnl_by_currency(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await pnl_service.get_pnl_by_currency(date)


@router.get("/full")
async def get_pnl_full(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await pnl_service.get_pnl_full(date)


@router.get("/kpi")
async def get_kpi_metrics(
    user: User = Depends(current_active_user),
):
    return await pnl_service.get_kpi_metrics()
