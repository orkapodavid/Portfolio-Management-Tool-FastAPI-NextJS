"""
Market Data Service — core business logic for market data.

Provides mock data for market data grids, FX rates, top movers,
trading calendar, market hours, ticker data, and historical data.
Also includes Yahoo Finance integration for real-time data fetching.
TODO: Replace mock data with actual database/repository calls.
"""

import asyncio
import logging
import threading
from typing import Any, Optional
from datetime import datetime, timedelta

import yfinance as yf
from cachetools import TTLCache
from cachetools.keys import hashkey

logger = logging.getLogger(__name__)


class MarketDataService:
    """
    Core service for market data.

    Generates mock market data.
    Real implementation would delegate to a repository layer.
    """

    # Class-level TTL cache for historical data (shared across instances).
    _historical_cache: TTLCache = TTLCache(maxsize=256, ttl=3600)
    _historical_cache_lock = threading.Lock()

    async def get_market_data(self) -> list[dict[str, Any]]:
        """Get market data for dashboard. TODO: Replace with DB query."""
        logger.info("Returning mock market data")
        tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"]
        return [
            {
                "id": i + 1,
                "ticker": t,
                "listed_shares": "1,000,000",
                "last_volume": "54.2M",
                "last_price": "182.50",
                "vwap_price": "182.25",
                "bid": "182.45",
                "ask": "182.55",
                "chg_1d_pct": "+0.5%",
                "implied_vol_pct": "25.0%",
                "market_status": "Open",
                "created_by": "system",
            }
            for i, t in enumerate(tickers)
        ]

    async def get_fx_data(self) -> list[dict[str, Any]]:
        """Get FX data for dashboard. TODO: Replace with DB query."""
        logger.info("Returning mock FX data")
        pairs = ["EURUSD", "GBPUSD", "USDJPY", "USDCNY", "AUDUSD"]
        return [
            {
                "id": i + 1,
                "ticker": p,
                "last_price": "1.1000",
                "bid": "1.0995",
                "ask": "1.1005",
                "created_by": "system",
                "created_time": datetime.now().isoformat(),
                "updated_by": "system",
                "update": "",
            }
            for i, p in enumerate(pairs)
        ]

    async def get_fx_rates(self, currency_pairs: list[str]) -> list[dict[str, Any]]:
        """
        Fetch FX rates for currency pairs.

        Args:
            currency_pairs: List of currency pairs (e.g., ['EURUSD', 'GBPUSD'])

        Returns:
            List of FX rate data

        TODO: Implement using Bloomberg or database.
        """
        logger.warning("Using mock FX data. Implement real integration!")

        mock_data = []
        for pair in currency_pairs:
            mock_data.append(
                {
                    "ticker": pair,
                    "last_price": "1.1000",
                    "bid": "1.0995",
                    "ask": "1.1005",
                    "created_by": "system",
                    "created_time": datetime.now().isoformat(),
                }
            )

        return mock_data

    async def get_top_movers(self, category: str = "ops") -> list[dict[str, Any]]:
        """
        Get top movers data for dashboard.

        Args:
            category: Category of top movers ('ops', 'ytd', 'delta', 'price', 'volume')

        Returns:
            List of top mover dictionaries
        """
        logger.info(f"Returning mock top movers data for category: {category}")

        movers_data = {
            "ops": [
                {
                    "ticker": "NVDA",
                    "name": "NVIDIA",
                    "value": "+$2.4M",
                    "change": "+12%",
                    "is_positive": True,
                },
                {
                    "ticker": "AAPL",
                    "name": "Apple",
                    "value": "+$1.8M",
                    "change": "+5%",
                    "is_positive": True,
                },
                {
                    "ticker": "TSLA",
                    "name": "Tesla",
                    "value": "-$1.2M",
                    "change": "-8%",
                    "is_positive": False,
                },
                {
                    "ticker": "META",
                    "name": "Meta",
                    "value": "+$950K",
                    "change": "+3%",
                    "is_positive": True,
                },
            ],
            "ytd": [
                {
                    "ticker": "NVDA",
                    "name": "NVIDIA",
                    "value": "+$45M",
                    "change": "+180%",
                    "is_positive": True,
                },
                {
                    "ticker": "META",
                    "name": "Meta",
                    "value": "+$28M",
                    "change": "+120%",
                    "is_positive": True,
                },
                {
                    "ticker": "AAPL",
                    "name": "Apple",
                    "value": "+$15M",
                    "change": "+45%",
                    "is_positive": True,
                },
                {
                    "ticker": "MSFT",
                    "name": "Microsoft",
                    "value": "+$12M",
                    "change": "+35%",
                    "is_positive": True,
                },
            ],
            "delta": [
                {
                    "ticker": "TSLA",
                    "name": "Tesla",
                    "value": "+15K",
                    "change": "+8%",
                    "is_positive": True,
                },
                {
                    "ticker": "GOOGL",
                    "name": "Google",
                    "value": "-12K",
                    "change": "-5%",
                    "is_positive": False,
                },
                {
                    "ticker": "AMZN",
                    "name": "Amazon",
                    "value": "+8K",
                    "change": "+3%",
                    "is_positive": True,
                },
                {
                    "ticker": "NFLX",
                    "name": "Netflix",
                    "value": "-5K",
                    "change": "-2%",
                    "is_positive": False,
                },
            ],
            "price": [
                {
                    "ticker": "SMCI",
                    "name": "Super Micro",
                    "value": "$985.2",
                    "change": "+25%",
                    "is_positive": True,
                },
                {
                    "ticker": "ARM",
                    "name": "ARM Holdings",
                    "value": "$142.5",
                    "change": "+18%",
                    "is_positive": True,
                },
                {
                    "ticker": "SNOW",
                    "name": "Snowflake",
                    "value": "$160.1",
                    "change": "-15%",
                    "is_positive": False,
                },
                {
                    "ticker": "PLTR",
                    "name": "Palantir",
                    "value": "$24.5",
                    "change": "+2.1%",
                    "is_positive": True,
                },
            ],
            "volume": [
                {
                    "ticker": "TSLA",
                    "name": "Tesla",
                    "value": "98M",
                    "change": "+15%",
                    "is_positive": True,
                },
                {
                    "ticker": "AAPL",
                    "name": "Apple",
                    "value": "54M",
                    "change": "-5%",
                    "is_positive": False,
                },
                {
                    "ticker": "AMD",
                    "name": "AMD",
                    "value": "45M",
                    "change": "+25%",
                    "is_positive": True,
                },
                {
                    "ticker": "F",
                    "name": "Ford",
                    "value": "32M",
                    "change": "+2%",
                    "is_positive": True,
                },
            ],
        }
        return movers_data.get(category, movers_data["ops"])

    async def get_trading_calendar(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get trading calendar, filtered by optional date range.

        Args:
            start_date: Start date inclusive (YYYY-MM-DD, optional)
            end_date: End date inclusive (YYYY-MM-DD, optional)

        Returns:
            List of trading calendar entries matching the filters.
        """
        logger.info(
            f"Querying trading calendar — start_date={start_date}, end_date={end_date}"
        )

        base_date = datetime.now()
        num_days = 60  # 2 months of calendar data

        # Day-of-week names
        day_names = [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday",
        ]

        result = []
        row_id = 0
        for day in range(num_days):
            trade_dt = base_date - timedelta(days=day)
            trade_date = trade_dt.strftime("%Y-%m-%d")
            weekday = trade_dt.weekday()  # 0=Mon … 6=Sun

            # Apply date range filter at "query" level
            if start_date and trade_date < start_date:
                continue
            if end_date and trade_date > end_date:
                continue

            is_weekend = weekday >= 5
            # Simulate per-market open/closed (weekends always closed)
            status_open = "Open"
            status_closed = "Closed"

            row_id += 1
            result.append(
                {
                    "id": row_id,
                    "trade_date": trade_date,
                    "day_of_week": day_names[weekday],
                    "usa": status_closed if is_weekend else status_open,
                    "hkg": status_closed if is_weekend else status_open,
                    "jpn": status_closed if is_weekend else status_open,
                    "aus": status_closed if is_weekend else status_open,
                    "nzl": status_closed if is_weekend else status_open,
                    "kor": status_closed if is_weekend else status_open,
                    "chn": status_closed if is_weekend else status_open,
                    "twn": status_closed if is_weekend else status_open,
                    "ind": status_closed if is_weekend else status_open,
                }
            )

        logger.info(f"Trading calendar — {len(result)} rows")
        return result

    async def get_market_hours(self) -> list[dict[str, Any]]:
        """Get market hours for dashboard. TODO: Replace with DB query."""
        logger.info("Returning mock market hours data")
        return [
            {
                "id": 1,
                "market": "NYSE",
                "ticker": "SPY",
                "session": "Regular",
                "local_time": "09:30-16:00",
                "session_period": "Morning",
                "is_open": "Yes",
                "timezone": "EST",
            },
        ]

    async def get_ticker_data(self) -> list[dict[str, Any]]:
        """Get reference ticker data for dashboard. TODO: Replace with DB query."""
        logger.info("Returning mock ticker data")
        return [
            {
                "id": 1,
                "ticker": "AAPL",
                "currency": "USD",
                "fx_rate": "1.00",
                "sector": "Technology",
                "company": "Apple Inc.",
                "po_lead_manager": "GS",
                "fmat_cap": "2.95T",
                "smkt_cap": "2.95T",
                "chg_1d_pct": "+0.5%",
                "dtl": "0",
            },
        ]

    async def get_realtime_market_data(
        self, tickers: list[str]
    ) -> list[dict[str, Any]]:
        """
        Fetch real-time market data for given tickers.

        Returns mock data; real implementation would fetch from Bloomberg/DB.

        Args:
            tickers: List of ticker symbols

        Returns:
            List of dictionaries with market data
        """
        logger.info(f"Returning mock realtime market data for {tickers}")
        return [
            {
                "id": hash(t),
                "ticker": t,
                "listed_shares": "1,000,000",
                "last_volume": "54.2M",
                "last_price": "182.50",
                "vwap_price": "182.25",
                "bid": "182.45",
                "ask": "182.55",
                "chg_1d_pct": "+0.5%",
                "implied_vol_pct": "25.0%",
                "market_status": "Open",
                "created_by": "system",
            }
            for t in tickers
        ]

    @staticmethod
    def _historical_cache_key(
        tickers: list[str] | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ):
        """Build a hashable cache key from filter params."""
        ticker_key = frozenset(tickers) if tickers else frozenset()
        return hashkey(ticker_key, start_date or "", end_date or "")

    async def get_historical_data(
        self,
        tickers: list[str] | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Fetch historical market data, filtered by tickers and date range.

        Results are cached via cachetools TTLCache (256 entries, 1h TTL).

        Args:
            tickers: List of ticker symbols (optional — all tickers if empty/None)
            start_date: Start date inclusive (YYYY-MM-DD, optional)
            end_date: End date inclusive (YYYY-MM-DD, optional)

        Returns:
            List of historical data points matching the filters
        """
        key = self._historical_cache_key(tickers, start_date, end_date)

        with self._historical_cache_lock:
            if key in self._historical_cache:
                logger.debug(f"Historical data cache HIT for {key}")
                return self._historical_cache[key]

        # --- Mock data generation (simulates DB query) ---
        logger.info(
            f"Querying historical data — tickers={tickers}, "
            f"start_date={start_date}, end_date={end_date}"
        )

        all_tickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"]
        query_tickers = tickers if tickers else all_tickers

        base_date = datetime.now()
        num_days = 30

        result = []
        row_id = 0
        for i, tkr in enumerate(query_tickers):
            orig_idx = all_tickers.index(tkr) if tkr in all_tickers else i
            for day in range(num_days):
                trade_date = (base_date - timedelta(days=day)).strftime("%Y-%m-%d")

                if start_date and trade_date < start_date:
                    continue
                if end_date and trade_date > end_date:
                    continue

                row_id += 1
                result.append(
                    {
                        "id": row_id,
                        "trade_date": trade_date,
                        "ticker": tkr,
                        "vwap_price": f"{150 + orig_idx * 50 + day:.2f}",
                        "last_price": f"{151 + orig_idx * 50 + day:.2f}",
                        "last_volume": f"{(orig_idx + 1) * 1000000:,}",
                        "chg_1d_pct": f"{(-1 + orig_idx * 0.5):.2f}%",
                        "created_by": "system",
                        "created_time": datetime.now().isoformat(),
                        "updated_by": "system",
                        "update": "Active",
                    }
                )

        with self._historical_cache_lock:
            self._historical_cache[key] = result

        logger.info(f"Historical data fetched & cached — {len(result)} rows")

        return result

    # === Yahoo Finance Integration ===

    async def fetch_stock_data(self, symbol: str) -> dict:
        """
        Fetch real-time data for a single stock using Yahoo Finance.

        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL')

        Returns:
            Dictionary with stock data including price, volume, market cap, etc.
        """
        try:
            ticker = yf.Ticker(symbol)
            info = await asyncio.to_thread(lambda: ticker.info)
            return self._extract_stock_info(symbol, info)
        except Exception as e:
            logger.exception(f"Error fetching data for {symbol}: {e}")
            return {}

    async def fetch_multiple_stocks(self, symbols: list[str]) -> dict[str, dict]:
        """
        Fetch real-time data for multiple stocks using Yahoo Finance.

        Args:
            symbols: List of stock ticker symbols

        Returns:
            Dictionary mapping symbols to their stock data
        """
        if not symbols:
            return {}

        valid_symbols = [s for s in symbols if s]
        if not valid_symbols:
            return {}

        try:

            def _fetch():
                tickers_obj = yf.Tickers(" ".join(valid_symbols))
                results = {}
                for symbol in valid_symbols:
                    try:
                        ticker = tickers_obj.tickers.get(symbol)
                        if ticker:
                            info = ticker.info
                            results[symbol] = self._extract_stock_info(symbol, info)
                    except Exception as e:
                        logger.exception(f"Failed to fetch {symbol} in batch: {e}")
                return results

            return await asyncio.to_thread(_fetch)
        except Exception as e:
            logger.exception(f"Batch fetch error: {e}")
            return {}

    async def fetch_stock_history(self, symbol: str, period: str = "1mo") -> list[dict]:
        """
        Fetch historical price data for a symbol using Yahoo Finance.

        Args:
            symbol: Stock ticker symbol
            period: Time period ('1mo', '3mo', '6mo', 'ytd', '1y', '2y', etc.)

        Returns:
            List of historical data points with date and price
        """
        try:

            def _fetch_history():
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period=period)
                data = []
                for date, row in hist.iterrows():
                    data.append(
                        {
                            "date": date.strftime("%Y-%m-%d"),
                            "price": round(row["Close"], 2),
                        }
                    )
                return data

            return await asyncio.to_thread(_fetch_history)
        except Exception as e:
            logger.exception(f"Error fetching history for {symbol}: {e}")
            return []

    async def fetch_stock_news(self, symbol: str) -> list[dict]:
        """
        Fetch news for a symbol using Yahoo Finance.

        Args:
            symbol: Stock ticker symbol

        Returns:
            List of news items
        """
        try:

            def _fetch_news():
                ticker = yf.Ticker(symbol)
                news = ticker.news
                formatted_news = []
                for item in news[:5]:
                    formatted_news.append(
                        {
                            "id": item.get("uuid", ""),
                            "headline": item.get("title", ""),
                            "source": item.get("publisher", "Yahoo Finance"),
                            "time_ago": "Today",
                            "summary": "No summary available.",
                            "url": item.get("link", "#"),
                            "sentiment": "Neutral",
                            "related_symbols": [symbol],
                        }
                    )
                return formatted_news

            return await asyncio.to_thread(_fetch_news)
        except Exception as e:
            logger.exception(f"Error fetching news for {symbol}: {e}")
            return []

    async def subscribe_to_tickers(self, tickers: list[str]) -> bool:
        """
        Subscribe to real-time updates for tickers.
        TODO: Implement Bloomberg subscription logic.
        """
        logger.info(f"Mock subscription to tickers: {tickers}")
        return True

    # === Helper Methods ===

    def _extract_stock_info(self, symbol: str, info: dict) -> dict:
        """Helper to extract relevant fields from yfinance info dict."""
        current_price = (
            info.get("currentPrice") or info.get("regularMarketPrice") or 0.0
        )
        previous_close = (
            info.get("previousClose")
            or info.get("regularMarketPreviousClose")
            or current_price
        )

        change_pct = 0.0
        if previous_close and previous_close > 0:
            change_pct = (current_price - previous_close) / previous_close * 100

        return {
            "symbol": symbol,
            "name": info.get("shortName") or info.get("longName") or symbol,
            "current_price": current_price,
            "previous_close": previous_close,
            "daily_change_pct": round(change_pct, 2),
            "market_cap": self._format_market_cap(info.get("marketCap", 0)),
            "pe_ratio": round(info.get("trailingPE", 0.0) or 0.0, 2),
            "sector": info.get("sector", "Unknown"),
            "volume": self._format_volume(info.get("volume", 0)),
            "high_52": info.get("fiftyTwoWeekHigh", 0.0),
            "low_52": info.get("fiftyTwoWeekLow", 0.0),
            "description": info.get("longBusinessSummary", "No description available."),
            "eps": info.get("trailingEps", 0.0),
        }

    def _format_market_cap(self, value: float) -> str:
        """Formats market cap value to string (e.g. 2.5T, 500B)."""
        if not value:
            return "N/A"
        if value >= 1000000000000:
            return f"{value / 1000000000000:.2f}T"
        elif value >= 1000000000:
            return f"{value / 1000000000:.2f}B"
        elif value >= 1000000:
            return f"{value / 1000000:.2f}M"
        else:
            return f"{value:,.0f}"

    def _format_volume(self, value: float) -> str:
        """Formats volume value to string."""
        if not value:
            return "0"
        if value >= 1000000:
            return f"{value / 1000000:.1f}M"
        elif value >= 1000:
            return f"{value / 1000:.1f}K"
        else:
            return f"{value}"

    def _calculate_daily_change(self, current: float, previous: float) -> float:
        """Calculate daily percentage change."""
        if not previous:
            return 0.0
        return (current - previous) / previous * 100
