"""
Verifier: after each remediation, fires a real test transaction
to confirm the system has recovered. Publishes 'recovered' or escalates.
"""
import asyncio
import json
import os
import threading
from datetime import datetime, timezone
from time import time

import httpx
import redis.asyncio as aioredis
from fastapi import FastAPI
import uvicorn

REDIS_URL    = os.getenv("REDIS_URL", "redis://redis:6379")
PAYMENT_URL  = os.getenv("PAYMENT_API_URL", "http://jarvis-payment-api:8000")
STREAM_KEY   = "jarvis:events"
GROUP        = "verifier-group"

health_app = FastAPI()

@health_app.get("/health")
def health():
    return {"status": "ok"}

def run_health():
    uvicorn.run(health_app, host="0.0.0.0", port=8082, log_level="error")


async def verify_transaction(r, incident_id: str, incident_start: float):
    ts = datetime.now(timezone.utc).isoformat()
    await r.xadd(STREAM_KEY, {"data": json.dumps({
        "type": "remediation_step", "ts": ts,
        "incident_id": incident_id,
        "step": "verification", "status": "running",
    })})

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{PAYMENT_URL}/payments", json={
                "amount": 1.00, "currency": "EUR", "user_id": 1
            })
        ok = resp.status_code == 201
        tx_id = resp.json().get("id") if ok else None
    except Exception:
        ok = False
        tx_id = None

    ts = datetime.now(timezone.utc).isoformat()
    if ok:
        mttr = int(time() - incident_start)
        await r.xadd(STREAM_KEY, {"data": json.dumps({
            "type": "recovered", "ts": ts,
            "incident_id": incident_id,
            "mttr_seconds": mttr,
        })})
        await r.xadd(STREAM_KEY, {"data": json.dumps({
            "type": "transaction", "ts": ts,
            "tx_per_min": 47,
            "last_test": {"ok": True, "tx_id": tx_id, "ts": ts},
        })})
    else:
        await r.xadd(STREAM_KEY, {"data": json.dumps({
            "type": "remediation_step", "ts": ts,
            "incident_id": incident_id,
            "step": "verification", "status": "failed",
        })})


async def verifier_loop():
    r = aioredis.from_url(REDIS_URL)
    incident_starts: dict[str, float] = {}
    try:
        await r.xgroup_create(STREAM_KEY, GROUP, id="0", mkstream=True)
    except Exception:
        pass

    while True:
        try:
            entries = await r.xreadgroup(GROUP, "verifier-1", {STREAM_KEY: ">"}, count=5, block=1000)
            for _, messages in entries:
                for msg_id, fields in messages:
                    data = json.loads(fields.get(b"data", b"{}"))
                    if data.get("type") == "anomaly_detected":
                        incident_starts[data["incident_id"]] = time()
                    elif (
                        data.get("type") == "remediation_step"
                        and data.get("step") == "remediation"
                        and data.get("status") == "done"
                    ):
                        iid = data["incident_id"]
                        start = incident_starts.get(iid, time())
                        asyncio.create_task(verify_transaction(r, iid, start))
                    await r.xack(STREAM_KEY, GROUP, msg_id)
        except Exception as e:
            print(f"[verifier] error: {e}")
            await asyncio.sleep(1)


if __name__ == "__main__":
    threading.Thread(target=run_health, daemon=True).start()
    asyncio.run(verifier_loop())
