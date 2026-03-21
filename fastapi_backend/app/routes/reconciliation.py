from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from app.routes._validation import validate_date
from pmt_core.services import ReconciliationService

router = APIRouter(tags=["reconciliation"])

recon_service = ReconciliationService()


@router.get("/pps")
async def get_pps_recon(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await recon_service.get_pps_recon(date)


@router.get("/settlement")
async def get_settlement_recon(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await recon_service.get_settlement_recon(date)


@router.get("/failed-trades")
async def get_failed_trades(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await recon_service.get_failed_trades(date)


@router.get("/pnl")
async def get_pnl_recon(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await recon_service.get_pnl_recon(date)


@router.get("/risk-input")
async def get_risk_input_recon(
    trade_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(trade_date, "trade_date")
    return await recon_service.get_risk_input_recon(date)
