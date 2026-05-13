import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models.work_order import WorkOrder
from models.message import Message
from schemas.work_order import WorkOrderCreate, WorkOrderApprove, WorkOrderReject
from agent.tools import _next_ref, _best_vendor

router = APIRouter(prefix="/api/work-orders", tags=["work_orders"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


def _wo_dict(wo: WorkOrder) -> dict:
    return {
        "id": wo.id,
        "ref_number": wo.ref_number,
        "session_id": wo.session_id,
        "tenant_name": wo.tenant_name,
        "tower": wo.tower,
        "floor": wo.floor,
        "service_type": wo.service_type,
        "specification": wo.specification,
        "quote_amount": wo.quote_amount,
        "quote_breakdown": wo.quote_breakdown,
        "approval_status": wo.approval_status,
        "approved_by": wo.approved_by,
        "rejected_by": wo.rejected_by,
        "rejection_reason": wo.rejection_reason,
        "vendor_id": wo.vendor_id,
        "scheduled_date": wo.scheduled_date.isoformat() if wo.scheduled_date else None,
        "status": wo.status,
        "created_at": wo.created_at.isoformat() if wo.created_at else None,
        "updated_at": wo.updated_at.isoformat() if wo.updated_at else None,
    }


@router.get("")
def list_work_orders(
    status: Optional[str] = Query(None),
    tower: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    q = db.query(WorkOrder)
    if status:
        q = q.filter(WorkOrder.status == status)
    if tower:
        q = q.filter(WorkOrder.tower.ilike(f"%{tower}%"))
    if service_type:
        q = q.filter(WorkOrder.service_type.ilike(f"%{service_type}%"))

    orders = q.order_by(WorkOrder.created_at.desc()).all()
    return ok([_wo_dict(w) for w in orders])


@router.get("/{wo_id}")
def get_work_order(wo_id: int, db: DBSession = Depends(get_db)):
    wo = db.query(WorkOrder).filter(WorkOrder.id == wo_id).first()
    if not wo:
        return err("Work order not found")

    data = _wo_dict(wo)
    if wo.session_id:
        messages = (
            db.query(Message)
            .filter(Message.session_id == wo.session_id, Message.role.in_(["user", "assistant"]))
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


@router.post("")
def create_work_order(body: WorkOrderCreate, db: DBSession = Depends(get_db)):
    from config import settings
    ref = _next_ref(db, WorkOrder, "FS")
    threshold = settings.auto_approval_threshold_kd
    approval_status = "auto_approved" if body.quote_amount <= threshold else "pending_approval"

    wo = WorkOrder(
        ref_number=ref,
        session_id=body.session_id,
        tenant_name=body.tenant_name,
        tower=body.tower,
        floor=body.floor,
        service_type=body.service_type,
        specification=json.dumps(body.specification) if body.specification else None,
        quote_amount=body.quote_amount,
        quote_breakdown=json.dumps(body.quote_breakdown) if body.quote_breakdown else None,
        approval_status=approval_status,
        status=approval_status,
    )
    db.add(wo)
    db.commit()
    db.refresh(wo)
    return ok(_wo_dict(wo))


@router.patch("/{wo_id}/approve")
def approve_work_order(wo_id: int, body: WorkOrderApprove, db: DBSession = Depends(get_db)):
    wo = db.query(WorkOrder).filter(WorkOrder.id == wo_id).first()
    if not wo:
        return err("Work order not found")

    wo.approval_status = "approved"
    wo.approved_by = body.approved_by
    wo.status = "in_progress"
    db.commit()

    # Dispatch vendor post-approval
    vendor = _best_vendor(db, wo.service_type, wo.tower or "")
    if vendor:
        wo.vendor_id = vendor.id
        vendor.last_dispatched_at = datetime.utcnow()
        db.commit()

    return ok(_wo_dict(wo))


@router.patch("/{wo_id}/reject")
def reject_work_order(wo_id: int, body: WorkOrderReject, db: DBSession = Depends(get_db)):
    wo = db.query(WorkOrder).filter(WorkOrder.id == wo_id).first()
    if not wo:
        return err("Work order not found")

    wo.approval_status = "rejected"
    wo.rejected_by = body.rejected_by
    wo.rejection_reason = body.reason
    wo.status = "cancelled"
    db.commit()
    return ok(_wo_dict(wo))
