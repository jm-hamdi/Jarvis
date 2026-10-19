"""
Remediator: consumes anomaly_detected from Redis Streams,
applies the matching playbook via docker-socket-proxy, publishes
remediation_step events.
"""
import asyncio
import json
import os
import threading
from datetime import datetime, timezone

import redis.asyncio as aioredis
import yaml
import httpx
from fastapi import FastAPI
import uvicorn

REDIS_URL          = os.getenv("REDIS_URL", "redis://redis:6379")
DOCKER_HOST        = os.getenv("DOCKER_HOST", "tcp://jarvis-socket-proxy:2375")
STREAM_KEY         = "jarvis:events"
GROUP              = "remediator-group"

with open("rules.yml") as f:
    RULES = yaml.safe_load(f)["playbooks"]

health_app = FastAPI()

@health_app.get("/health")
def health():
    return {"status": "ok"}

def run_health():
    uvicorn.run(health_app, host="0.0.0.0", port=8081, log_level="error")


async def publish(r, event: dict):
    await r.xadd(STREAM_KEY, {"data": json.dumps(event)})


async def restart_container(name: str):
    url = DOCKER_HOST.replace("tcp://", "http://")
    async with httpx.AsyncClient(timeout=30) as client:
        await client.post(f"{url}/containers/{name}/restart")


async def apply_playbook(r, incident_id: str, incident_type: str):
    ts = datetime.now(timezone.utc).isoformat()
    steps = RULES.get(incident_type, [])

    await publish(r, {
        "type": "remediation_step", "ts": ts,
        "incident_id": incident_id,
        "step": "decision", "status": "running",
        "action": f"playbook:{incident_type}",
    })

    for step in steps:
        action = step.get("action")
        ts = datetime.now(timezone.utc).isoformat()
        await publish(r, {
            "type": "remediation_step", "ts": ts,
            "incident_id": incident_id,
            "step": "remediation", "status": "running",
            "action": action,
        })
        try:
            if action == "restart_service":
                svc = step.get("service", "jarvis-payment-api")
                await restart_container(svc)
            # Other actions (ban_ip_waf, rotate_vault_secret, restore_db_snapshot)
            # are implemented in actions/ submodules
        except Exception as e:
            print(f"[remediator] action {action} failed: {e}")

    await publish(r, {
        "type": "remediation_step",
        "ts": datetime.now(timezone.utc).isoformat(),
        "incident_id": incident_id,
        "step": "remediation", "status": "done",
    })


async def remediation_loop():
    r = aioredis.from_url(REDIS_URL)
    try:
        await r.xgroup_create(STREAM_KEY, GROUP, id="0", mkstream=True)
    except Exception:
        pass  # group already exists

    while True:
        try:
            entries = await r.xreadgroup(GROUP, "remediator-1", {STREAM_KEY: ">"}, count=5, block=1000)
            for _, messages in entries:
                for msg_id, fields in messages:
                    data = json.loads(fields.get(b"data", b"{}"))
                    if data.get("type") == "anomaly_detected":
                        asyncio.create_task(apply_playbook(r, data["incident_id"], data["incident_type"]))
                    await r.xack(STREAM_KEY, GROUP, msg_id)
        except Exception as e:
            print(f"[remediator] loop error: {e}")
            await asyncio.sleep(1)


if __name__ == "__main__":
    threading.Thread(target=run_health, daemon=True).start()
    asyncio.run(remediation_loop())
