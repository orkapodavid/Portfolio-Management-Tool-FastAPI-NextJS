"""Background task endpoints (Req 14).

Note: Demo 14 uses a client-side interval to demonstrate the UI pattern.
These endpoints are available for external consumers or polling-based
integrations (start/stop/get-updates).
"""

import asyncio
import random
import time

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/background", tags=["background"])

SYMBOLS = ["AAPL", "GOOGL", "MSFT", "JPM", "GS", "JNJ", "PFE", "XOM"]

_prices: dict[str, float] = {
    "AAPL": 175.50,
    "GOOGL": 140.25,
    "MSFT": 378.90,
    "JPM": 195.00,
    "GS": 385.75,
    "JNJ": 155.30,
    "PFE": 28.50,
    "XOM": 105.20,
}

_task_state: dict = {
    "is_running": False,
    "updates": [],
    "task": None,
}


class TaskStatus(BaseModel):
    is_running: bool
    update_count: int


async def _background_loop():
    """Background loop that produces price updates while running."""
    while _task_state["is_running"]:
        symbol = random.choice(SYMBOLS)
        old_price = _prices[symbol]
        delta = round(random.uniform(-5, 5), 2)
        new_price = max(0.01, round(old_price + delta, 2))
        _prices[symbol] = new_price

        _task_state["updates"].append(
            {
                "symbol": symbol,
                "price": new_price,
                "change": delta,
                "timestamp": time.time(),
            }
        )

        # Keep update queue bounded
        if len(_task_state["updates"]) > 100:
            _task_state["updates"] = _task_state["updates"][-100:]

        await asyncio.sleep(2.0)


@router.get("/status")
async def task_status() -> TaskStatus:
    return TaskStatus(
        is_running=_task_state["is_running"],
        update_count=len(_task_state["updates"]),
    )


@router.post("/start")
async def start_task():
    if _task_state["is_running"]:
        return {"status": "already_running"}
    _task_state["is_running"] = True
    _task_state["updates"] = []
    _task_state["task"] = asyncio.create_task(_background_loop())
    return {"status": "started"}


@router.post("/stop")
async def stop_task():
    _task_state["is_running"] = False
    task = _task_state.get("task")
    if task and not task.done():
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    _task_state["task"] = None
    total = len(_task_state["updates"])
    return {"status": "stopped", "total_updates": total}


@router.get("/updates")
async def get_updates():
    """Get pending updates and clear the queue."""
    updates = list(_task_state["updates"])
    _task_state["updates"] = []
    return updates
