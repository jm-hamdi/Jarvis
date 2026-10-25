"""Read-only ML worker: Wazuh Redis observations + bounded service health checks.
Does not execute any remediation. Stores latest score and synthetic-data evaluation.
Run on the host (outside Docker) or as a sidecar — stdlib HTTP server only.
"""
import asyncio
from datetime import datetime, timezone, timedelta
import json
import os
from pathlib import Path
from threading import Thread
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import urlopen
from urllib.error import URLError

import redis.asyncio as redis
from model import train_model, prediction, features, report

KEY = "jarvis:workshop:ml:latest"
RECENT = "jarvis:wazuh:recent"
CHECKS = ("http://auth-service:8001/health", "http://payment-api:8000/health")
WINDOWS_KEY = "jarvis:workshop:ml:window_samples"
METRICS = {"sample_time": 0, "anomaly": 0, "score": 0, "events": 0, "service_down": 0}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = b"OK\n"; kind = "text/plain"
        elif self.path == "/metrics":
            body = ("\n".join(f"jarvis_ml_{k} {float(v)}" for k, v in METRICS.items()) + "\n").encode()
            kind = "text/plain; version=0.0.4"
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def monitor():
    ThreadingHTTPServer(("0.0.0.0", 8110), Handler).serve_forever()


def healthy(url):
    try:
        with urlopen(url, timeout=2) as response:
            return response.status == 200
    except (URLError, TimeoutError, OSError):
        return False


def in_window(event, now):
    try:
        stamp = datetime.fromisoformat(event["timestamp"].replace("Z", "+00:00"))
        return now - timedelta(seconds=60) <= stamp.astimezone(timezone.utc) <= now + timedelta(seconds=5)
    except (ValueError, TypeError, KeyError):
        return False


async def run():
    Thread(target=monitor, daemon=True).start()
    dataset = Path("/baseline/normal.jsonl")
    samples = None
    if dataset.is_file():
        try:
            source = [json.loads(row) for row in dataset.read_text(encoding="utf8").splitlines() if row.strip()]
            candidates = [
                r["features"] for r in source
                if r.get("label") == "normal" and isinstance(r.get("features"), list)
                and len(r["features"]) == 8 and all(isinstance(v, int) and 0 <= v <= 1000 for v in r["features"])
            ]
            if len(candidates) >= 100:
                samples = candidates
            else:
                print("Insufficient approved real baseline (need 100); simulator fallback", flush=True)
        except (OSError, ValueError, TypeError, KeyError):
            print("Invalid real baseline; simulator fallback", flush=True)
    model, threshold = train_model(samples)
    training_source = "approved_real_normal_windows" if samples is not None else "simulated_baseline"
    evaluation = report(model, threshold)
    client = redis.from_url(os.environ.get("REDIS_URL", "redis://redis:6379"))
    last_signature = None
    while True:
        try:
            now = datetime.now(timezone.utc)
            records = [json.loads(x) for x in await client.lrange(RECENT, 0, 199)]
            alerts = [a for a in records if in_window(a, now)]
            service_states = await asyncio.gather(*(asyncio.to_thread(healthy, url) for url in CHECKS))
            n_down = sum(not s for s in service_states)
            result = prediction(model, threshold, features(alerts, n_down))
            result.update({
                "time": now.isoformat(), "model": "IsolationForest", "training_source": training_source,
                "observations_source": "real_wazuh_and_http", "event_count": len(alerts),
                "affected_services": [name for name, good in zip(("auth-service", "payment-api"), service_states) if not good],
                "rule_ids": sorted({str(a.get("rule_id")) for a in alerts}),
                "evaluation_simulated": evaluation,
                "eligible_for_recovery": bool(result["anomaly"] and len(alerts) >= 3 and n_down > 0),
            })
            await client.set(KEY, json.dumps(result, separators=(",", ":")), ex=30)
            # One sanitized window per minute for explicit user-approved later training.
            minute = int(now.timestamp()) // 60
            sample_key = "jarvis:workshop:ml:minute:" + str(minute)
            if await client.set(sample_key, "1", nx=True, ex=172800):
                await client.lpush(WINDOWS_KEY, json.dumps({
                    "time": now.isoformat(), "features": features(alerts, n_down), "label": "unlabelled",
                }))
                await client.ltrim(WINDOWS_KEY, 0, 999)
            METRICS.update({
                "sample_time": int(now.timestamp()), "anomaly": int(result["anomaly"]),
                "score": result["score"], "events": len(alerts), "service_down": n_down,
            })
            signature = (result["anomaly"], result["eligible_for_recovery"], tuple(result["affected_services"]))
            if signature != last_signature:
                await client.xadd("jarvis:workshop:telemetry", {"data": json.dumps(
                    {k: result[k] for k in ("time", "model", "anomaly", "score", "event_count", "affected_services", "eligible_for_recovery")}
                )}, maxlen=1000, approximate=True)
                last_signature = signature
        except Exception as e:
            print("ML loop error:", type(e).__name__, flush=True)
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(run())
