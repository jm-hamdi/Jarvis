# JARVIS — Command Center

> Workshop M2 2026 · PROJECT RESILIENCE-ALPHA  
> A self-healing payment platform with ML anomaly detection, autonomous remediation, and a sci-fi HUD dashboard.

## Quick start (3 commands)

```bash
cp .env.example .env          # fill in secrets
make build                    # build all images
make up                       # start the full stack
```

Dashboard → http://localhost:5173  
Grafana   → http://localhost:3001

## Architecture

```
Attacker ──► WAF ──► Payment API + Auth + DB
                          │ metrics + logs
                     Prometheus / Loki
                          │
                    Detector ML (Isolation Forest)
                          │ Redis Streams
                    Remediator (auto playbooks)
                          │
                    Verifier (test transaction)
                          │
              Frontend JARVIS ◄── Backend WebSocket
```

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + Three.js |
| Backend | FastAPI + WebSocket + Redis Streams |
| Payment | FastAPI + PostgreSQL |
| ML | scikit-learn Isolation Forest |
| LLM | Ollama (Llama 3.1 8B Q4) + LangChain RAG |
| Infra | Docker Compose + Nginx WAF + Prometheus + Loki + Wazuh |

## Make targets

| Command | Description |
|---|---|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | Stream all logs |
| `make demo` | Run the automated demo scenario |
| `make attack` | Launch flood attack (dev only) |
| `make reset` | Wipe volumes and restart fresh |

## Train the ML model

```bash
docker compose exec detector python train.py
```

## Key constraints

- Zero human intervention during demo
- Local LLM only (Ollama, ≤8B params)
- Jarvis AI is read-only
- No secrets in the repo (`.env` + Vault)
- Remediator accesses Docker only via `docker-socket-proxy`
