from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, HTTPException

from app.database import User
from app.users import current_active_user
from pmt_core.services import MarketDataService

router = APIRouter(tags=["market-data"])

market_data_service = MarketDataService()

VALID_PERIODS = ("1mo", "3mo", "6mo", "ytd", "1y", "2y", "5y", "max")
VALID_CATEGORIES = ("ops", "ytd", "delta", "price", "volume")


def _parse_date(value: Optional[str], field: str) -> Optional[str]:
    """Validate and return a YYYY-MM-DD date string, or raise 422."""
    if value is None:
        return None
    import re

    if not re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        raise HTTPException(
            status_code=422, detail=f"{field} must be YYYY-MM-DD format"
        )
    return value


def _parse_tickers(value: Optional[str]) -> Optional[list[str]]:
    """Split comma-separated tickers, stripping whitespace and empty entries."""
    if value is None:
        return None
    tickers = [t.strip() for t in value.split(",") if t.strip()]
    if not tickers:
        return None
    return tickers


@router.get("/")
async def get_market_data(
    user: User = Depends(current_active_user),
):
    return await market_data_service.get_market_data()


@router.get("/fx")
async def get_fx_data(
    user: User = Depends(current_active_user),
):
    return await market_data_service.get_fx_data()


@router.get("/top-movers")
async def get_top_movers(
    category: Literal["ops", "ytd", "delta", "price", "volume"] = Query(
        "ops", description="Category: ops, ytd, delta, price, volume"
    ),
    user: User = Depends(current_active_user),
):
    return await market_data_service.get_top_movers(category)


@router.get("/trading-calendar")
async def get_trading_calendar(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user: User = Depends(current_active_user),
):
    start = _parse_date(start_date, "start_date")
    end = _parse_date(end_date, "end_date")
    return await market_data_service.get_trading_calendar(start, end)


@router.get("/market-hours")
async def get_market_hours(
    user: User = Depends(current_active_user),
):
    return await market_data_service.get_market_hours()


@router.get("/ticker")
async def get_ticker_data(
    user: User = Depends(current_active_user),
):
    return await market_data_service.get_ticker_data()


@router.get("/historical")
async def get_historical_data(
    tickers: Optional[str] = Query(None, description="Comma-separated ticker symbols"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user: User = Depends(current_active_user),
):
    ticker_list = _parse_tickers(tickers)
    start = _parse_date(start_date, "start_date")
    end = _parse_date(end_date, "end_date")
    return await market_data_service.get_historical_data(ticker_list, start, end)


@router.get("/stock/{symbol}")
async def get_stock_data(
    symbol: str,
    user: User = Depends(current_active_user),
):
    return await market_data_service.fetch_stock_data(symbol)


@router.get("/stock/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: Literal["1mo", "3mo", "6mo", "ytd", "1y", "2y", "5y", "max"] = Query(
        "1mo", description="Period: 1mo, 3mo, 6mo, ytd, 1y, 2y, 5y, max"
    ),
    user: User = Depends(current_active_user),
):
    return await market_data_service.fetch_stock_history(symbol, period)


@router.get("/stock/{symbol}/news")
async def get_stock_news(
    symbol: str,
    user: User = Depends(current_active_user),
):
    return await market_data_service.fetch_stock_news(symbol)
