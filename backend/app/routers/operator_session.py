"""Operator TOTP MFA and 15-minute signed sessions."""
from __future__ import annotations
import base64
import hashlib
import hmac
import json
import logging
import secrets
import time
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

router = APIRouter()
LOG = logging.getLogger("uvicorn.error")
SESSION_TTL = 900


class OperatorLogin(BaseModel):
    operator_token: str = Field(min_length=8, max_length=1024)
    otp: str = Field(default="", max_length=8)


def secret_values(settings):
    return settings.jarvis_operator_token.get_secret_value(), settings.jarvis_mfa_secret.get_secret_value()


def key_for(settings) -> bytes:
    token, otp = secret_values(settings)
    return hashlib.sha256((token + ":" + otp + ":operator-session-v1").encode()).digest()


def b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def verify_totp(secret: str, otp: str, timestamp: float | None = None) -> bool:
    return totp_slot(secret, otp, timestamp) is not None


def totp_slot(secret: str, otp: str, timestamp: float | None = None) -> int | None:
    if not otp.isascii() or len(otp) != 6 or not otp.isdigit():
        return None
    try:
        key = base64.b32decode(secret.upper() + "=" * (-len(secret) % 8), casefold=True)
    except (ValueError, base64.binascii.Error):
        return None
    if len(key) < 16:
        return None
    slot = int((time.time() if timestamp is None else timestamp) // 30)
    for index in (slot - 1, slot, slot + 1):
        digest = hmac.new(key, index.to_bytes(8, "big"), hashlib.sha1).digest()
        offset = digest[-1] & 0x0F
        code = str((int.from_bytes(digest[offset:offset + 4], "big") & 0x7FFFFFFF) % 1_000_000).zfill(6)
        if secrets.compare_digest(code, otp):
            return index
    return None


def issue_session(settings) -> str:
    now = int(time.time())
    payload = b64(json.dumps({"v": 1, "role": "operator", "iat": now, "exp": now + SESSION_TTL,
                              "nonce": secrets.token_urlsafe(16)}, separators=(",", ":")).encode())
    signature = b64(hmac.new(key_for(settings), payload.encode(), hashlib.sha256).digest())
    return payload + "." + signature


def check_session(settings, token: str) -> bool:
    try:
        payload, signature = token.split(".", 1)
        check = b64(hmac.new(key_for(settings), payload.encode(), hashlib.sha256).digest())
        if not secrets.compare_digest(check, signature):
            return False
        body = json.loads(unb64(payload))
        now = int(time.time())
        return (body.get("v") == 1 and body.get("role") == "operator"
                and isinstance(body.get("iat"), int) and isinstance(body.get("exp"), int)
                and now - SESSION_TTL <= body["iat"] <= now and now < body["exp"] <= body["iat"] + SESSION_TTL)
    except (ValueError, TypeError, KeyError, UnicodeDecodeError, json.JSONDecodeError, base64.binascii.Error):
        return False


@router.post("/operator/session")
async def operator_login(body: OperatorLogin, request: Request):
    settings = request.app.state.settings
    token, totp_secret = secret_values(settings)
    if len(token) < 32 or len(totp_secret) < 16:
        raise HTTPException(status_code=503, detail="Configuration opérateur/MFA incomplète")
    remote = request.client.host if request.client else "unknown"
    redis = request.app.state.redis
    rate_key = "jarvis:security:operator-rate:" + hashlib.sha256(remote.encode()).hexdigest()
    async with redis.pipeline(transaction=True) as pipe:
        pipe.incr(rate_key)
        pipe.expire(rate_key, 60, nx=True)
        count, _ = await pipe.execute()
    if count > 5:
        LOG.warning("SECURITY_OPERATOR_RATE_LIMITED")
        raise HTTPException(status_code=429, detail="Trop de tentatives", headers={"Retry-After": "60"})
    valid_token = secrets.compare_digest(body.operator_token.encode(), token.encode())
    slot = totp_slot(totp_secret, body.otp)
    if not (valid_token and slot is not None):
        LOG.warning("SECURITY_OPERATOR_LOGIN_FAILED")
        raise HTTPException(status_code=401, detail="Jeton ou code TOTP incorrect")
    replay_key = "jarvis:security:operator-totp:" + hashlib.sha256(key_for(settings)).hexdigest() + ":" + str(slot)
    if not await redis.set(replay_key, "used", ex=95, nx=True):
        LOG.warning("SECURITY_OPERATOR_TOTP_REPLAY_DENIED")
        raise HTTPException(status_code=401, detail="Code TOTP déjà utilisé, attendre le suivant")
    LOG.info("SECURITY_OPERATOR_LOGIN_SUCCESS")
    return {"access_token": issue_session(settings), "token_type": "bearer", "expires_in": SESSION_TTL}
