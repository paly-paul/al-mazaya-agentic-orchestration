"""
Chat endpoints:
  POST /api/chat             — public
  WebSocket /ws/chat/{sid}   — public streaming
  GET /api/chat/sessions/{sid}
"""
import json
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db
from models import ChatSession, ChatMessage
from schemas.chat import ChatRequest, ChatResponse, SessionResponse, MessageResponse
from agent.agent import process_chat, process_chat_stream

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


def _envelope(data=None, error=None):
    return {"success": error is None, "data": data, "error": error}


@router.post("/api/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Send a message to the AI agent and receive a response."""
    session_id = request.session_id or str(uuid.uuid4())
    language = request.language or "en"

    try:
        result = await process_chat(
            session_id=session_id,
            message=request.message,
            language=language,
        )
        return _envelope(data={
            "session_id": session_id,
            "message": result["message"],
            "quick_replies": result.get("quick_replies", []),
            "structured_output": None,
            "actions_taken": result.get("actions_taken", []),
        })
    except Exception as e:
        logger.exception(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/chat/sessions/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get full conversation history for a session."""
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id,
            ChatMessage.role.in_(["user", "assistant"]),
        )
        .order_by(ChatMessage.id.asc())
        .all()
    )

    msg_list = [
        {
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        }
        for msg in messages
    ]

    return _envelope(data={
        "session_id": session.session_id,
        "use_case": session.use_case,
        "language": session.language,
        "messages": msg_list,
    })


# ---------------------------------------------------------------------------
# WebSocket streaming endpoint
# ---------------------------------------------------------------------------

@router.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """Stream chat tokens over WebSocket."""
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON"})
                continue

            message = data.get("message", "")
            language = data.get("language", "en")

            if not message:
                await websocket.send_json({"error": "Empty message"})
                continue

            async for chunk in process_chat_stream(session_id, message, language):
                await websocket.send_json(chunk)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: session={session_id}")
    except Exception as e:
        logger.exception(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except Exception:
            pass
