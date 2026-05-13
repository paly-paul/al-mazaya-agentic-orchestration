# Admin Panel User Journey, Backend Architecture & API Documentation
## Mazaya Clinics — Agentic Facility Manager PoC

**Document ID:** MZ-TECH-001  
**Version:** 1.0  
**Date:** May 2025

---

## Part 1 — Admin Panel User Journey

### 1.1 Admin Panel Design Principles

- **Theme:** Light — white (#FFFFFF) and off-white (#F8F7F4) backgrounds
- **Brand accent:** Mazaya green (#005B41) for sidebar active state, badges, CTAs, and key metrics
- **Typography:** Clean sans-serif; section labels in uppercase, 11px, letter-spaced
- **Data density:** Tables are the primary format; no heavy card-based layouts
- **Navigation:** Left fixed sidebar, 220px wide, always visible
- **Status indicators:** Colour-coded badges (green = active/completed, amber = pending/warning, red = critical/overdue)

---

### 1.2 Admin User Personas

| Role | Primary Pages Used | Key Actions |
|---|---|---|
| FM Manager | Tickets, Facility Services, Vendors, AI Briefing | Approve quotes, reassign vendors, review vendor scores |
| Sales / Leasing | Lead Pipeline | View qualified leads, update status, assign to reps |
| Operations Executive | Dashboard, Tickets, Vendors | Monitor KPIs, track open tickets, dispatch vendors |
| Management (CEO) | Dashboard, AI Briefing | Read daily digest, action critical alerts |
| System Administrator | All pages | Full access, user management |

---

### 1.3 Admin Panel Navigation Structure

```
Sidebar
├── [Logo: Mazaya FM | Operations Console]
├── Overview
│   ├── Dashboard (default landing page)
│   └── AI Briefing  [badge: unread alerts count]
├── Operations
│   ├── Lead Pipeline  [badge: open leads count]
│   ├── Maintenance Tickets  [badge: open P1+P2 count, red if P1 exists]
│   ├── Facility Services
│   └── Vendor Registry
└── Analytics
    ├── Live Chats
    └── Reports
```

---

### 1.4 Page-by-Page User Journey

#### Dashboard

**Purpose:** Single-pane view of operational health across all 8 towers.

**User arrives at:** Default page on login.

```
User sees:
  Row 1 — 6 metric cards:
    [ Open Tickets ] [ Avg TAT (hrs) ] [ Lead Pipeline ] [ Active Vendors ] [ Chat Sessions ] [ SLA Compliance % ]

  Row 2 — Two side-by-side bar charts:
    Left: "Ticket volume by tower" — horizontal bars per clinic
    Right: "Lead score distribution" (Hot / Warm / Cold) + "Ticket priority breakdown" (P1 / P2 / P3)

User actions:
  → Click any metric card → navigates to the relevant detail page
  → Click a bar in "Ticket volume" chart → opens Tickets page filtered to that tower
  → Click "Lead score" bar → opens Lead Pipeline page filtered by score tier
```

---

#### AI Briefing

**Purpose:** Daily and weekly management digest with actionable items.

**User arrives at:** Via sidebar, or via notification badge.

```
User sees:
  Briefing card (Mazaya green left border):
    [ Daily briefing timestamp ]
    [ Natural language summary: open tickets, SLA status, lead pipeline, vendor issues ]

  Below briefing card — Alert list:
    Each alert card is colour-coded by severity:
      🔴 Critical (red): P1 breach, vendor unresponsive, P1 ticket > SLA
      🟡 Warning (amber): Lead overdue follow-up, vendor below threshold, approval pending
      🔵 Info (blue): Service revenue update, week-over-week improvement

  Each alert card has:
    [ Alert icon ] [ Alert text with bolded key entities ] [ One-click action button ]

  Action buttons (examples):
    "Reassign vendor" → opens a modal to select replacement vendor → calls PATCH /api/tickets/{id}/vendor
    "Assign lead to rep" → opens a modal to select rep → calls PATCH /api/leads/{id}/assign
    "Approve quote" → calls PATCH /api/work-orders/{id}/approve
    "Dismiss" → marks alert as read, removes from briefing

User actions:
  → Read briefing (daily habit for management)
  → Click action button on any alert → modal opens → confirm → API called → alert dismissed
  → Scroll to view all alerts for the current day
```

---

#### Lead Pipeline

**Purpose:** View and manage all AI-qualified leads from the chat agent.

```
User sees:
  Top row — 4 metric cards:
    [ Hot leads ] [ Warm leads ] [ Average score ] [ Conversion rate (30d) ]

  Main table: "All leads"
  Columns: Name | Specialty | Tower preference | Score | Source | Status | Assigned | Created
  
  Score displayed as number with colour:
    ≥ 70: green text
    40–69: amber text
    < 40: grey text
  
  Source badges: WhatsApp (blue), Web Form (grey), Email (grey)
  Status badges: Follow-up due (amber), Meeting set (green), Proposal sent (green),
                  Nurture sequence (amber), Cold outreach (grey)

User actions:
  → Click any row → opens lead detail modal (full conversation transcript, all captured fields, timeline)
  → Click "Assign" on a row → dropdown to select rep → calls PATCH /api/leads/{id}/assign
  → Click "Update status" → dropdown with status options → calls PATCH /api/leads/{id}/status
  → "Export CSV" button → calls GET /api/leads?format=csv
  → Filter bar: filter by tower, score tier, source, status, date range
```

---

#### Maintenance Tickets

**Purpose:** Real-time view of all maintenance requests across all towers with SLA tracking.

```
User sees:
  Top row — 4 metric cards:
    [ P1 Critical ] [ P2 Urgent ] [ P3 Routine ] [ Avg TAT ]

  Main table: "Open tickets"
  Columns: Ref | Tower · Floor | Category | Priority | Vendor | Status | SLA remaining

  Priority indicators:
    🔴 P1 (red dot): 2-hour SLA
    🟡 P2 (amber dot): 8-hour SLA
    🟢 P3 (green dot): 48-hour SLA
  
  SLA column:
    Green text: > 50% time remaining
    Amber text: < 50% time remaining
    Red text: overdue

  Status badges:
    Unresponsive (red), En route (amber), In progress (green), Scheduled (green),
    Pending schedule (grey), Completed (green)

User actions:
  → Click any row → opens ticket detail modal:
      Full chat transcript for this ticket
      Vendor contact details
      Timeline of status changes
      "Reassign vendor" button
      "Escalate to P1" button (for P2 tickets)
      "Close ticket" button (manual override)
  → "Reassign vendor" → calls PATCH /api/tickets/{id}/vendor with new vendor_id
  → "Filter by tower" → tower multi-select filter
  → "Filter by priority" → P1/P2/P3 checkboxes
  → Toggle: "Open only" / "All (incl. completed)"
```

---

#### Facility Services

**Purpose:** Manage add-on service work orders from tenant requests.

```
User sees:
  Top row — 4 metric cards:
    [ Open requests ] [ Completed (7d) ] [ Revenue (7d) in KD ] [ Avg quote time ]

  Main table: "Service requests"
  Columns: Ref | Clinic / Tower | Service type | Quote (KD) | Status | Vendor

  Status badges:
    In progress (green), Pending approval (amber), Completed (green), Cancelled (grey)

User actions:
  → Click "Pending approval" row → opens approval modal:
      Full specification details
      Quote breakdown
      "Approve" button → calls PATCH /api/work-orders/{id}/approve
      "Reject" button → calls PATCH /api/work-orders/{id}/reject (with reason)
  → Click any row → work order detail with full chat transcript and vendor assignment
  → Manual "Create work order" button → opens form to create non-chat-originated requests
```

---

#### Vendor Registry

**Purpose:** Manage the empaneled vendor pool with performance scores.

```
User sees:
  Top row — 4 metric cards:
    [ Total vendors ] [ Onboarding ] [ Below threshold (score < 60) ] [ Average score ]

  Main table: "Empaneled vendors"
  Columns: Vendor | Category | Towers | Score | Jobs (30d) | Status

  Score column: numeric + visual bar (green ≥ 70, amber 50–69, red < 50)
  Status badges: Active (green), Onboarding (amber), Below threshold (red), Suspended (grey)

User actions:
  → "+ Onboard new vendor" button → opens manual registration form → calls POST /api/vendors
  → Click any vendor row → opens vendor detail:
      Company info and contact details
      Category and tower coverage
      Performance history: per-job outcomes with timestamps
      Score history chart
      "Suspend vendor" button → calls PATCH /api/vendors/{id}/status
      "Reset score" button (admin only) → calls PATCH /api/vendors/{id}/score
  → Bulk export → GET /api/vendors?format=csv
```

---

#### Live Chats

**Purpose:** Real-time visibility of active and recent chat sessions.

```
User sees:
  Left column: "Active sessions" list
    Each item: avatar emoji, user name (or "Anonymous"), last message preview, time
    Clicking opens the full chat transcript view
  
  Right column: Two charts:
    "Today's channel breakdown" bar chart (WhatsApp, Web chat, Email)
    "Intent classification" bar chart (Maintenance, Lead/enquiry, Facility svc, Vendor, Other)

User actions:
  → Click any active session → opens read-only transcript panel
  → "Hand off to human" button (future Phase 2 feature, shown as disabled in PoC)
```

---

#### Reports

**Purpose:** Weekly and monthly operational analytics.

```
User sees:
  Top row — 4 metric cards:
    [ Leads this week ] [ Tickets resolved ] [ Service revenue (KD) ] [ Avg vendor score ]

  Two side-by-side charts:
    Left: "Weekly ticket resolution rate" — bars by day of week
    Right: "Lead conversion funnel" — bars: Enquiries → Qualified → Proposal → Converted

User actions:
  → Date range picker → updates all charts and metrics
  → "Export to CSV" → downloads report data
  → "Push to Power BI" button (Phase 2, shown as disabled in PoC)
```

---

## Part 2 — Backend Python Architecture

### 2.1 Technology Stack

| Component | Technology |
|---|---|
| Web framework | FastAPI (Python 3.11+) |
| LLM | Anthropic Claude claude-sonnet-4-6 via Messages API |
| Agent pattern | Tool-use (function calling) with multi-turn conversation history |
| Database (PoC) | SQLite via SQLAlchemy ORM (PostgreSQL-compatible schema) |
| Task scheduling | APScheduler (async, for UC-05 briefing) |
| WebSocket / streaming | FastAPI WebSocket for real-time chat streaming |
| Environment config | python-dotenv |
| Containerisation | Docker + Docker Compose |
| CORS | FastAPI CORSMiddleware |

---

### 2.2 Project Structure

```
mazaya-fm-poc/
├── backend/
│   ├── main.py                    # FastAPI app entry point, CORS, router registration
│   ├── config.py                  # Settings from environment variables
│   ├── database.py                # SQLAlchemy engine, Base, session factory
│   ├── models/
│   │   ├── lead.py                # Lead ORM model
│   │   ├── ticket.py              # Ticket ORM model
│   │   ├── work_order.py          # Work order ORM model
│   │   ├── vendor.py              # Vendor ORM model
│   │   ├── message.py             # Message ORM model
│   │   └── session.py             # Chat session ORM model
│   ├── schemas/
│   │   ├── lead.py                # Pydantic schemas for leads
│   │   ├── ticket.py              # Pydantic schemas for tickets
│   │   ├── work_order.py          # Pydantic schemas for work orders
│   │   ├── vendor.py              # Pydantic schemas for vendors
│   │   └── chat.py                # Pydantic schemas for chat messages
│   ├── routers/
│   │   ├── chat.py                # POST /api/chat + WebSocket /ws/chat
│   │   ├── leads.py               # CRUD for leads
│   │   ├── tickets.py             # CRUD for tickets
│   │   ├── work_orders.py         # CRUD for work orders
│   │   ├── vendors.py             # CRUD for vendors
│   │   ├── dashboard.py           # GET /api/dashboard/stats
│   │   └── briefing.py            # GET /api/briefing/latest + POST /api/briefing/generate
│   ├── agent/
│   │   ├── agent.py               # Main agent orchestrator (Anthropic API calls)
│   │   ├── tools.py               # All agent tool definitions (schema + implementation)
│   │   ├── prompts.py             # System prompts in English and Arabic
│   │   ├── scoring.py             # Lead scoring logic
│   │   └── scheduler.py           # APScheduler tasks for UC-05 briefing
│   ├── data/
│   │   └── rate_card.json         # Configurable rate card for facility services
│   ├── migrations/
│   │   └── init_db.py             # Creates all tables on first run
│   └── requirements.txt
├── frontend/
│   ├── website/                   # Next.js public website
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx     # Chat popup component
│   │   │   ├── NavBar.tsx
│   │   │   ├── ClinicCard.tsx
│   │   │   └── Footer.tsx
│   │   └── ...
│   └── admin/                     # Next.js admin panel
│       ├── app/
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── MetricCard.tsx
│       │   ├── TicketTable.tsx
│       │   ├── LeadTable.tsx
│       │   ├── VendorTable.tsx
│       │   └── BriefingCard.tsx
│       └── ...
├── docker-compose.yml
└── .env.example
```

---

### 2.3 Agent Architecture

The agent uses Claude claude-sonnet-4-6's tool-use capability. On each chat message:

1. Frontend sends the message and session_id to `POST /api/chat`
2. Backend loads conversation history for the session from the database
3. Backend calls the Anthropic Messages API with:
   - The system prompt (EN or AR based on session language)
   - The full conversation history
   - The set of available tools
4. Claude returns either a text response or a tool_use block
5. If tool_use: the backend executes the corresponding Python function, appends the tool_result, and calls Claude again
6. Final text response is saved to the messages table and returned to the frontend

**Agent Tools (tool definitions passed to Claude):**

```python
# tools.py — all tool schemas

create_lead = {
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
            "source": {"type": "string", "enum": ["web_chat", "whatsapp", "email", "hotline"]}
        },
        "required": ["session_id", "name", "phone", "specialty"]
    }
}

score_lead = {
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
            "clinic_size": {"type": "string"}
        },
        "required": ["lead_id"]
    }
}

create_ticket = {
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
            "category": {"type": "string", "enum": ["hvac", "electrical", "plumbing", "lift", "fire", "medical_gas", "civil", "cleaning", "pest", "other"]},
            "description": {"type": "string"}
        },
        "required": ["session_id", "tower", "floor", "category", "description"]
    }
}

dispatch_vendor = {
    "name": "dispatch_vendor",
    "description": "Select and dispatch the best available vendor for a ticket or work order.",
    "input_schema": {
        "type": "object",
        "properties": {
            "job_id": {"type": "integer"},
            "job_type": {"type": "string", "enum": ["ticket", "work_order"]},
            "category": {"type": "string"},
            "tower": {"type": "string"},
            "priority": {"type": "string", "enum": ["P1", "P2", "P3"]}
        },
        "required": ["job_id", "job_type", "category", "tower"]
    }
}

get_quote = {
    "name": "get_quote",
    "description": "Generate a service quote from the rate card based on service specifications.",
    "input_schema": {
        "type": "object",
        "properties": {
            "service_type": {"type": "string"},
            "specifications": {"type": "object"},
            "tower": {"type": "string"}
        },
        "required": ["service_type", "specifications"]
    }
}

create_work_order = {
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
            "quote_breakdown": {"type": "object"}
        },
        "required": ["session_id", "service_type", "quote_amount"]
    }
}

register_vendor = {
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
            "trade_licence": {"type": "string"}
        },
        "required": ["company_name", "categories", "contact_name", "phone"]
    }
}

generate_briefing = {
    "name": "generate_briefing",
    "description": "Generate the daily management briefing from current operational data.",
    "input_schema": {
        "type": "object",
        "properties": {
            "period": {"type": "string", "enum": ["daily", "weekly"]},
            "language": {"type": "string", "enum": ["en", "ar"]}
        },
        "required": ["period"]
    }
}

get_dashboard_stats = {
    "name": "get_dashboard_stats",
    "description": "Retrieve current operational KPIs for the dashboard.",
    "input_schema": {
        "type": "object",
        "properties": {
            "tower_filter": {"type": "string", "description": "Optional tower name to filter by"}
        }
    }
}
```

---

### 2.4 Lead Scoring Logic

```python
# scoring.py

SCORE_WEIGHTS = {
    "specialty_match": 30,     # Does the tower have this specialty available?
    "budget_fit": 25,          # Does budget match tower pricing band?
    "timeline_urgency": 25,    # How soon do they need space?
    "tower_availability": 20   # Is space available at preferred tower?
}

TIMELINE_SCORES = {
    "within_1_month": 25,
    "1_3_months": 20,
    "3_6_months": 10,
    "just_exploring": 5
}

BUDGET_BANDS = {
    "clinic_iii": {"min": 1200, "max": 3000},  # KD/mo
    "clinic_iv":  {"min": 900,  "max": 2000},
    # etc.
}

def calculate_lead_score(specialty, tower_preference, budget_range, timeline, clinic_size) -> dict:
    score = 0
    breakdown = {}
    
    # specialty_match: 0, 15, or 30
    # budget_fit: 0, 12, or 25
    # timeline_urgency: from TIMELINE_SCORES lookup
    # tower_availability: 0 or 20 (from live availability check)
    
    tier = "hot" if score >= 70 else "warm" if score >= 40 else "cold"
    return {"score": score, "tier": tier, "breakdown": breakdown}
```

---

### 2.5 Rate Card Configuration

```json
// data/rate_card.json
{
  "auto_approval_threshold_kd": 500,
  "services": {
    "digital_display": {
      "32_inch": { "hardware_kd": 160, "installation_kd": 35 },
      "43_inch": { "hardware_kd": 200, "installation_kd": 35 },
      "55_inch": { "hardware_kd": 240, "installation_kd": 45 },
      "cms_addon_kd": 60,
      "tower_access_fee_kd": 35
    },
    "signage": {
      "door_sign": { "design_kd": 40, "print_kd": 30, "install_kd": 25 },
      "waiting_area": { "design_kd": 60, "print_kd": 80, "install_kd": 40 },
      "lobby_directory": { "design_kd": 80, "install_kd": 60 }
    },
    "cctv": {
      "per_camera_kd": 85,
      "nvr_kd": 180,
      "cabling_per_camera_kd": 25,
      "installation_kd": 50
    },
    "lighting": {
      "per_fixture_kd": 35,
      "wiring_kd": 45,
      "design_kd": 30
    },
    "partition": {
      "per_sqm_kd": 55,
      "door_kd": 120,
      "finishing_kd": 30
    }
  },
  "tower_access_surcharge": {
    "clinic_vi_tower_a": 1.1,
    "default": 1.0
  }
}
```

---

## Part 3 — API Documentation

**Base URL (PoC):** `http://localhost:8000`  
**Authentication:** Bearer token (JWT) for admin endpoints; none required for chat endpoints  
**Response envelope:** All responses use `{"success": bool, "data": any, "error": string|null}`

---

### 3.1 Chat Endpoints

#### POST /api/chat
Send a message to the AI agent.

**Request:**
```json
{
  "session_id": "string (UUID, created by client on first message)",
  "message": "string",
  "language": "en | ar",
  "use_case_hint": "enquiry | maintenance | facility | vendor | management | null"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "abc-123",
    "message": "string (agent response text)",
    "quick_replies": ["Option A", "Option B"],
    "structured_output": {
      "type": "lead_score | quote | ticket_ref | vendor_ref | null",
      "payload": {}
    },
    "actions_taken": [
      {"tool": "create_lead", "result": {"lead_id": 42, "score": 82, "tier": "hot"}}
    ]
  }
}
```

#### WebSocket /ws/chat/{session_id}
Streaming chat for real-time token-by-token delivery.

**Client sends:**
```json
{"message": "string", "language": "en"}
```

**Server streams:**
```
data: {"token": "Hello"}\n\n
data: {"token": "! I can"}\n\n
...
data: {"done": true, "quick_replies": [...], "actions_taken": [...]}\n\n
```

#### GET /api/chat/sessions/{session_id}
Get full conversation history for a session.

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "abc-123",
    "use_case": "enquiry",
    "language": "en",
    "messages": [
      {"role": "user", "content": "...", "created_at": "2025-05-14T08:00:00Z"},
      {"role": "assistant", "content": "...", "created_at": "2025-05-14T08:00:01Z"}
    ]
  }
}
```

---

### 3.2 Lead Endpoints

#### GET /api/leads
Get all leads with optional filters.

**Query params:** `score_tier`, `status`, `tower`, `source`, `assigned_to`, `from_date`, `to_date`, `format=csv`

**Response:** List of lead objects.

#### GET /api/leads/{id}
Get single lead detail.

#### PATCH /api/leads/{id}/assign
Assign lead to a team member.
```json
{"assigned_to": "Ahmed K."}
```

#### PATCH /api/leads/{id}/status
Update lead status.
```json
{"status": "meeting_set | proposal_sent | nurture | closed_won | closed_lost"}
```

---

### 3.3 Ticket Endpoints

#### GET /api/tickets
Get all tickets. Query params: `priority`, `status`, `tower`, `category`, `from_date`

#### GET /api/tickets/{id}
Get ticket detail including full chat transcript.

#### PATCH /api/tickets/{id}/vendor
Reassign vendor for a ticket.
```json
{"vendor_id": 12}
```
Side effect: new vendor notified via admin panel; SLA clock optionally reset.

#### PATCH /api/tickets/{id}/priority
Escalate ticket priority.
```json
{"priority": "P1"}
```

#### PATCH /api/tickets/{id}/close
Manually close a ticket with resolution note.
```json
{"resolution_note": "HVAC unit serviced, cooling restored."}
```

---

### 3.4 Work Order Endpoints

#### GET /api/work-orders
Get all work orders. Query params: `status`, `tower`, `service_type`

#### GET /api/work-orders/{id}
Get work order detail.

#### PATCH /api/work-orders/{id}/approve
Approve a pending work order (FM manager action).
```json
{"approved_by": "FM Manager Name"}
```
Side effect: agent dispatches vendor.

#### PATCH /api/work-orders/{id}/reject
Reject a work order with reason.
```json
{"rejected_by": "string", "reason": "string"}
```

---

### 3.5 Vendor Endpoints

#### GET /api/vendors
Get all vendors. Query params: `status`, `category`, `tower`, `min_score`

#### POST /api/vendors
Manually create a vendor record (admin panel action).
```json
{
  "company_name": "string",
  "categories": ["electrical"],
  "towers_covered": ["all"],
  "contact_name": "string",
  "phone": "string",
  "email": "string",
  "trade_licence": "string"
}
```

#### GET /api/vendors/{id}
Get vendor detail including job history and score breakdown.

#### PATCH /api/vendors/{id}/status
Update vendor status.
```json
{"status": "active | onboarding | suspended"}
```

#### GET /api/vendors/dispatch
Get best vendor for a job (used internally by agent dispatch tool).

**Query params:** `category`, `tower`, `exclude_ids` (comma-separated vendor IDs to skip)

**Response:**
```json
{
  "success": true,
  "data": {
    "vendor_id": 5,
    "company_name": "Gulf Plumb Co.",
    "score": 92,
    "contact_phone": "+965-XXXX"
  }
}
```

---

### 3.6 Dashboard & Analytics Endpoints

#### GET /api/dashboard/stats
Get all KPIs for the dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "open_tickets": 23,
    "avg_tat_hours": 4.2,
    "lead_pipeline_count": 12,
    "active_vendors": 34,
    "chat_sessions_today": 47,
    "sla_compliance_pct": 91,
    "tickets_by_tower": [
      {"tower": "Clinic III", "count": 7},
      {"tower": "Clinic IV", "count": 5}
    ],
    "leads_by_score_tier": {"hot": 4, "warm": 7, "cold": 1},
    "tickets_by_priority": {"P1": 2, "P2": 8, "P3": 13}
  }
}
```

