"""
Agent tool definitions (schemas for Claude) and Python implementations.
Each TOOL_* dict is passed to the Anthropic Messages API as a tool definition.
Each execute_* function is the Python-side handler called when Claude invokes the tool.
"""
import json
import os
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy.orm import Session as DBSession

from agent.scoring import calculate_lead_score
from config import settings
from models.lead import Lead
from models.ticket import Ticket
from models.vendor import Vendor
from models.work_order import WorkOrder


# ──────────────────────────────────────────────────────────────────────────────
# Tool schemas (passed verbatim to Anthropic API)
# ──────────────────────────────────────────────────────────────────────────────

TOOL_CREATE_LEAD = {
    "name": "create_lead",
    "description": "Create a new lead record after completing qualification. Call when all required fields are collected.",
    "input_schema": {
        "type": "object",
        "properties": {
            "session_id": {"type": "string"},
            "name": {"type": "string"},
            "phone": {"type": "string"},
            "specialty": {"type": "string"},
            "clinic_size": {"type": "string", "enum": ["small", "medium", "large", "unknown"]},
            "tower_preference": {"type": "string"},
            "budget_range": {"type": "string"},
            "timeline": {"type": "string"},
            "source": {"type": "string", "enum": ["web_chat", "whatsapp", "email", "hotline"]},
        },
        "required": ["session_id", "name", "phone", "specialty"],
    },
}

TOOL_SCORE_LEAD = {
    "name": "score_lead",
    "description": "Calculate lead score 0-100 based on collected qualification data.",
    "input_schema": {
        "type": "object",
        "properties": {
            "lead_id": {"type": "integer"},
            "specialty": {"type": "string"},
            "tower_preference": {"type": "string"},
            "budget_range": {"type": "string"},
            "timeline": {"type": "string"},
            "clinic_size": {"type": "string"},
        },
        "required": ["lead_id"],
    },
}

TOOL_CREATE_TICKET = {
    "name": "create_ticket",
    "description": "Create a maintenance ticket. Call when issue type, tower, and floor are confirmed.",
    "input_schema": {
        "type": "object",
        "properties": {
            "session_id": {"type": "string"},
            "tenant_name": {"type": "string"},
            "tower": {"type": "string"},
            "floor": {"type": "string"},
            "clinic_number": {"type": "string"},
            "category": {
                "type": "string",
                "enum": ["hvac", "electrical", "plumbing", "lift", "fire", "medical_gas", "civil", "cleaning", "pest", "other"],
            },
            "description": {"type": "string"},
        },
        "required": ["session_id", "tower", "floor", "category", "description"],
    },
}

TOOL_DISPATCH_VENDOR = {
    "name": "dispatch_vendor",
    "description": "Select and dispatch the best available vendor for a ticket or work order.",
    "input_schema": {
        "type": "object",
        "properties": {
            "job_id": {"type": "integer"},
            "job_type": {"type": "string", "enum": ["ticket", "work_order"]},
            "category": {"type": "string"},
            "tower": {"type": "string"},
            "priority": {"type": "string", "enum": ["P1", "P2", "P3"]},
        },
        "required": ["job_id", "job_type", "category", "tower"],
    },
}

TOOL_GET_QUOTE = {
    "name": "get_quote",
    "description": "Generate a service quote from the rate card based on service specifications.",
    "input_schema": {
        "type": "object",
        "properties": {
            "service_type": {"type": "string"},
            "specifications": {"type": "object"},
            "tower": {"type": "string"},
        },
        "required": ["service_type", "specifications"],
    },
}

TOOL_CREATE_WORK_ORDER = {
    "name": "create_work_order",
    "description": "Create a facility service work order after quote acceptance.",
    "input_schema": {
        "type": "object",
        "properties": {
            "session_id": {"type": "string"},
            "tenant_name": {"type": "string"},
            "tower": {"type": "string"},
            "floor": {"type": "string"},
            "service_type": {"type": "string"},
            "specification": {"type": "object"},
            "quote_amount": {"type": "number"},
            "quote_breakdown": {"type": "object"},
        },
        "required": ["session_id", "service_type", "quote_amount"],
    },
}

TOOL_REGISTER_VENDOR = {
    "name": "register_vendor",
    "description": "Register a new vendor in the system after collecting all required information.",
    "input_schema": {
        "type": "object",
        "properties": {
            "company_name": {"type": "string"},
            "categories": {"type": "array", "items": {"type": "string"}},
            "towers_covered": {"type": "array", "items": {"type": "string"}},
            "contact_name": {"type": "string"},
            "phone": {"type": "string"},
            "email": {"type": "string"},
            "trade_licence": {"type": "string"},
        },
        "required": ["company_name", "categories", "contact_name", "phone"],
    },
}

