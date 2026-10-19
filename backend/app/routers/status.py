from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

class ServiceStatus(BaseModel):
    name: str
    status: Literal["up", "down", "degraded"]
    latency_ms: int

@router.get("/status")
async def get_status() -> dict:
    return {
        "state": "OPTIMAL",
        "services": [
            {"name": "payment-api",  "status": "up", "latency_ms": 42},
            {"name": "auth-service", "status": "up", "latency_ms": 18},
            {"name": "db",           "status": "up", "latency_ms": 9},
            {"name": "waf",          "status": "up", "latency_ms": 3},
        ],
    }

@router.get("/incidents")
async def get_incidents() -> list:
    return []

@router.get("/health")
async def health():
    return {"status": "ok"}
