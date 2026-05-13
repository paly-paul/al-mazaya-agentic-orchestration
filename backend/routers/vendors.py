import csv
import io
import json
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models.vendor import Vendor
from schemas.vendor import VendorCreate, VendorStatusUpdate, VendorScoreUpdate

router = APIRouter(prefix="/api/vendors", tags=["vendors"])


def ok(data):
    return {"success": True, "data": data, "error": None}


def err(msg: str):
    return {"success": False, "data": None, "error": msg}


def _vendor_dict(vendor: Vendor) -> dict:
    return {
        "id": vendor.id,
        "company_name": vendor.company_name,
        "category": vendor.category,
        "towers_covered": vendor.towers_covered,
        "contact_name": vendor.contact_name,
        "phone": vendor.phone,
        "email": vendor.email,
        "trade_licence": vendor.trade_licence,
        "score": vendor.score,
        "total_jobs": vendor.total_jobs,
        "on_time_count": vendor.on_time_count,
        "late_count": vendor.late_count,
        "complaint_count": vendor.complaint_count,
        "no_show_count": vendor.no_show_count,
        "status": vendor.status,
        "last_dispatched_at": vendor.last_dispatched_at.isoformat() if vendor.last_dispatched_at else None,
        "created_at": vendor.created_at.isoformat() if vendor.created_at else None,
        "updated_at": vendor.updated_at.isoformat() if vendor.updated_at else None,
    }


@router.get("/dispatch")
def get_best_vendor(
    category: str = Query(...),
    tower: str = Query(...),
    exclude_ids: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    from agent.tools import _best_vendor
    exclude = [int(x) for x in exclude_ids.split(",") if x.strip().isdigit()] if exclude_ids else []

    vendors = db.query(Vendor).filter(Vendor.status == "active").all()
    candidates = []
    for v in vendors:
        if v.id in exclude:
            continue
        cats = json.loads(v.category or "[]")
        towers = json.loads(v.towers_covered or "[]")
        tower_match = "all" in [t.lower() for t in towers] or any(
            tower.lower() in t.lower() or t.lower() in tower.lower() for t in towers
        )
        cat_match = any(category.lower() in c.lower() or c.lower() in category.lower() for c in cats)
        if cat_match and tower_match and v.score >= 60:
            candidates.append(v)

    if not candidates:
        return err("No available vendor found")

    from datetime import datetime
    candidates.sort(key=lambda v: (-v.score, v.last_dispatched_at or datetime.min))
    best = candidates[0]

    return ok({
        "vendor_id": best.id,
        "company_name": best.company_name,
        "score": best.score,
        "contact_phone": best.phone,
    })


@router.get("")
def list_vendors(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tower: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None),
    format: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    vendors = db.query(Vendor).all()

    if status:
        vendors = [v for v in vendors if v.status == status]
    if min_score is not None:
        vendors = [v for v in vendors if v.score >= min_score]
    if category:
        vendors = [v for v in vendors if category.lower() in v.category.lower()]
    if tower:
        vendors = [v for v in vendors if tower.lower() in v.towers_covered.lower() or "all" in v.towers_covered.lower()]

    if format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "id", "company_name", "category", "towers_covered", "contact_name",
            "phone", "score", "total_jobs", "status", "created_at",
        ])
        writer.writeheader()
        for v in vendors:
            writer.writerow({
                "id": v.id, "company_name": v.company_name, "category": v.category,
                "towers_covered": v.towers_covered, "contact_name": v.contact_name,
                "phone": v.phone, "score": v.score, "total_jobs": v.total_jobs,
                "status": v.status, "created_at": v.created_at,
            })
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=vendors.csv"},
        )

    return ok([_vendor_dict(v) for v in vendors])


@router.post("")
def create_vendor(body: VendorCreate, db: DBSession = Depends(get_db)):
    vendor = Vendor(
        company_name=body.company_name,
        category=json.dumps(body.categories),
        towers_covered=json.dumps(body.towers_covered),
        contact_name=body.contact_name,
        phone=body.phone,
        email=body.email,
        trade_licence=body.trade_licence,
        score=70,
        status="onboarding",
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return ok(_vendor_dict(vendor))


@router.get("/{vendor_id}")
def get_vendor(vendor_id: int, db: DBSession = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return err("Vendor not found")
    return ok(_vendor_dict(vendor))


@router.patch("/{vendor_id}/status")
def update_vendor_status(vendor_id: int, body: VendorStatusUpdate, db: DBSession = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return err("Vendor not found")
    vendor.status = body.status
    db.commit()
    return ok(_vendor_dict(vendor))


@router.patch("/{vendor_id}/score")
def update_vendor_score(vendor_id: int, body: VendorScoreUpdate, db: DBSession = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return err("Vendor not found")
    vendor.score = max(0, min(100, body.score))
    db.commit()
    return ok(_vendor_dict(vendor))
