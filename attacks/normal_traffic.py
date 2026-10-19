"""
Generates normal payment traffic to train the Isolation Forest.
Run continuously from PC Attaquant (or locally) during training phase.
"""
import time
import random
import requests
import os

TARGET = os.getenv("TARGET_URL", "http://localhost/payments")

print(f"[normal_traffic] Sending traffic to {TARGET}  (Ctrl+C to stop)")
while True:
    try:
        requests.post(TARGET, json={
            "amount": round(random.uniform(5, 500), 2),
            "currency": "EUR",
            "user_id": 1,
        }, timeout=5)
    except Exception as e:
        print(f"[normal_traffic] warn: {e}")
    time.sleep(random.uniform(0.5, 2.0))
