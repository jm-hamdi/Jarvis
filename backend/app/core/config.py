from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str = "redis://redis:6379"
    ollama_base_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.1:8b-instruct-q4_0"
    backend_secret: str = "dev_secret"
    # Operator auth (≥32 chars required for protected routes)
    jarvis_operator_token: SecretStr = SecretStr("")
    # TOTP MFA secret (base32, ≥16 chars) — optional, enables /operator/session
    jarvis_mfa_secret: SecretStr = SecretStr("")

    class Config:
        env_file = ".env"


settings = Settings()
