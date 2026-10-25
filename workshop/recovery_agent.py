"""Windows-only, safe lab recovery agent. Run BEFORE demonstration, not during it.
The LLM never controls this agent. No docker.sock is mounted in any app container.
Default mode DRY-RUN. --execute enables a strict, auditable allowlist of two services.
"""
import argparse
import json
from pathlib import Path
import secrets
import subprocess
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:5173/api/workshop"
WAF = "http://192.168.43.1"
LOG = ROOT / "workshop" / "recovery-audit.jsonl"
COOLDOWN = 180


def envvars():
    values = {}
    env_file = ROOT / ".env"
    if not env_file.is_file():
        return values
    for line in env_file.read_text(encoding="utf-8-sig").splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        values[k.strip()] = v.strip().strip('"')
    return values


def request(url, method="GET", data=None, headers=None, timeout=8):
    body = json.dumps(data).encode("utf8") if data is not None else None
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json", **(headers or {})},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read(100_000)
            try:
                parsed = json.loads(raw or b"{}")
            except ValueError:
                parsed = {}
            return res.status, parsed
    except urllib.error.HTTPError as ex:
        return ex.code, {}
    except (urllib.error.URLError, TimeoutError, OSError):
        return 0, {}


def docker_status(name):
    if name not in ("jarvis-auth-service", "jarvis-waf"):
        raise ValueError("Container not allowlisted")
    result = subprocess.run(
        ["docker", "inspect", "--format", "{{json .State}}", name],
        capture_output=True, text=True, timeout=12,
    )
    if result.returncode:
        return {"Status": "not_found"}
    return json.loads(result.stdout)


def log_audit(env, state, service, reason, payment_http=None):
    payload = {
        "event_time": datetime.now(timezone.utc).isoformat(),
        "state": state, "service": service,
        "reason": str(reason)[:250], "payment_http": payment_http,
    }
    LOG.parent.mkdir(exist_ok=True)
    with LOG.open("a", encoding="utf8") as file:
        file.write(json.dumps(payload, ensure_ascii=False) + "\n")
    print(payload["event_time"], service, state, reason, "payment=", payment_http, flush=True)
    token = env.get("JARVIS_RECOVERY_TOKEN", "")
    if len(token) >= 32:
        request(BASE + "/recovery/audit", method="POST", data=payload,
                headers={"X-Recovery-Token": token}, timeout=3)


def await_service(url, attempts=16, delay=3):
    for _ in range(attempts):
        status, _ = request(url, timeout=3)
        if status == 200:
            return True
        time.sleep(delay)
    return False


def await_auth_route(attempts=20):
    """Unauthenticated auth/me must respond 401 AFTER the app/DB is ready."""
    for _ in range(attempts):
        status, _ = request(WAF + "/auth/me", timeout=3)
        if status == 401:
            return True
        time.sleep(2)
    return False


def proof_payment():
    """New account and fresh HTTP 201 test; random password/token only in process memory."""
    username = "recover_" + secrets.token_hex(7)
    password = secrets.token_urlsafe(32)
    code, session = request(WAF + "/auth/register", "POST",
                            {"username": username, "password": password})
    if code != 201 or not session.get("access_token"):
        return {"status": code, "detail": "register failed"}
    code, transaction = request(
        WAF + "/payments", "POST",
        {"amount": "1.00", "currency": "EUR",
         "card_number": "4242424242424242", "expiry": "12/30", "cvv": "123"},
        {"Authorization": "Bearer " + session["access_token"]},
    )
    return {"status": code, "transaction_id": transaction.get("id") if code == 201 else None}


def run(execute, once=False):
    env = envvars()
    recovery_token = env.get("JARVIS_RECOVERY_TOKEN", "")
    if len(recovery_token) < 32:
        raise SystemExit("Private recovery token missing (JARVIS_RECOVERY_TOKEN must be ≥32 chars in .env)")
    print("RECOVERY AGENT:", "EXECUTE authorized lab-only" if execute else "DRY RUN (no restarts)", flush=True)
    last_action = 0
    while True:
        code, signal = request(BASE + "/recovery/signal",
                               headers={"X-Recovery-Token": recovery_token})
        age = 9999
        try:
            time_value = datetime.fromisoformat(signal["time"].replace("Z", "+00:00")).astimezone(timezone.utc)
            age = (datetime.now(timezone.utc) - time_value).total_seconds()
        except (KeyError, ValueError, TypeError):
            pass
        auth = docker_status("jarvis-auth-service")
        stopped = auth.get("Status") in ("exited", "dead")
        authorized = (
            code == 200 and signal.get("status") == "observed" and age < 25
            and signal.get("eligible_for_recovery") is True
            and signal.get("anomaly") is True
            and signal.get("event_count", 0) >= 3
            and "auth-service" in signal.get("affected_services", [])
        )
        if stopped and authorized and time.time() - last_action > COOLDOWN:
            last_action = time.time()
            log_audit(env, "considered", "jarvis-auth-service",
                      "ML anomaly + real Wazuh activity + exited auth")
            if execute:
                result = subprocess.run(
                    ["docker", "start", "jarvis-auth-service"],
                    capture_output=True, text=True, timeout=20,
                )
                if result.returncode:
                    log_audit(env, "failed", "jarvis-auth-service", "Docker start unsuccessful")
                else:
                    log_audit(env, "restarted", "jarvis-auth-service", "Allowlisted start: auth exited")
                    if not await_service("http://192.168.43.1/health", attempts=3):
                        waf = docker_status("jarvis-waf")
                        if waf.get("Status") in ("exited", "dead"):
                            subprocess.run(["docker", "start", "jarvis-waf"],
                                           capture_output=True, text=True, timeout=20)
                            log_audit(env, "restarted", "jarvis-waf", "WAF exited after auth outage")
                    result = (proof_payment()
                              if await_service(WAF + "/health", attempts=10) and await_auth_route()
                              else {"status": 0})
                    log_audit(
                        env,
                        "verified" if result["status"] == 201 else "failed",
                        "jarvis-auth-service",
                        "Fresh fictional transaction (no sensitive data logged)",
                        result["status"],
                    )
            else:
                log_audit(env, "skipped", "jarvis-auth-service", "DRY RUN: would start auth")
        if once:
            break
        time.sleep(5)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true",
                        help="Explicitly authorize allowlisted self-healing in an isolated lab")
    parser.add_argument("--once", action="store_true")
    options = parser.parse_args()
    run(options.execute, options.once)