TOOL_GENERATE_BRIEFING = {
    "name": "generate_briefing",
    "description": "Generate the daily management briefing from current operational data.",
    "input_schema": {
        "type": "object",
        "properties": {
            "period": {"type": "string", "enum": ["daily", "weekly"]},
            "language": {"type": "string", "enum": ["en", "ar"]},
        },
        "required": ["period"],
    },
}

TOOL_GET_DASHBOARD_STATS = {
    "name": "get_dashboard_stats",
    "description": "Retrieve current operational KPIs for the dashboard.",
    "input_schema": {
        "type": "object",
        "properties": {
            "tower_filter": {"type": "string", "description": "Optional tower name to filter by"},
        },
    },
}

ALL_TOOLS = [
    TOOL_CREATE_LEAD,
    TOOL_SCORE_LEAD,
    TOOL_CREATE_TICKET,
    TOOL_DISPATCH_VENDOR,
    TOOL_GET_QUOTE,
    TOOL_CREATE_WORK_ORDER,
    TOOL_REGISTER_VENDOR,
    TOOL_GENERATE_BRIEFING,
    TOOL_GET_DASHBOARD_STATS,
]


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _load_rate_card() -> dict:
    rc_path = os.path.join(os.path.dirname(__file__), "..", "data", "rate_card.json")
    with open(rc_path, "r") as f:
        return json.load(f)


def _next_ref(db: DBSession, model, prefix: str) -> str:
    count = db.query(model).count() + 1
    return f"{prefix}-{count:04d}"


def _classify_priority(category: str) -> str:
    p1_categories = {"fire", "medical_gas", "plumbing"}  # flooding/gas
    p2_categories = {"hvac", "electrical", "lift"}
    cat = category.lower()
    if cat in p1_categories:
        return "P1"
    if cat in p2_categories:
        return "P2"
    return "P3"


def _sla_deadline(priority: str) -> datetime:
    hours_map = {"P1": settings.p1_sla_hours, "P2": settings.p2_sla_hours, "P3": settings.p3_sla_hours}
    return datetime.utcnow() + timedelta(hours=hours_map.get(priority, 48))


def _best_vendor(db: DBSession, category: str, tower: str) -> Optional[Vendor]:
    vendors = db.query(Vendor).filter(Vendor.status == "active").all()
    candidates = []
    for v in vendors:
        cats = json.loads(v.category or "[]")
        towers = json.loads(v.towers_covered or "[]")
        tower_match = "all" in [t.lower() for t in towers] or any(
            tower.lower() in t.lower() or t.lower() in tower.lower() for t in towers
        )
        cat_match = any(category.lower() in c.lower() or c.lower() in category.lower() for c in cats)
        if cat_match and tower_match and v.score >= settings.vendor_min_score_threshold:
            candidates.append(v)

    if not candidates:
        return None
    candidates.sort(key=lambda v: (-v.score, v.last_dispatched_at or datetime.min))
    return candidates[0]


# ──────────────────────────────────────────────────────────────────────────────
# Tool implementations
# ──────────────────────────────────────────────────────────────────────────────

