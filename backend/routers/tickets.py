from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models.ticket import Ticket
from models.message import Message
from schemas.ticket import TicketCreate, TicketVendorUpdate, TicketPriorityUpdate, TicketClose
from agent.tools import _sla_deadline, _classify_priority, _next_ref

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


def _ticket_dict(ticket: Ticket) -> dict:
    return {
        "id": ticket.id,
        "ref_number": ticket.ref_number,
        "session_id": ticket.session_id,
        "tenant_name": ticket.tenant_name,
        "tower": ticket.tower,
        "floor": ticket.floor,
        "clinic_number": ticket.clinic_number,
        "category": ticket.category,
        "description": ticket.description,
        "priority": ticket.priority,
        "sla_deadline": ticket.sla_deadline.isoformat() if ticket.sla_deadline else None,
        "status": ticket.status,
        "vendor_id": ticket.vendor_id,
        "assigned_at": ticket.assigned_at.isoformat() if ticket.assigned_at else None,
        "completed_at": ticket.completed_at.isoformat() if ticket.completed_at else None,
        "resolution_note": ticket.resolution_note,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
    }


@router.get("")
def list_tickets(
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    tower: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    q = db.query(Ticket)
    if priority:
        q = q.filter(Ticket.priority == priority)
    if status:
        q = q.filter(Ticket.status == status)
    if tower:
        q = q.filter(Ticket.tower.ilike(f"%{tower}%"))
    if category:
        q = q.filter(Ticket.category == category)
    if from_date:
        q = q.filter(Ticket.created_at >= from_date)

    tickets = q.order_by(Ticket.created_at.desc()).all()
    return ok([_ticket_dict(t) for t in tickets])


@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: DBSession = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return err("Ticket not found")

    data = _ticket_dict(ticket)

    # Include chat transcript if session exists
    if ticket.session_id:
        messages = (
            db.query(Message)
            .filter(Message.session_id == ticket.session_id, Message.role.in_(["user", "assistant"]))
            .order_by(Message.created_at.asc())
            .all()
        )
        data["transcript"] = [
            {"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
            for m in messages
        ]
    else:
        data["transcript"] = []

    return ok(data)


@router.patch("/{ticket_id}/vendor")
def reassign_vendor(ticket_id: int, body: TicketVendorUpdate, db: DBSession = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return err("Ticket not found")
    ticket.vendor_id = body.vendor_id
    ticket.assigned_at = datetime.utcnow()
    ticket.status = "assigned"
    db.commit()
    return ok(_ticket_dict(ticket))


@router.patch("/{ticket_id}/priority")
def escalate_priority(ticket_id: int, body: TicketPriorityUpdate, db: DBSession = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return err("Ticket not found")
    ticket.priority = body.priority
    ticket.sla_deadline = _sla_deadline(body.priority)
    db.commit()
    return ok(_ticket_dict(ticket))


@router.patch("/{ticket_id}/close")
def close_ticket(ticket_id: int, body: TicketClose, db: DBSession = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return err("Ticket not found")
    ticket.status = "closed"
    ticket.completed_at = datetime.utcnow()
    ticket.resolution_note = body.resolution_note
    db.commit()

    # Update vendor score for on-time/late completion
    if ticket.vendor_id and ticket.sla_deadline:
        from models.vendor import Vendor
        vendor = db.query(Vendor).filter(Vendor.id == ticket.vendor_id).first()
        if vendor:
            if ticket.completed_at <= ticket.sla_deadline:
                vendor.score = min(100, vendor.score + 5)
                vendor.on_time_count += 1
            else:
                vendor.score = max(0, vendor.score - 10)
                vendor.late_count += 1
            vendor.total_jobs += 1
            db.commit()

    return ok(_ticket_dict(ticket))
