import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import events, status, jarvis
from app.routers.events import redis_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(redis_consumer())
    yield
    task.cancel()


app = FastAPI(title="JARVIS Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(status.router)
app.include_router(jarvis.router)