def execute_create_lead(db: DBSession, inputs: dict) -> dict:
    lead = Lead(
        session_id=inputs.get("session_id"),
        name=inputs["name"],
        phone=inputs["phone"],
        email=inputs.get("email"),
        specialty=inputs["specialty"],
        clinic_size=inputs.get("clinic_size", "unknown"),
        tower_preference=inputs.get("tower_preference"),
        budget_range=inputs.get("budget_range"),
        timeline=inputs.get("timeline"),
        source=inputs.get("source", "web_chat"),
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return {"lead_id": lead.id, "name": lead.name, "status": "created"}


def execute_score_lead(db: DBSession, inputs: dict) -> dict:
    lead = db.query(Lead).filter(Lead.id == inputs["lead_id"]).first()
    if not lead:
        return {"error": f"Lead {inputs['lead_id']} not found"}

    result = calculate_lead_score(
        specialty=inputs.get("specialty") or lead.specialty,
        tower_preference=inputs.get("tower_preference") or lead.tower_preference,
        budget_range=inputs.get("budget_range") or lead.budget_range,
        timeline=inputs.get("timeline") or lead.timeline,
        clinic_size=inputs.get("clinic_size") or lead.clinic_size,
    )

    lead.score = result["score"]
    lead.score_tier = result["tier"]
    lead.score_breakdown = json.dumps(result["breakdown"])
    lead.status = result["tier"]  # hot / warm / cold
    db.commit()

    return {
        "lead_id": lead.id,
        "score": result["score"],
        "tier": result["tier"],
        "breakdown": result["breakdown"],
    }


def execute_create_ticket(db: DBSession, inputs: dict) -> dict:
    priority = _classify_priority(inputs["category"])
    ref = _next_ref(db, Ticket, "MX")
    ticket = Ticket(
        ref_number=ref,
        session_id=inputs.get("session_id"),
        tenant_name=inputs.get("tenant_name"),
        tower=inputs["tower"],
        floor=inputs["floor"],
        clinic_number=inputs.get("clinic_number"),
        category=inputs["category"],
        description=inputs["description"],
        priority=priority,
        sla_deadline=_sla_deadline(priority),
        status="open",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Auto-dispatch vendor
    vendor = _best_vendor(db, inputs["category"], inputs["tower"])
    if vendor:
        ticket.vendor_id = vendor.id
        ticket.assigned_at = datetime.utcnow()
        ticket.status = "assigned"
        vendor.last_dispatched_at = datetime.utcnow()
        db.commit()
        vendor_info = {"vendor_id": vendor.id, "company_name": vendor.company_name, "phone": vendor.phone}
    else:
        vendor_info = None

    return {
        "ticket_id": ticket.id,
        "ref_number": ticket.ref_number,
        "priority": ticket.priority,
        "sla_deadline": ticket.sla_deadline.isoformat() if ticket.sla_deadline else None,
        "vendor": vendor_info,
        "status": ticket.status,
    }


def execute_dispatch_vendor(db: DBSession, inputs: dict) -> dict:
    vendor = _best_vendor(db, inputs["category"], inputs["tower"])
    if not vendor:
        return {
            "success": False,
            "message": f"No available vendor for category '{inputs['category']}' at '{inputs['tower']}'",
        }

    job_type = inputs["job_type"]
    job_id = inputs["job_id"]

    if job_type == "ticket":
        job = db.query(Ticket).filter(Ticket.id == job_id).first()
    else:
        job = db.query(WorkOrder).filter(WorkOrder.id == job_id).first()

    if job:
        job.vendor_id = vendor.id
        if job_type == "ticket":
            job.assigned_at = datetime.utcnow()
            job.status = "assigned"
        else:
            job.status = "in_progress"
        vendor.last_dispatched_at = datetime.utcnow()
        db.commit()

    return {
        "success": True,
        "vendor_id": vendor.id,
        "company_name": vendor.company_name,
        "score": vendor.score,
        "contact_phone": vendor.phone,
    }


def execute_get_quote(db: DBSession, inputs: dict) -> dict:
    rate_card = _load_rate_card()
    service_type = inputs["service_type"].lower().replace(" ", "_")
    specs = inputs.get("specifications", {})
    tower = (inputs.get("tower") or "").lower().replace(" ", "_")

    surcharge = rate_card.get("tower_access_surcharge", {})
    multiplier = surcharge.get(tower, surcharge.get("default", 1.0))

    services = rate_card.get("services", {})
    service = services.get(service_type)

    if not service:
        # Try partial match
        for key in services:
            if key in service_type or service_type in key:
                service = services[key]
                service_type = key
                break

    if not service:
        return {"error": f"Service type '{inputs['service_type']}' not found in rate card"}

    line_items = []
    total = 0.0

    if service_type == "digital_display":
        size = specs.get("size", "43_inch")
        size_key = size.replace('"', "_inch").replace(" ", "_").lower()
        tier = service.get(size_key, service.get("43_inch", {}))
        hw = tier.get("hardware_kd", 0)
        inst = tier.get("installation_kd", 0)
        line_items.append({"item": f"Display unit ({size})", "amount_kd": hw})
        line_items.append({"item": "Installation", "amount_kd": inst})
        total += hw + inst
        if specs.get("cms"):
            cms = service.get("cms_addon_kd", 0)
            line_items.append({"item": "CMS add-on", "amount_kd": cms})
            total += cms
        access = service.get("tower_access_fee_kd", 0)
        if access:
            line_items.append({"item": "Tower access fee", "amount_kd": access})
            total += access

    elif service_type == "signage":
        placement = specs.get("placement", "door_sign").lower().replace(" ", "_")
        tier = service.get(placement, service.get("door_sign", {}))
        for k, v in tier.items():
            label = k.replace("_kd", "").replace("_", " ").title()
            line_items.append({"item": label, "amount_kd": v})
            total += v

    elif service_type == "cctv":
        cameras = int(specs.get("cameras", 2))
        include_nvr = specs.get("nvr", True)
        cam_cost = service["per_camera_kd"] * cameras
        cable_cost = service["cabling_per_camera_kd"] * cameras
        inst_cost = service["installation_kd"]
        line_items.append({"item": f"Cameras x{cameras}", "amount_kd": cam_cost})
        line_items.append({"item": "Cabling", "amount_kd": cable_cost})
        line_items.append({"item": "Installation", "amount_kd": inst_cost})
        total += cam_cost + cable_cost + inst_cost
        if include_nvr:
            nvr = service["nvr_kd"]
            line_items.append({"item": "NVR unit", "amount_kd": nvr})
            total += nvr

    elif service_type == "lighting":
        fixtures = int(specs.get("fixtures", 4))
        include_wiring = specs.get("wiring", True)
        include_design = specs.get("design", False)
        fix_cost = service["per_fixture_kd"] * fixtures
        line_items.append({"item": f"Fixtures x{fixtures}", "amount_kd": fix_cost})
        total += fix_cost
        if include_wiring:
            w = service["wiring_kd"]
            line_items.append({"item": "Wiring", "amount_kd": w})
            total += w
        if include_design:
            d = service["design_kd"]
            line_items.append({"item": "Design", "amount_kd": d})
            total += d

    elif service_type == "partition":
        sqm = float(specs.get("sqm", 10))
        include_door = specs.get("door", False)
        include_finishing = specs.get("finishing", True)
        part_cost = service["per_sqm_kd"] * sqm
        line_items.append({"item": f"Partition ({sqm} sqm)", "amount_kd": part_cost})
        total += part_cost
        if include_door:
            d = service["door_kd"]
            line_items.append({"item": "Door", "amount_kd": d})
            total += d
        if include_finishing:
            f = service["finishing_kd"]
            line_items.append({"item": "Finishing", "amount_kd": f})
            total += f
    else:
        # Generic fallback: sum all numeric KD values in the service dict
        for k, v in service.items():
            if isinstance(v, (int, float)) and k.endswith("_kd"):
                label = k.replace("_kd", "").replace("_", " ").title()
                line_items.append({"item": label, "amount_kd": v})
                total += v

    # Apply tower surcharge
    if multiplier != 1.0:
        surcharge_amt = round(total * (multiplier - 1.0), 3)
        line_items.append({"item": "Tower surcharge", "amount_kd": surcharge_amt})
        total += surcharge_amt

    total = round(total, 3)
    auto_approved = total <= rate_card.get("auto_approval_threshold_kd", settings.auto_approval_threshold_kd)

    return {
        "service_type": service_type,
        "line_items": line_items,
        "total_kd": total,
        "auto_approved": auto_approved,
        "approval_threshold_kd": rate_card.get("auto_approval_threshold_kd", settings.auto_approval_threshold_kd),
    }


def execute_create_work_order(db: DBSession, inputs: dict) -> dict:
    ref = _next_ref(db, WorkOrder, "FS")
    threshold = _load_rate_card().get("auto_approval_threshold_kd", settings.auto_approval_threshold_kd)
    amount = inputs["quote_amount"]
    approval_status = "auto_approved" if amount <= threshold else "pending_approval"

    wo = WorkOrder(
        ref_number=ref,
        session_id=inputs.get("session_id"),
        tenant_name=inputs.get("tenant_name"),
        tower=inputs.get("tower"),
        floor=inputs.get("floor"),
        service_type=inputs["service_type"],
        specification=json.dumps(inputs.get("specification") or {}),
        quote_amount=amount,
        quote_breakdown=json.dumps(inputs.get("quote_breakdown") or {}),
        approval_status=approval_status,
        status=approval_status,
    )
    db.add(wo)
    db.commit()
    db.refresh(wo)

    if approval_status == "auto_approved":
        vendor = _best_vendor(db, inputs["service_type"], inputs.get("tower", ""))
        if vendor:
            wo.vendor_id = vendor.id
            wo.status = "in_progress"
            vendor.last_dispatched_at = datetime.utcnow()
            db.commit()

    return {
        "work_order_id": wo.id,
        "ref_number": wo.ref_number,
        "quote_amount_kd": wo.quote_amount,
        "approval_status": wo.approval_status,
        "status": wo.status,
    }


def execute_register_vendor(db: DBSession, inputs: dict) -> dict:
    vendor = Vendor(
        company_name=inputs["company_name"],
        category=json.dumps(inputs.get("categories", [])),
        towers_covered=json.dumps(inputs.get("towers_covered", ["all"])),
        contact_name=inputs["contact_name"],
        phone=inputs["phone"],
        email=inputs.get("email"),
        trade_licence=inputs.get("trade_licence"),
        score=70,
        status="onboarding",
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    # Re-use the vendor id to generate a VAP reference
    vap_ref = f"VAP-{vendor.id:04d}"
    return {
        "vendor_id": vendor.id,
        "vap_ref": vap_ref,
        "company_name": vendor.company_name,
        "initial_score": 70,
        "status": "onboarding",
    }


def execute_generate_briefing(db: DBSession, inputs: dict) -> dict:
    """
    Pull operational data and return a structured payload for the briefing generator.
    The actual NL text is composed by agent/agent.py using Claude.
    """
    from datetime import timezone
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    open_tickets = db.query(Ticket).filter(Ticket.status.notin_(["closed", "completed"])).all()
    p1 = [t for t in open_tickets if t.priority == "P1"]
    p2 = [t for t in open_tickets if t.priority == "P2"]
    p3 = [t for t in open_tickets if t.priority == "P3"]

    completed_tickets = db.query(Ticket).filter(Ticket.status.in_(["closed", "completed"])).all()
    on_time = [t for t in completed_tickets if t.completed_at and t.sla_deadline and t.completed_at <= t.sla_deadline]
    sla_compliance = round(len(on_time) / len(completed_tickets) * 100, 1) if completed_tickets else 100.0

    # Average TAT for last 24h
    recent = [t for t in completed_tickets if t.completed_at and t.completed_at >= now - timedelta(hours=24)]
    if recent:
        tats = [(t.completed_at - t.created_at).total_seconds() / 3600 for t in recent]
        avg_tat = round(sum(tats) / len(tats), 1)
    else:
        avg_tat = 0.0

    from models.lead import Lead as LeadModel
    hot_leads = db.query(LeadModel).filter(LeadModel.score_tier == "hot").all()
    warm_leads = db.query(LeadModel).filter(LeadModel.score_tier == "warm").all()

    vendors = db.query(Vendor).filter(Vendor.status == "active").all()
    avg_vendor_score = round(sum(v.score for v in vendors) / len(vendors), 1) if vendors else 0
    below_threshold = [v for v in vendors if v.score < 60]

    wo_7d = db.query(WorkOrder).filter(
        WorkOrder.status.in_(["completed", "auto_approved", "approved"]),
        WorkOrder.created_at >= now - timedelta(days=7),
    ).all()
    service_revenue_7d = sum(w.quote_amount for w in wo_7d)

    alerts = []
    for t in p1:
        age_hrs = (now - t.created_at).total_seconds() / 3600
        if age_hrs > 2:
            alerts.append({
                "severity": "critical",
                "entity_type": "ticket",
                "entity_id": t.id,
                "message": f"P1 ticket {t.ref_number}: {t.category} at {t.tower} Floor {t.floor}. Open {round(age_hrs, 1)} hours.",
                "action_label": "Reassign vendor",
                "action_endpoint": f"PATCH /api/tickets/{t.id}/vendor",
            })

    for lead in hot_leads:
        age_hrs = (now - lead.created_at).total_seconds() / 3600
        if age_hrs > 18 and not lead.assigned_to:
            alerts.append({
                "severity": "warning",
                "entity_type": "lead",
                "entity_id": lead.id,
                "message": f"Hot lead {lead.name} (score {lead.score}, {lead.specialty}) — no follow-up in {round(age_hrs, 1)} hours.",
                "action_label": "Assign to rep",
                "action_endpoint": f"PATCH /api/leads/{lead.id}/assign",
            })

    for v in below_threshold:
        alerts.append({
            "severity": "warning",
            "entity_type": "vendor",
            "entity_id": v.id,
            "message": f"Vendor {v.company_name} score {v.score} is below threshold (60). Review performance.",
            "action_label": "View vendor",
            "action_endpoint": f"GET /api/vendors/{v.id}",
        })

    if service_revenue_7d > 0:
        alerts.append({
            "severity": "info",
            "entity_type": "revenue",
            "entity_id": None,
            "message": f"Service revenue KD {service_revenue_7d:,.0f} logged this week.",
            "action_label": "View report",
            "action_endpoint": "GET /api/dashboard/stats",
        })

    return {
        "period": inputs.get("period", "daily"),
        "open_tickets": len(open_tickets),
        "p1_count": len(p1),
        "p2_count": len(p2),
        "p3_count": len(p3),
        "sla_compliance_pct": sla_compliance,
        "avg_tat_hours": avg_tat,
        "hot_leads": len(hot_leads),
        "warm_leads": len(warm_leads),
        "active_vendors": len(vendors),
        "avg_vendor_score": avg_vendor_score,
        "below_threshold_vendors": len(below_threshold),
        "service_revenue_7d_kd": round(service_revenue_7d, 3),
        "alerts": alerts,
    }


def execute_get_dashboard_stats(db: DBSession, inputs: dict) -> dict:
    from models.session import Session as SessionModel
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tower_filter = inputs.get("tower_filter")

    ticket_q = db.query(Ticket)
    if tower_filter:
        ticket_q = ticket_q.filter(Ticket.tower.ilike(f"%{tower_filter}%"))

    open_tickets = ticket_q.filter(Ticket.status.notin_(["closed", "completed"])).all()
    completed_tickets = ticket_q.filter(Ticket.status.in_(["closed", "completed"])).all()

    on_time = [t for t in completed_tickets if t.completed_at and t.sla_deadline and t.completed_at <= t.sla_deadline]
    sla_compliance = round(len(on_time) / len(completed_tickets) * 100, 1) if completed_tickets else 100.0

    tats = [
        (t.completed_at - t.created_at).total_seconds() / 3600
        for t in completed_tickets
        if t.completed_at
    ]
    avg_tat = round(sum(tats) / len(tats), 1) if tats else 0.0

    from models.lead import Lead as LeadModel
    lead_count = db.query(LeadModel).filter(LeadModel.status.notin_(["closed_won", "closed_lost"])).count()
    active_vendors = db.query(Vendor).filter(Vendor.status == "active").count()
    chat_sessions_today = db.query(SessionModel).filter(SessionModel.created_at >= today_start).count()

    # Tickets by tower
    from sqlalchemy import func
    tower_counts = (
        db.query(Ticket.tower, func.count(Ticket.id))
        .filter(Ticket.status.notin_(["closed", "completed"]))
        .group_by(Ticket.tower)
        .all()
    )
    tickets_by_tower = [{"tower": t, "count": c} for t, c in tower_counts]

    # Leads by tier
    hot = db.query(LeadModel).filter(LeadModel.score_tier == "hot").count()
    warm = db.query(LeadModel).filter(LeadModel.score_tier == "warm").count()
    cold = db.query(LeadModel).filter(LeadModel.score_tier == "cold").count()

    # Tickets by priority
    p1 = sum(1 for t in open_tickets if t.priority == "P1")
    p2 = sum(1 for t in open_tickets if t.priority == "P2")
    p3 = sum(1 for t in open_tickets if t.priority == "P3")

    return {
        "open_tickets": len(open_tickets),
        "avg_tat_hours": avg_tat,
        "lead_pipeline_count": lead_count,
        "active_vendors": active_vendors,
        "chat_sessions_today": chat_sessions_today,
        "sla_compliance_pct": sla_compliance,
        "tickets_by_tower": tickets_by_tower,
        "leads_by_score_tier": {"hot": hot, "warm": warm, "cold": cold},
        "tickets_by_priority": {"P1": p1, "P2": p2, "P3": p3},
    }


# ──────────────────────────────────────────────────────────────────────────────
# Dispatcher — routes tool name → implementation
# ──────────────────────────────────────────────────────────────────────────────

TOOL_HANDLERS = {
    "create_lead": execute_create_lead,
    "score_lead": execute_score_lead,
    "create_ticket": execute_create_ticket,
    "dispatch_vendor": execute_dispatch_vendor,
    "get_quote": execute_get_quote,
    "create_work_order": execute_create_work_order,
    "register_vendor": execute_register_vendor,
    "generate_briefing": execute_generate_briefing,
    "get_dashboard_stats": execute_get_dashboard_stats,
}


def execute_tool(tool_name: str, tool_inputs: dict, db: DBSession) -> Any:
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        return {"error": f"Unknown tool: {tool_name}"}
    return handler(db, tool_inputs)
