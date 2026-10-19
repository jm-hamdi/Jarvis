from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    redis_url: str = "redis://redis:6379"
    ollama_base_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.1:8b-instruct-q4_0"
    backend_secret: str = "dev_secret"

    class Config:
        env_file = ".env"

settings = Settings()
