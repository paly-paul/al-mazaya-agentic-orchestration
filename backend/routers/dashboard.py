from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session as DBSession

from database import get_db
from agent.tools import execute_get_dashboard_stats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


@router.get("/stats")
def get_dashboard_stats(
    tower_filter: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    stats = execute_get_dashboard_stats(db, {"tower_filter": tower_filter})
    return ok(stats)


@router.get("/live-chats")
def get_live_chats(db: DBSession = Depends(get_db)):
    from datetime import datetime, timedelta
    from models.session import Session as SessionModel
    from models.message import Message

    cutoff = datetime.utcnow() - timedelta(minutes=30)
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.last_active_at >= cutoff)
        .order_by(SessionModel.last_active_at.desc())
        .limit(50)
        .all()
    )

    result = []
    for s in sessions:
        last_msg = (
            db.query(Message)
            .filter(Message.session_id == s.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        result.append({
            "session_id": s.id,
            "user_type": s.user_type,
            "language": s.language,
            "use_case": s.use_case,
            "last_message": last_msg.content[:120] if last_msg else None,
            "last_active_at": s.last_active_at.isoformat() if s.last_active_at else None,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    return ok(result)
