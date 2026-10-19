"""
Detection loop: reads metrics every 5s, scores with Isolation Forest,
publishes anomaly_score and anomaly_detected events to Redis Streams.
"""
import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import joblib
import numpy as np
import redis.asyncio as aioredis
from fastapi import FastAPI
import uvicorn
import threading

from features import extract_features

REDIS_URL   = os.getenv("REDIS_URL", "redis://redis:6379")
MODEL_PATH  = Path("model/isolation_forest.joblib")
THRESHOLD   = float(os.getenv("ANOMALY_THRESHOLD", "0.75"))
STREAM_KEY  = "jarvis:events"

# ── Health endpoint ──────────────────────────────────────────────────────────
health_app = FastAPI()

@health_app.get("/health")
def health():
    return {"status": "ok"}

def run_health():
    uvicorn.run(health_app, host="0.0.0.0", port=8080, log_level="error")

# ── Detection loop ───────────────────────────────────────────────────────────
async def detection_loop():
    r = aioredis.from_url(REDIS_URL)
    model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None

    while True:
        try:
            X = await extract_features()
            score = 0.0
            if model is not None:
                raw = model.decision_function(X)[0]
                # normalise to [0,1]: higher = more anomalous
                score = float(np.clip(1 - (raw + 0.5), 0, 1))

            ts = datetime.now(timezone.utc).isoformat()

            await r.xadd(STREAM_KEY, {"data": json.dumps({
                "type": "anomaly_score",
                "ts": ts,
                "score": round(score, 4),
                "threshold": THRESHOLD,
            })})

            if score >= THRESHOLD:
                incident_id = str(uuid4())
                await r.xadd(STREAM_KEY, {"data": json.dumps({
                    "type": "anomaly_detected",
                    "ts": ts,
                    "incident_id": incident_id,
                    "incident_type": "flood",
                    "score": round(score, 4),
                })})

        except Exception as e:
            print(f"[detector] error: {e}")

        await asyncio.sleep(5)


if __name__ == "__main__":
    threading.Thread(target=run_health, daemon=True).start()
    asyncio.run(detection_loop())
