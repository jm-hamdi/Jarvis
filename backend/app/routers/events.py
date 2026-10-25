import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as aioredis
from app.core.config import settings

router = APIRouter()
_clients: list[WebSocket] = []


async def redis_consumer():
    """Consume jarvis:events stream and broadcast to all WS clients."""
    r = aioredis.from_url(settings.redis_url)
    last_id = "$"
    while True:
        try:
            entries = await r.xread({"jarvis:events": last_id}, block=500, count=10)
            for _, messages in entries:
                for msg_id, fields in messages:
                    last_id = msg_id
                    data = fields.get(b"data", b"{}").decode()
                    dead = []
                    for ws in _clients:
                        try:
                            await ws.send_text(data)
                        except Exception:
                            dead.append(ws)
                    for ws in dead:
                        _clients.remove(ws)
        except Exception:
            await asyncio.sleep(1)


@router.websocket("/events")
async def ws_events(websocket: WebSocket):
    await websocket.accept()
    _clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        if websocket in _clients:
            _clients.remove(websocket)
