from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic_settings import BaseSettings
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
class Settings(BaseSettings):
    jwt_secret: str = "dev_secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    class Config:
        env_file = ".env"

settings = Settings()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI(title="Auth Service")

# In-memory stub user (replace with DB in production)
USERS = {"testuser": pwd_ctx.hash("testpass")}


def create_token(username: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": username, "exp": exp}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@app.post("/auth/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    hashed = USERS.get(form.username)
    if not hashed or not pwd_ctx.verify(form.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_token(form.username), "token_type": "bearer"}


@app.post("/auth/refresh")
async def refresh(token: str):
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return {"access_token": create_token(data["sub"]), "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/health")
async def health():
    return {"status": "ok"}
