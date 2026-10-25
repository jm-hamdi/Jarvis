"""Operator-gated workshop interface. Does not grant Docker or OS control to JARVIS."""
import hmac
import json
import os
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from app.core.security import operator

router = APIRouter(prefix="/workshop")
ML_KEY = "jarvis:workshop:ml:latest"
AUDIT_KEY = "jarvis:workshop:recovery:audits"


async def recovery_identity(x_recovery_token: str | None = Header(default=None)):
    expected = os.getenv("JARVIS_RECOVERY_TOKEN", "")
    if (len(expected) < 32 or not x_recovery_token
            or not hmac.compare_digest(expected.encode(), x_recovery_token.encode())):
        raise HTTPException(401, "Agent token required")


@router.get("/recovery/signal", dependencies=[Depends(recovery_identity)])
async def recovery_signal(request: Request):
    """Machine credential: returns only the ML decision fields, no dashboard or AI access."""
    raw = await request.app.state.redis.get(ML_KEY)
    if not raw:
        return {"status": "not_deployed"}
    item = json.loads(raw)
    fields = ("time", "eligible_for_recovery", "anomaly", "event_count", "affected_services")
    return {"status": "observed", **{k: item[k] for k in fields if k in item}}


class Question(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=5, max_length=1000)


class Audit(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: Literal["considered", "restarted", "verified", "failed", "skipped"]
    service: Literal["jarvis-auth-service", "jarvis-waf"]
    reason: str = Field(min_length=2, max_length=250)
    payment_http: int | None = Field(default=None, ge=100, le=599)
    event_time: datetime


@router.get("/ml/latest", dependencies=[Depends(operator)])
async def latest(request: Request):
    raw = await request.app.state.redis.get(ML_KEY)
    if not raw:
        return {"status": "not_deployed", "message": "Worker ML sans observations récentes"}
    return {"status": "observed", **json.loads(raw)}


@router.get("/ml/windows", dependencies=[Depends(operator)])
async def ml_windows(request: Request):
    rows = await request.app.state.redis.lrange("jarvis:workshop:ml:window_samples", 0, 999)
    return {
        "items": [json.loads(row) for row in rows],
        "source": "measured_unlabelled_windows",
        "warning": "Do not train on attack/outage periods; user must explicitly approve labels.",
    }


@router.post("/rag/ask", dependencies=[Depends(operator)])
async def rag(body: Question, request: Request):
    try:
        response = await request.app.state.client.post(
            "http://rag:8120/ask", json=body.model_dump(), timeout=98
        )
        response.raise_for_status()
    except Exception:
        raise HTTPException(503, "RAG local indisponible ; vérifier le conteneur rag et Ollama") from None
    return response.json()


@router.get("/recovery/recent", dependencies=[Depends(operator)])
async def recovery_recent(request: Request):
    rows = await request.app.state.redis.lrange(AUDIT_KEY, 0, 29)
    return {"items": [json.loads(r) for r in rows], "source": "windows_agent_audits"}


@router.post("/recovery/audit", dependencies=[Depends(recovery_identity)])
async def recovery_audit(
    body: Audit,
    request: Request,
    x_recovery_token: str | None = Header(default=None),
):
    if abs((datetime.now(timezone.utc) - body.event_time.astimezone(timezone.utc)).total_seconds()) > 180:
        raise HTTPException(422, "Stale audit event")
    await request.app.state.redis.lpush(AUDIT_KEY, json.dumps(body.model_dump(mode="json")))
    await request.app.state.redis.ltrim(AUDIT_KEY, 0, 199)
    return {"ok": True}
