import asyncio
import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session as DBSession

from agent.agent import run_agent, run_agent_streaming
from database import get_db
from models.message import Message
from models.session import Session as SessionModel
from schemas.chat import ChatRequest, ChatResponse, SessionOut, MessageOut

router = APIRouter(prefix="/api", tags=["chat"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


@router.post("/chat")
async def chat(request: ChatRequest, db: DBSession = Depends(get_db)):
    try:
        result = run_agent(
            db=db,
            session_id=request.session_id,
            user_message=request.message,
            language=request.language or "en",
            use_case_hint=request.use_case_hint,
        )
        data = ChatResponse(
            session_id=request.session_id,
            message=result["message"],
            quick_replies=result.get("quick_replies", []),
            structured_output=result.get("structured_output"),
            actions_taken=result.get("actions_taken", []),
        )
        return ok(data.model_dump())
    except Exception as e:
        return err(str(e))


@router.get("/chat/sessions/{session_id}")
def get_session(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        return err("Session not found")

    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id, Message.role.in_(["user", "assistant"]))
        .order_by(Message.created_at.asc())
        .all()
    )

    data = SessionOut(
        session_id=session_id,
        use_case=session.use_case,
        language=session.language,
        messages=[MessageOut.model_validate(m) for m in messages],
    )
    return ok(data.model_dump())


@router.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str, db: DBSession = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)
            user_message = payload.get("message", "")
            language = payload.get("language", "en")
            use_case_hint = payload.get("use_case_hint")

            async for chunk in run_agent_streaming(
                db=db,
                session_id=session_id,
                user_message=user_message,
                language=language,
                use_case_hint=use_case_hint,
            ):
                await websocket.send_text(json.dumps(chunk))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
        await websocket.close()
