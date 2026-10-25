"""Operator auth: accepts TOTP session tokens (when MFA configured) or raw token (dev fallback)."""
import secrets
from typing import Annotated

from fastapi import Header, HTTPException, Request


async def operator(request: Request, authorization: Annotated[str | None, Header()] = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Session opérateur requise")

    credential = authorization[7:]
    settings = request.app.state.settings
    raw_token = settings.jarvis_operator_token.get_secret_value()
    mfa_secret = settings.jarvis_mfa_secret.get_secret_value()

    # Prefer TOTP session when both secrets are configured.
    if len(raw_token) >= 32 and len(mfa_secret) >= 16:
        from app.routers.operator_session import check_session
        if check_session(settings, credential):
            return
        # Still allow raw token as direct fallback during dev.
    elif len(raw_token) >= 8:
        if secrets.compare_digest(credential.encode(), raw_token.encode()):
            return
        raise HTTPException(401, "Token opérateur invalide")
    else:
        raise HTTPException(503, "Configurez JARVIS_OPERATOR_TOKEN (≥8 chars) dans .env")

    raise HTTPException(401, "Session expirée ou token invalide")
