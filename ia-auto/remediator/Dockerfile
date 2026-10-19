FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir redis fastapi uvicorn httpx pyyaml docker
COPY . .
EXPOSE 8081
CMD ["python", "engine.py"]
