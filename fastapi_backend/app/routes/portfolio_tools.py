from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from pmt_core.services import PortfolioToolsService

router = APIRouter(tags=["portfolio-tools"])

portfolio_tools_service = PortfolioToolsService()


@router.get("/pay-to-hold")
async def get_pay_to_hold(
    position_date: Optional[str] = Query(default=None),  # noqa: ARG001
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_pay_to_hold()


@router.get("/stock-borrow")
async def get_stock_borrow(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_stock_borrow()


@router.get("/reset-dates")
async def get_reset_dates(
    ticker: Annotated[Optional[str], Query()] = None,
    start_date: Annotated[Optional[str], Query()] = None,
    end_date: Annotated[Optional[str], Query()] = None,
    frequency: Annotated[Optional[str], Query()] = None,
    reset_month: Annotated[Optional[str], Query()] = None,
    reset_day: Annotated[Optional[str], Query()] = None,
    reset_up_down: Annotated[Optional[str], Query()] = None,
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_reset_dates(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        frequency=frequency,
        reset_month=reset_month,
        reset_day=reset_day,
        reset_up_down=reset_up_down,
    )


@router.get("/coming-resets")
async def get_coming_resets(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_coming_resets()


@router.get("/cb-installments")
async def get_cb_installments(
    position_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_cb_installments(
        position_date=position_date
    )


@router.get("/excess-amount")
async def get_excess_amount(
    position_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_excess_amount(
        position_date=position_date
    )


@router.get("/deal-indication")
async def get_deal_indication(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_deal_indication()


@router.get("/po-settlement")
async def get_po_settlement(
    position_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_po_settlement(
        position_date=position_date
    )


@router.get("/short-ecl")
async def get_short_ecl(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_short_ecl()
