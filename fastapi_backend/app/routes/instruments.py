from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from pmt_core.services import InstrumentsService

router = APIRouter(tags=["instruments"])

instruments_service = InstrumentsService()


@router.get("/ticker-data")
async def get_ticker_data(
    user: User = Depends(current_active_user),
):
    return await instruments_service.get_ticker_data()


@router.get("/stock-screener")
async def get_stock_screener(
    user: User = Depends(current_active_user),
):
    return await instruments_service.get_stock_screener()


@router.get("/special-terms")
async def get_special_terms(
    pos_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await instruments_service.get_special_terms(
        position_date=pos_date or ""
    )


@router.get("/instrument-data")
async def get_instrument_data(
    user: User = Depends(current_active_user),
):
    return await instruments_service.get_instrument_data()


@router.get("/instrument-term")
async def get_instrument_term(
    user: User = Depends(current_active_user),
):
    return await instruments_service.get_instrument_terms()
