import csv
import io
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models.lead import Lead
from schemas.lead import LeadAssign, LeadStatusUpdate

router = APIRouter(prefix="/api/leads", tags=["leads"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


def _lead_dict(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "session_id": lead.session_id,
        "name": lead.name,
        "phone": lead.phone,
        "email": lead.email,
        "specialty": lead.specialty,
        "clinic_size": lead.clinic_size,
        "tower_preference": lead.tower_preference,
        "budget_range": lead.budget_range,
        "timeline": lead.timeline,
        "score": lead.score,
        "score_tier": lead.score_tier,
        "score_breakdown": lead.score_breakdown,
        "source": lead.source,
        "status": lead.status,
        "assigned_to": lead.assigned_to,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
        "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
    }


@router.get("")
def list_leads(
    score_tier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    tower: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    format: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    q = db.query(Lead)
    if score_tier:
        q = q.filter(Lead.score_tier == score_tier)
    if status:
        q = q.filter(Lead.status == status)
    if tower:
        q = q.filter(Lead.tower_preference.ilike(f"%{tower}%"))
    if source:
        q = q.filter(Lead.source == source)
    if assigned_to:
        q = q.filter(Lead.assigned_to == assigned_to)
    if from_date:
        q = q.filter(Lead.created_at >= from_date)
    if to_date:
        q = q.filter(Lead.created_at <= to_date)

    leads = q.order_by(Lead.created_at.desc()).all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "id", "name", "phone", "email", "specialty", "tower_preference",
            "score", "score_tier", "source", "status", "assigned_to", "created_at",
        ])
        writer.writeheader()
        for lead in leads:
            writer.writerow({
                "id": lead.id, "name": lead.name, "phone": lead.phone,
                "email": lead.email, "specialty": lead.specialty,
                "tower_preference": lead.tower_preference, "score": lead.score,
                "score_tier": lead.score_tier, "source": lead.source,
                "status": lead.status, "assigned_to": lead.assigned_to,
                "created_at": lead.created_at,
            })
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=leads.csv"},
        )

    return ok([_lead_dict(l) for l in leads])


@router.get("/{lead_id}")
def get_lead(lead_id: int, db: DBSession = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        return err("Lead not found")
    return ok(_lead_dict(lead))


@router.patch("/{lead_id}/assign")
def assign_lead(lead_id: int, body: LeadAssign, db: DBSession = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        return err("Lead not found")
    lead.assigned_to = body.assigned_to
    db.commit()
    return ok(_lead_dict(lead))


@router.patch("/{lead_id}/status")
def update_lead_status(lead_id: int, body: LeadStatusUpdate, db: DBSession = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        return err("Lead not found")
    lead.status = body.status
    db.commit()
    return ok(_lead_dict(lead))
