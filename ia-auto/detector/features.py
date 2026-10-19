"""
Feature extraction from Prometheus metrics for anomaly detection.
"""
import httpx
import numpy as np
from typing import Optional

PROMETHEUS_URL = "http://jarvis-prometheus:9090"


async def fetch_metric(query: str) -> Optional[float]:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{PROMETHEUS_URL}/api/v1/query", params={"query": query})
            data = r.json()
            results = data.get("data", {}).get("result", [])
            if results:
                return float(results[0]["value"][1])
    except Exception:
        pass
    return None


async def extract_features() -> np.ndarray:
    """Return a 1-D feature vector: [latency_p99, error_rate, req_per_sec]."""
    latency = await fetch_metric('histogram_quantile(0.99, payment_latency_seconds_bucket)') or 0.0
    errors  = await fetch_metric('rate(payment_requests_total{status=~"5.."}[1m])') or 0.0
    rps     = await fetch_metric('rate(payment_requests_total[1m])') or 0.0
    return np.array([[latency, errors, rps]])
