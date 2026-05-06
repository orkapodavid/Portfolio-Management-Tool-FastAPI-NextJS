"""WebSocket endpoint for real-time price streaming (Req 10)."""

import asyncio
import random

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..config import settings

router = APIRouter(prefix="/ws", tags=["websocket"])

SAMPLE_DATA = [
    {"id": "0", "symbol": "AAPL", "price": 175.50},
    {"id": "1", "symbol": "GOOGL", "price": 140.25},
    {"id": "2", "symbol": "MSFT", "price": 378.90},
    {"id": "3", "symbol": "JPM", "price": 195.00},
    {"id": "4", "symbol": "GS", "price": 385.75},
    {"id": "5", "symbol": "JNJ", "price": 155.30},
    {"id": "6", "symbol": "PFE", "price": 28.50},
    {"id": "7", "symbol": "XOM", "price": 105.20},
]


@router.websocket("/stream")
async def stream_prices(websocket: WebSocket):
    """Stream random price updates at configured interval."""
    await websocket.accept()
    prices = {d["id"]: d["price"] for d in SAMPLE_DATA}

    try:
        while True:
            row_id = random.choice(list(prices.keys()))
            old_price = prices[row_id]
            change = round(random.uniform(-5, 5), 2)
            new_price = max(0.01, round(old_price + change, 2))
            prices[row_id] = new_price

            update = {
                "id": row_id,
                "price": new_price,
                "change": change,
                "symbol": next(
                    d["symbol"] for d in SAMPLE_DATA if d["id"] == row_id
                ),
            }
            await websocket.send_json(update)
            await asyncio.sleep(settings.websocket_interval)
    except WebSocketDisconnect:
        pass
