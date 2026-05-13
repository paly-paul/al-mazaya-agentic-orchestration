import json
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models.briefing import Briefing

router = APIRouter(prefix="/api/briefing", tags=["briefing"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


def _briefing_dict(b: Briefing) -> dict:
    alerts = []
    try:
        alerts = json.loads(b.alerts or "[]")
    except Exception:
        pass
    return {
        "id": b.id,
        "period": b.period,
        "generated_at": b.generated_at.isoformat() if b.generated_at else None,
        "briefing_en": b.briefing_en,
        "briefing_ar": b.briefing_ar,
        "alerts": alerts,
    }


@router.get("/latest")
def get_latest_briefing(db: DBSession = Depends(get_db)):
    briefing = db.query(Briefing).order_by(Briefing.generated_at.desc()).first()
    if not briefing:
        return err("No briefing found")
    return ok(_briefing_dict(briefing))


class BriefingGenerateRequest(BaseModel):
    period: str = "daily"
    language: Optional[str] = "en"


@router.post("/generate")
async def generate_briefing(body: BriefingGenerateRequest, db: DBSession = Depends(get_db)):
    try:
        from agent.scheduler import _generate_and_store_briefing
        await _generate_and_store_briefing(body.period)
        briefing = db.query(Briefing).order_by(Briefing.generated_at.desc()).first()
        return ok(_briefing_dict(briefing))
    except Exception as e:
        return err(str(e))
