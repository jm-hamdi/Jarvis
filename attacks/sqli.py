"""
SQL Injection probes against payment API (should be blocked by WAF).
"""
import requests
import os

TARGET = os.getenv("TARGET_URL", "http://localhost/payments")
PAYLOADS = [
    "1' OR '1'='1",
    "1; DROP TABLE payments;--",
    "' UNION SELECT * FROM users--",
    "1' AND SLEEP(5)--",
]

print(f"[sqli] Probing {TARGET}")
for p in PAYLOADS:
    try:
        r = requests.post(TARGET, json={"amount": p, "currency": "EUR", "user_id": 1}, timeout=5)
        print(f"  {r.status_code} — {p[:40]}")
    except Exception as e:
        print(f"  error: {e}")
