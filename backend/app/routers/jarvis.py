from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/jarvis")


class ChatRequest(BaseModel):
    message: str
    incident_id: str | None = None


@router.post("/chat")
async def chat(req: ChatRequest):
    """Streaming RAG response from local Ollama. Read-only."""
    async def generate():
        # Stub — replace with real LangChain RAG chain
        response = (
            f"[JARVIS] Analysing: '{req.message}'. "
            "This is a stub response. Connect Ollama to enable real answers."
        )
        for word in response.split():
            yield word + " "

    return StreamingResponse(generate(), media_type="text/plain")


@router.get("/incident/{incident_id}/summary")
async def incident_summary(incident_id: str) -> dict:
    return {
        "incident_id": incident_id,
        "summary": "Stub summary — connect RAG pipeline to generate real summaries.",
    }
