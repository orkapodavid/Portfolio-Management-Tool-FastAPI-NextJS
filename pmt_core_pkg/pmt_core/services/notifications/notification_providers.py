"""
Core Notification Providers — mock notification data for all domains.

Uses generic icon/color keys that are mapped to framework-specific
values (Lucide icons, Tailwind classes) in the app layer.

Grid IDs use string constants matching the app's GridId enum values.
"""

from pmt_core.services.notifications.notification_constants import NotificationCategory


# === PnL Notifications ===
def get_pnl_notifications() -> list[dict]:
    """Mock PnL notifications for P&L threshold alerts."""
    return [
        {
            "id": "pnl-001",
            "category": NotificationCategory.ALERTS,
            "title": "PnL Alert",
            "message": "AAPL daily PnL exceeded threshold",
            "time_ago": "10 mins ago",
            "is_read": False,
            "icon": "dollar-sign",
            "color": "text-yellow-500",
            "module": "PnL",
            "subtab": "PnL Change",
            "row_id": "AAPL",
            "grid_id": "pnl_change_grid",
            "ticker": "AAPL",
        },
    ]


# === Position Notifications ===
def get_position_notifications() -> list[dict]:
    """Mock position-related notifications."""
    return [
        {
            "id": "pos-001",
            "category": NotificationCategory.PORTFOLIO,
            "title": "Position Update",
            "message": "TKR0 position size updated after partial fill",
            "time_ago": "45 mins ago",
            "is_read": False,
            "icon": "layers",
            "color": "text-purple-500",
            "module": "Positions",
            "subtab": "Positions",
            "row_id": "TKR0",
            "grid_id": "positions_grid",
            "ticker": "TKR0",
        },
        {
            "id": "pos-002",
            "category": NotificationCategory.PORTFOLIO,
            "title": "New Position",
            "message": "TKR5 added to portfolio",
            "time_ago": "2 hours ago",
            "is_read": True,
            "icon": "plus-circle",
            "color": "text-teal-500",
            "module": "Positions",
            "subtab": "Positions",
            "row_id": "TKR5",
            "grid_id": "positions_grid",
            "ticker": "TKR5",
        },
    ]


# === Risk Notifications ===
def get_risk_notifications() -> list[dict]:
    """Mock risk notifications for delta/gamma exposure alerts."""
    return [
        {
            "id": "risk-001",
            "category": NotificationCategory.ALERTS,
            "title": "Risk Alert",
            "message": "Portfolio delta exposure has increased by 15%",
            "time_ago": "5 hours ago",
            "is_read": True,
            "icon": "alert-triangle",
            "color": "text-red-500",
            "module": "Risk",
            "subtab": "Delta Change",
            "row_id": "TSLA",
            "grid_id": "delta_change_grid",
            "ticker": "TSLA",
        },
    ]


# === Market Data Notifications ===
def get_market_data_notifications() -> list[dict]:
    """Mock market data notifications for price alerts, trade executions, etc."""
    return [
        {
            "id": "mkt-001",
            "category": NotificationCategory.ALERTS,
            "title": "Price Alert Triggered",
            "message": "TSLA has crossed above $200.00",
            "time_ago": "2 mins ago",
            "is_read": False,
            "icon": "bell",
            "color": "text-amber-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "TSLA",
            "grid_id": "market_data_grid",
            "ticker": "TSLA",
        },
        {
            "id": "mkt-002",
            "category": NotificationCategory.PORTFOLIO,
            "title": "Trade Executed",
            "message": "Your order to buy 100 shares of AAPL has been filled at $189.50",
            "time_ago": "1 hour ago",
            "is_read": False,
            "icon": "wallet",
            "color": "text-emerald-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "AAPL",
            "grid_id": "market_data_grid",
            "ticker": "AAPL",
        },
        {
            "id": "mkt-003",
            "category": NotificationCategory.NEWS,
            "title": "Market Update",
            "message": "S&P 500 reaches new all-time high amid strong earnings reports",
            "time_ago": "3 hours ago",
            "is_read": True,
            "icon": "newspaper",
            "color": "text-blue-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "MSFT",
            "grid_id": "market_data_grid",
            "ticker": "MSFT",
        },
        {
            "id": "mkt-004",
            "category": NotificationCategory.ALERTS,
            "title": "Volume Spike",
            "message": "NVDA trading volume 3x average",
            "time_ago": "15 mins ago",
            "is_read": False,
            "icon": "trending-up",
            "color": "text-orange-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "NVDA",
            "grid_id": "market_data_grid",
            "ticker": "NVDA",
        },
        {
            "id": "mkt-005",
            "category": NotificationCategory.ALERTS,
            "title": "52-Week High",
            "message": "GOOGL hit new 52-week high at $142.50",
            "time_ago": "30 mins ago",
            "is_read": False,
            "icon": "arrow-up-circle",
            "color": "text-green-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "GOOGL",
            "grid_id": "market_data_grid",
            "ticker": "GOOGL",
        },
    ]


# === FX Notifications ===
def get_fx_notifications() -> list[dict]:
    """Mock FX notifications for currency rate alerts."""
    return [
        {
            "id": "fx-001",
            "category": NotificationCategory.NEWS,
            "title": "FX Update",
            "message": "USD/JPY crossed 150 level",
            "time_ago": "20 mins ago",
            "is_read": False,
            "icon": "globe",
            "color": "text-indigo-500",
            "module": "Market Data",
            "subtab": "FX Data",
            "row_id": "USDJPY",
            "grid_id": "fx_data_grid",
            "ticker": "USD/JPY",
        },
    ]


# === System Notifications ===
def get_system_notifications() -> list[dict]:
    """Mock system notifications for maintenance, API status, etc."""
    return [
        {
            "id": "sys-001",
            "category": NotificationCategory.SYSTEM,
            "title": "System Maintenance",
            "message": "Scheduled maintenance tonight from 10pm-12am EST",
            "time_ago": "1 day ago",
            "is_read": True,
            "icon": "settings",
            "color": "text-gray-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "GOOGL",
            "grid_id": "market_data_grid",
            "ticker": "SYSTEM",
        },
        {
            "id": "sys-002",
            "category": NotificationCategory.SYSTEM,
            "title": "API Connected",
            "message": "Bloomberg API connection restored",
            "time_ago": "6 hours ago",
            "is_read": True,
            "icon": "check-circle",
            "color": "text-green-500",
            "module": "Market Data",
            "subtab": "Market Data",
            "row_id": "AMZN",
            "grid_id": "market_data_grid",
            "ticker": "API",
        },
    ]
