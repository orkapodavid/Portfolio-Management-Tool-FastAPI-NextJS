from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from pmt_core.services.notifications import (
    NotificationRegistry,
    NotificationService,
)
from pmt_core.services.notifications.notification_providers import (
    get_fx_notifications,
    get_market_data_notifications,
    get_pnl_notifications,
    get_position_notifications,
    get_risk_notifications,
    get_system_notifications,
)


# Register core notification providers at module import so the registry is
# populated for any request handler that hits the service.
NotificationRegistry.register("pnl", get_pnl_notifications)
NotificationRegistry.register("positions", get_position_notifications)
NotificationRegistry.register("risk", get_risk_notifications)
NotificationRegistry.register("market_data", get_market_data_notifications)
NotificationRegistry.register("fx", get_fx_notifications)
NotificationRegistry.register("system", get_system_notifications)


router = APIRouter(tags=["notifications"])

notification_service = NotificationService()


@router.get("/")
async def get_notifications(
    category: Optional[str] = Query(
        None,
        description="Filter by category: Alerts, Portfolio, News, System",
    ),
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: Optional[int] = Query(None, ge=1, le=200),
    user: User = Depends(current_active_user),
):
    return await notification_service.get_notifications(
        category=category, unread_only=unread_only, limit=limit
    )
