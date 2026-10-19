from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from uuid import uuid4, UUID
from datetime import datetime, timezone
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time

app = FastAPI(title="Payment API")

REQUEST_COUNT  = Counter("payment_requests_total", "Total payment requests", ["status"])
REQUEST_LATENCY = Histogram("payment_latency_seconds", "Payment request latency")

# In-memory store (replace with Postgres via asyncpg)
PAYMENTS: dict[str, dict] = {}


class PaymentIn(BaseModel):
    amount: float
    currency: str = "EUR"
    user_id: int = 1


@app.post("/payments", status_code=201)
async def create_payment(payload: PaymentIn):
    t0 = time.time()
    tx_id = str(uuid4())
    PAYMENTS[tx_id] = {
        "id": tx_id,
        "amount": payload.amount,
        "currency": payload.currency,
        "status": "completed",
        "user_id": payload.user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    REQUEST_LATENCY.observe(time.time() - t0)
    REQUEST_COUNT.labels(status="201").inc()
    return PAYMENTS[tx_id]


@app.get("/payments/{tx_id}")
async def get_payment(tx_id: str):
    p = PAYMENTS.get(tx_id)
    if not p:
        REQUEST_COUNT.labels(status="404").inc()
        raise HTTPException(status_code=404, detail="Not found")
    return p


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/health")
async def health():
    return {"status": "ok"}
