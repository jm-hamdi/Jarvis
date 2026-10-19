FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir scikit-learn numpy pandas prometheus-client redis fastapi uvicorn httpx
COPY . .
EXPOSE 8080
CMD ["python", "run.py"]
