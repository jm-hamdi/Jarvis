import asyncio
from contextlib import asynccontextmanager

import httpx
import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import Settings
from app.routers import events, status, jarvis
from app.routers.events import redis_consumer
from app.routers import workshop, operations, operator_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = Settings()
    redis_client = aioredis.from_url(config.redis_url)
    async with httpx.AsyncClient(timeout=30) as client:
        app.state.settings = config
        app.state.redis = redis_client
        app.state.client = client
        task = asyncio.create_task(redis_consumer())
        yield
        task.cancel()
    await redis_client.aclose()


app = FastAPI(title="JARVIS Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(operator_session.router)
app.include_router(events.router)
app.include_router(status.router)
app.include_router(jarvis.router)
app.include_router(operations.router)
app.include_router(workshop.router)
