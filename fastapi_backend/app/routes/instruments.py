from fastapi import APIRouter, Depends

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
    user: User = Depends(current_active_user),
):
    return await instruments_service.get_special_terms()
