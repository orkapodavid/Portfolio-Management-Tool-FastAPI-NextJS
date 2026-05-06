from fastapi import APIRouter, Depends

from app.database import User
from app.users import current_active_user
from pmt_core.services import PortfolioToolsService

router = APIRouter(tags=["portfolio-tools"])

portfolio_tools_service = PortfolioToolsService()


@router.get("/pay-to-hold")
async def get_pay_to_hold(
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
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_reset_dates()


@router.get("/coming-resets")
async def get_coming_resets(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_coming_resets()


@router.get("/cb-installments")
async def get_cb_installments(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_cb_installments()


@router.get("/excess-amount")
async def get_excess_amount(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_excess_amount()


@router.get("/deal-indication")
async def get_deal_indication(
    user: User = Depends(current_active_user),
):
    return await portfolio_tools_service.get_deal_indication()
