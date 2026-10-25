"""Read-only HTTP service probes with bounded real measurements history.
No Docker socket, shell command, arbitrary target URLs or remediation rights.
"""
import asyncio
import json
import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, Request

from app.core.security import operator
from app.services.store import RECENT

router = APIRouter(prefix="/ops", dependencies=[Depends(operator)])

TARGETS = (
    ("auth-service",  "Authentification",  "http://auth-service:8001/health"),
    ("payment-api",   "API paiement",       "http://payment-api:8000/health"),
    ("pay-front",     "PayLab Front",       "http://pay-front:3000/health"),
    ("waf",           "WAF Nginx",          "http://waf/health"),
)
HISTORY_PREFIX = "jarvis:ops:minute:"
HISTORY_TTL = 7200


async def probe(client: httpx.AsyncClient, name: str, label: str, url: str) -> dict:
    started = time.monotonic()
    try:
        response = await client.get(url, timeout=2.5, follow_redirects=False)
        code = response.status_code
        return {
            "name": name, "label": label,
            "state": "reachable" if code == 200 else "degraded", "status_code": code,
            "latency_ms": round((time.monotonic() - started) * 1000),
            "evidence": "Sonde /health interne" if code == 200 else "Réponse non-200 à /health",
        }
    except (httpx.RequestError, TimeoutError):
        return {
            "name": name, "label": label, "state": "unreachable",
            "status_code": None, "latency_ms": None,
            "evidence": "Sonde HTTP interne non concluante (réseau, port ou service)",
        }


async def _overview(request: Request) -> dict:
    client = request.app.state.client
    checks = list(await asyncio.gather(*(probe(client, *t) for t in TARGETS)))
    front = next(x for x in checks if x["name"] == "pay-front")
    if front["state"] != "reachable":
        waf_route = await probe(client, "pay-front-via-waf", "PayLab via WAF", "http://waf/")
        if waf_route["status_code"] == 200:
            front["state"] = "degraded"
            front["evidence"] = "Page accessible via WAF ; /health direct pay-front:3000 non validé"
            front["latency_ms"] = waf_route["latency_ms"]
    redis = request.app.state.redis
    redis_ok = False
    recent: list = []
    try:
        redis_ok = bool(await redis.ping())
        rows = await redis.lrange(RECENT, 0, 199)
        recent = [json.loads(row) for row in rows]
    except Exception:
        pass
    checks.append({
        "name": "redis", "label": "Redis / alertes",
        "state": "reachable" if redis_ok else "unreachable",
        "status_code": None, "latency_ms": None,
        "evidence": "PING Redis" if redis_ok else "PING Redis indisponible",
    })
    latest = recent[0] if recent else None
    counts = {
        "total_sample": len(recent),
        "critical": sum(1 for e in recent if int(e.get("level") or 0) >= 12),
        "high": sum(1 for e in recent if 9 <= int(e.get("level") or 0) < 12),
        "last_event_at": latest.get("timestamp") if latest else None,
        "last_rule_id": latest.get("rule_id") if latest else None,
    }
    now = datetime.now(timezone.utc)
    observed = [x for x in checks if x["name"] != "redis"]
    snapshot = {
        "sampled_at": now.isoformat(),
        "ok": sum(x["state"] == "reachable" for x in observed),
        "total": len(observed),
        "degraded": sum(x["state"] == "degraded" for x in observed),
    }
    if redis_ok:
        try:
            await redis.set(
                HISTORY_PREFIX + str(int(now.timestamp()) // 60),
                json.dumps(snapshot, separators=(",", ":")),
                ex=HISTORY_TTL,
            )
        except Exception:
            pass
    return {
        "source": "live_http_probes", "sampled_at": now.isoformat(),
        "services": checks, "alerts": counts,
        "not_monitored": ["postgres", "wazuh-agent", "wazuh-manager", "cpu", "ram", "disk", "transactions"],
        "notes": "Mesures HTTP par chemin seulement ; ni santé globale, ni CPU/RAM, ni remédiation.",
    }


@router.get("/overview")
async def overview_endpoint(request: Request) -> dict:
    return await _overview(request)


@router.get("/history")
async def history(request: Request) -> dict:
    now_minute = int(time.time()) // 60
    minutes = range(now_minute - 59, now_minute + 1)
    try:
        rows = await request.app.state.redis.mget([HISTORY_PREFIX + str(m) for m in minutes])
    except Exception:
        return {"source": "unavailable", "items": [], "window_minutes": 60}
    items = []
    for raw in rows:
        if not raw:
            continue
        try:
            point = json.loads(raw)
            if 0 <= point["ok"] <= point["total"] <= 10 and 0 <= point["degraded"] <= point["total"]:
                items.append(point)
        except (ValueError, TypeError, KeyError):
            continue
    return {"source": "observed_http_probes", "items": items, "window_minutes": 60}
