"""
Core Performance Service for Portfolio Management Tool.

Provides KPI metrics and portfolio holdings data.
KPI values are computed dynamically from the holdings data,
and sparkline trends are generated to reflect performance direction.
TODO: Replace mock holdings with repository calls.
"""

import logging
import random

logger = logging.getLogger(__name__)


def _generate_sparkline(is_positive: bool, num_points: int = 6) -> str:
    """
    Generate SVG polyline points for a sparkline that trends in the given direction.

    The sparkline is drawn inside a viewBox of "0 0 50 24".
    - For positive trends, the line trends downward on the Y axis (lower Y = higher value).
    - For negative trends, the line trends upward on the Y axis.

    Returns:
        SVG polyline points string, e.g. "0,18 10,14 20,16 30,10 40,8 50,4"
    """
    x_step = 50 / (num_points - 1)
    points = []

    if is_positive:
        # Start high (bottom of chart), trend toward low Y (top of chart)
        y = random.uniform(18, 22)
        for i in range(num_points):
            x = round(i * x_step)
            y = max(2, y + random.uniform(-4, -0.5))  # Drift upward (lower Y)
            points.append(f"{x},{round(y)}")
    else:
        # Start low (top of chart), trend toward high Y (bottom of chart)
        y = random.uniform(4, 8)
        for i in range(num_points):
            x = round(i * x_step)
            y = min(22, y + random.uniform(0.5, 4))  # Drift downward (higher Y)
            points.append(f"{x},{round(y)}")

    return " ".join(points)


def _format_large_number(value: float) -> str:
    """Format a large number with appropriate suffix (B, M, K)."""
    abs_val = abs(value)
    sign = "+" if value > 0 else "-" if value < 0 else ""

    if abs_val >= 1_000_000_000:
        return f"{sign}${abs_val / 1_000_000_000:.1f}B"
    elif abs_val >= 1_000_000:
        return f"{sign}${abs_val / 1_000_000:.1f}M"
    elif abs_val >= 1_000:
        return f"{sign}${abs_val / 1_000:.1f}K"
    else:
        return f"{sign}${abs_val:.2f}"


class PerformanceService:
    """Core service for performance header data (KPIs, holdings)."""

    async def get_kpi_metrics(self) -> list[dict]:
        """
        Get KPI metrics for the header cards.

        Computes values dynamically from the holdings data and generates
        sparkline trends that reflect whether each metric is positive or negative.

        Returns:
            List of KPI metrics with sparkline-compatible trend data.
        """
        logger.info("Computing KPI metrics from holdings data")

        # Fetch the current holdings to derive KPI values
        holdings = await self.get_portfolio_holdings()

        # --- Compute Total NAV ---
        total_nav = sum(h["shares"] * h["current_price"] for h in holdings)
        nav_positive = total_nav > 0

        # --- Compute Daily P&L ---
        daily_pnl = sum(
            h["shares"] * h["current_price"] * (h["daily_change_pct"] / 100)
            for h in holdings
        )
        pnl_positive = daily_pnl >= 0

        # --- Compute YTD Return ---
        total_cost = sum(h["shares"] * h["avg_cost"] for h in holdings)
        ytd_return_pct = ((total_nav - total_cost) / total_cost * 100) if total_cost else 0.0
        ytd_positive = ytd_return_pct >= 0

        # --- Compute Net Exposure ---
        # Net exposure = (long - short) / total, using daily_change as proxy for direction
        long_value = sum(
            h["shares"] * h["current_price"]
            for h in holdings
            if h["daily_change_pct"] >= 0
        )
        net_exposure_pct = (long_value / total_nav * 100) if total_nav else 0.0
        exposure_positive = net_exposure_pct >= 50  # Above 50% is considered positive

        return [
            {
                "label": "Total NAV",
                "value": _format_large_number(total_nav),
                "is_positive": nav_positive,
                "trend_data": _generate_sparkline(nav_positive),
            },
            {
                "label": "Daily P&L",
                "value": _format_large_number(daily_pnl),
                "is_positive": pnl_positive,
                "trend_data": _generate_sparkline(pnl_positive),
            },
            {
                "label": "YTD Return",
                "value": f"{'+' if ytd_positive else ''}{ytd_return_pct:.1f}%",
                "is_positive": ytd_positive,
                "trend_data": _generate_sparkline(ytd_positive),
            },
            {
                "label": "Net Exposure",
                "value": f"{net_exposure_pct:.0f}%",
                "is_positive": exposure_positive,
                "trend_data": _generate_sparkline(exposure_positive),
            },
        ]

    async def get_portfolio_holdings(self) -> list[dict]:
        """
        Get portfolio holdings for summary cards.

        Returns:
            List of portfolio holdings
        """
        logger.info("Fetching portfolio holdings from core service")

        # Mock portfolio holdings data
        return [
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "shares": 150.0,
                "avg_cost": 175.0,
                "current_price": 189.5,
                "daily_change_pct": 1.25,
                "asset_class": "Technology",
            },
            {
                "symbol": "MSFT",
                "name": "Microsoft Corp.",
                "shares": 100.0,
                "avg_cost": 350.0,
                "current_price": 402.1,
                "daily_change_pct": 0.85,
                "asset_class": "Technology",
            },
            {
                "symbol": "JPM",
                "name": "JPMorgan Chase",
                "shares": 200.0,
                "avg_cost": 140.0,
                "current_price": 175.3,
                "daily_change_pct": -0.45,
                "asset_class": "Finance",
            },
        ]