#### GET /api/dashboard/live-chats
Get active chat sessions for the Live Chats page.

**Response:** List of session objects with last message and inferred intent.

---

### 3.7 Briefing Endpoints

#### GET /api/briefing/latest
Get the most recent management briefing.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "period": "daily",
    "generated_at": "2025-05-14T08:00:00Z",
    "briefing_en": "Good morning. Here is your operational summary...",
    "briefing_ar": "صباح الخير. إليكم ملخص العمليات...",
    "alerts": [
      {
        "severity": "critical",
        "entity_type": "ticket",
        "entity_id": 2401,
        "message": "P1 ticket MX-2401: HVAC failure at Clinic IV Floor 9. Vendor unresponsive 3.5 hours.",
        "action_label": "Reassign vendor",
        "action_endpoint": "PATCH /api/tickets/2401/vendor"
      }
    ]
  }
}
```

#### POST /api/briefing/generate
Trigger manual briefing generation (outside schedule).
```json
{"period": "daily", "language": "en"}
```

---

### 3.8 Environment Variables

```bash
# .env.example

# Anthropic
ANTHROPIC_API_KEY=your_key_here
CLAUDE_MODEL=claude-sonnet-4-6

# Database
DATABASE_URL=sqlite:///./mazaya_fm.db
# For production: DATABASE_URL=postgresql://user:pass@localhost/mazaya_fm

# Application
SECRET_KEY=your_jwt_secret_here
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
TIMEZONE=Asia/Kuwait

# Agent config
AUTO_APPROVAL_THRESHOLD_KD=500
LEAD_SCORE_HOT_THRESHOLD=70
LEAD_SCORE_WARM_THRESHOLD=40
VENDOR_DISPATCH_TIMEOUT_MINUTES=30
P1_SLA_HOURS=2
P2_SLA_HOURS=8
P3_SLA_HOURS=48

# Briefing schedule (cron format)
BRIEFING_DAILY_CRON=0 8 * * *       # 08:00 every day
BRIEFING_WEEKLY_CRON=0 9 * * 1      # 09:00 every Monday
```

---

### 3.9 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=sqlite:///./data/mazaya_fm.db
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  website:
    build: ./frontend/website
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  admin:
    build: ./frontend/admin
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_ADMIN_SECRET=${ADMIN_SECRET}
    depends_on:
      - backend
    restart: unless-stopped
```
