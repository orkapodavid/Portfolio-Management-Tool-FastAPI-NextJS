from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from app.routes._validation import validate_date
from pmt_core.services import PositionService

router = APIRouter(tags=["positions"])

position_service = PositionService()


@router.get("/")
async def get_positions(
    position_date: Optional[str] = Query(
        None, description="Position date (YYYY-MM-DD)"
    ),
    user: User = Depends(current_active_user),
):
    date = validate_date(position_date, "position_date")
    return await position_service.get_positions(date)


@router.get("/stocks")
async def get_stock_positions(
    position_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(position_date, "position_date")
    return await position_service.get_stock_positions(date)


@router.get("/warrants")
async def get_warrant_positions(
    position_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(position_date, "position_date")
    return await position_service.get_warrant_positions(date)


@router.get("/bonds")
async def get_bond_positions(
    position_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    date = validate_date(position_date, "position_date")
    return await position_service.get_bond_positions(date)


@router.get("/trade-summary")
async def get_trade_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: User = Depends(current_active_user),
):
    start = validate_date(start_date, "start_date")
    end = validate_date(end_date, "end_date")
    return await position_service.get_trade_summary(start, end)
