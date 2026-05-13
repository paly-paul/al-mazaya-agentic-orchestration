# Mazaya Clinics — API Reference
**Version:** 1.0  
**Date:** May 2025  
**Base URL:** `http://localhost:8000`

---

## Overview

The Mazaya FM backend is a FastAPI application. FastAPI auto-generates interactive API documentation from the code:

| Interface | URL | Description |
|---|---|---|
| Swagger UI | `http://localhost:8000/docs` | Interactive OpenAPI explorer; try any endpoint in-browser |
| ReDoc | `http://localhost:8000/redoc` | Clean, readable API reference |
| Raw OpenAPI JSON | `http://localhost:8000/openapi.json` | Machine-readable spec for code generation |

The OpenAPI spec is generated automatically from route decorators, Pydantic schemas, and docstrings. No additional configuration is required — FastAPI serves `/docs` and `/redoc` out of the box.

---

## Authentication

| Endpoint group | Authentication |
|---|---|
| `POST /api/chat` | None |
| `GET /api/chat/sessions/{id}` | None |
| `WebSocket /ws/chat/{id}` | None |
| All other `/api/*` endpoints | Bearer JWT in `Authorization` header |

**Admin JWT header:**
```
Authorization: Bearer <token>
```

Admin tokens are signed with `SECRET_KEY` (see Environment Variables). The PoC uses a static shared secret for simplicity; production should use proper JWT issuance with expiry and refresh.

---

## Response Envelope

All REST responses use a consistent envelope:

```json
{
  "success": true,
  "data": <payload>,
  "error": null
}
```

On error:
```json
{
  "success": false,
  "data": null,
  "error": "Human-readable error message"
}
```

---

## Error Codes

| HTTP Status | Meaning | When it occurs |
|---|---|---|
| `200` | OK | Successful GET / PATCH |
| `201` | Created | Successful POST that creates a resource |
| `400` | Bad Request | Missing required field, invalid enum value, or business logic rejection |
| `401` | Unauthorized | Missing or invalid `Authorization` header on admin endpoints |
| `403` | Forbidden | Token present but insufficient role |
| `404` | Not Found | Resource ID does not exist |
| `409` | Conflict | Duplicate record (e.g., vendor with same trade licence) |
| `422` | Unprocessable Entity | FastAPI/Pydantic validation failure (field type mismatch, constraint violated) |
| `500` | Internal Server Error | Unhandled exception; check backend logs |

**422 Validation error format (FastAPI standard):**
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Chat Endpoints

Authentication: **None required**

---

### POST /api/chat

Send a message to the AI agent.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | `string` (UUID) | Yes | Client-generated UUID. Create once per conversation; reuse for all subsequent messages |
| `message` | `string` | Yes | User message text |
| `language` | `"en" \| "ar"` | No | Response language. Defaults to `"en"` |
| `use_case_hint` | `string \| null` | No | Hint to help intent routing. One of `"enquiry"`, `"maintenance"`, `"facility"`, `"vendor"`, `"management"` |

**Example request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "I want to enquire about renting a clinic space",
  "language": "en",
  "use_case_hint": "enquiry"
}
```

**Response body (`data` field):**

| Field | Type | Description |
|---|---|---|
| `session_id` | `string` | Echo of the request session_id |
| `message` | `string` | Agent text response |
| `quick_replies` | `string[]` | Suggested reply buttons for the frontend to render |
| `structured_output` | `object \| null` | Machine-readable output when the agent completes a structured action |
| `actions_taken` | `array` | List of tools the agent called during this turn |

**`structured_output` shape:**

| Field | Type | Description |
|---|---|---|
| `type` | `"lead_score" \| "quote" \| "ticket_ref" \| "vendor_ref" \| null` | Output type identifier |
| `payload` | `object` | Type-specific payload (see below) |

**`structured_output.payload` by type:**

`lead_score`:
```json
{
  "lead_id": 42,
  "score": 82,
  "tier": "hot",
  "breakdown": {
    "specialty_match": 30,
    "budget_fit": 25,
    "timeline_urgency": 20,
    "tower_availability": 7
  }
}
```

`quote`:
```json
{
  "work_order_ref": "FS-0443",
  "service_type": "digital_display",
  "line_items": [
    {"description": "55\" LED screen", "amount_kd": 240},
    {"description": "CMS add-on", "amount_kd": 60},
    {"description": "Installation", "amount_kd": 45},
    {"description": "Tower access fee", "amount_kd": 35}
  ],
  "total_kd": 380,
  "auto_approved": true
}
```

`ticket_ref`:
```json
{
  "ticket_id": 2407,
  "ref": "MX-2407",
  "priority": "P2",
  "sla_deadline": "2025-05-14T16:00:00Z",
  "vendor_assigned": "Gulf Plumb Co."
}
```

`vendor_ref`:
```json
{
  "vendor_id": 90,
  "ref": "VAP-0090",
  "status": "onboarding"
}
```

**`actions_taken` item shape:**

| Field | Type | Description |
|---|---|---|
| `tool` | `string` | Tool name called by the agent |
| `result` | `object` | Tool execution result |

**Full example response:**
```json
{
  "success": true,
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Great news! Based on your requirements, your lead score is 82/100 — that puts you in our Hot tier. Our team will contact you within 2 hours to arrange a viewing.",
    "quick_replies": ["Schedule a viewing", "Learn more about Clinic III", "Ask another question"],
    "structured_output": {
      "type": "lead_score",
      "payload": {
        "lead_id": 42,
        "score": 82,
        "tier": "hot",
        "breakdown": {
          "specialty_match": 30,
          "budget_fit": 25,
          "timeline_urgency": 20,
          "tower_availability": 7
        }
      }
    },
    "actions_taken": [
      {"tool": "create_lead", "result": {"lead_id": 42}},
      {"tool": "score_lead", "result": {"score": 82, "tier": "hot"}}
    ]
  },
  "error": null
}
```

---

### WebSocket /ws/chat/{session_id}

Streaming chat for real-time token-by-token delivery.

**Connection URL:** `ws://localhost:8000/ws/chat/{session_id}`

Authentication: None.

#### Protocol

**Client → Server (JSON message):**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | `string` | Yes | User message text |
| `language` | `"en" \| "ar"` | No | Session language |

```json
{"message": "I have an HVAC problem on floor 7", "language": "en"}
```

**Server → Client (Server-Sent Events format over WebSocket):**

During streaming the server emits token chunks:
```
data: {"token": "I"}\n\n
data: {"token": " understand"}\n\n
data: {"token": " you"}\n\n
data: {"token": " have"}\n\n
```

When streaming is complete:
```
data: {"done": true, "quick_replies": ["P1 - Fire/Flood/Gas", "P2 - HVAC/Electrical", "P3 - Routine"], "actions_taken": [], "structured_output": null}\n\n
```

When a tool was called and produced structured output:
```
data: {"done": true, "quick_replies": ["View ticket status", "Report another issue"], "actions_taken": [{"tool": "create_ticket", "result": {"ticket_id": 2407, "ref": "MX-2407", "priority": "P2"}}], "structured_output": {"type": "ticket_ref", "payload": {"ticket_id": 2407, "ref": "MX-2407", "priority": "P2", "sla_deadline": "2025-05-14T16:00:00Z", "vendor_assigned": "Gulf Plumb Co."}}}\n\n
```

**Error event:**
```
data: {"error": "Session expired or invalid"}\n\n
```

---

### GET /api/chat/sessions/{session_id}

Retrieve full conversation history for a session.

Authentication: None.

**Path parameter:** `session_id` — UUID string

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "use_case": "enquiry",
    "language": "en",
    "state": "active",
    "created_at": "2025-05-14T07:45:00Z",
    "messages": [
      {
        "role": "user",
        "content": "I want to enquire about renting a clinic space",
        "created_at": "2025-05-14T07:45:01Z"
      },
      {
        "role": "assistant",
        "content": "Welcome to Mazaya Clinics! I'd be happy to help you find the right space...",
        "created_at": "2025-05-14T07:45:02Z"
      }
    ]
  },
  "error": null
}
```

---

## Lead Endpoints

Authentication: **Bearer JWT required**

---

### GET /api/leads

Get all leads with optional filters.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `score_tier` | `"hot" \| "warm" \| "cold"` | Filter by lead tier |
| `status` | `string` | Filter by status (see status values below) |
| `tower` | `string` | Filter by tower preference |
| `source` | `"web_chat" \| "whatsapp" \| "email" \| "hotline"` | Filter by lead source |
| `assigned_to` | `string` | Filter by assigned rep name |
| `from_date` | `string` (ISO 8601) | Created at or after this date |
| `to_date` | `string` (ISO 8601) | Created before or at this date |
| `format` | `"json" \| "csv"` | Response format. Defaults to `"json"` |

**Lead status values:** `follow_up_due`, `meeting_set`, `proposal_sent`, `nurture`, `cold_outreach`, `closed_won`, `closed_lost`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "Dr. Al-Farsi",
      "phone": "+96512345678",
      "specialty": "Cardiology",
      "clinic_size": "medium",
      "tower_preference": "Clinic III",
      "budget_range": "1200-1800 KD/mo",
      "timeline": "within_1_month",
      "source": "web_chat",
      "score": 82,
      "tier": "hot",
      "status": "follow_up_due",
      "assigned_to": null,
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-05-14T07:45:00Z",
      "updated_at": "2025-05-14T07:46:00Z"
    }
  ],
  "error": null
}
```

When `format=csv` the response is a CSV file download (`Content-Type: text/csv`).

---

### GET /api/leads/{id}

Get a single lead with full conversation transcript.

**Path parameter:** `id` — integer

**Response:** Single lead object (same shape as list item above) plus a `transcript` array of messages from the originating chat session.

---

### PATCH /api/leads/{id}/assign

Assign a lead to a sales rep.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `assigned_to` | `string` | Yes | Rep name or identifier |

```json
{"assigned_to": "Ahmed K."}
```

**Response:** Updated lead object.

---

### PATCH /api/leads/{id}/status

Update lead pipeline status.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | `string` | Yes | One of: `follow_up_due`, `meeting_set`, `proposal_sent`, `nurture`, `cold_outreach`, `closed_won`, `closed_lost` |

```json
{"status": "meeting_set"}
```

**Response:** Updated lead object.

---

## Ticket Endpoints

Authentication: **Bearer JWT required**

---

### GET /api/tickets

Get all maintenance tickets.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `priority` | `"P1" \| "P2" \| "P3"` | Filter by priority |
| `status` | `string` | Filter by status (see below) |
| `tower` | `string` | Filter by tower |
| `category` | `string` | Filter by maintenance category |
| `from_date` | `string` (ISO 8601) | Created at or after |
| `include_closed` | `boolean` | Include completed tickets. Defaults to `false` |

**Ticket status values:** `open`, `dispatched`, `en_route`, `in_progress`, `pending_vendor`, `sla_breach`, `completed`, `closed`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2407,
      "ref": "MX-2407",
      "tower": "Clinic IV",
      "floor": "9",
      "clinic_number": "9-02",
      "category": "hvac",
      "priority": "P2",
      "description": "Air conditioning unit not cooling. Temperature 32°C.",
      "status": "in_progress",
      "vendor_id": 5,
      "vendor_name": "Gulf Plumb Co.",
      "sla_deadline": "2025-05-14T16:00:00Z",
      "sla_remaining_minutes": 435,
      "session_id": "abc-123",
      "created_at": "2025-05-14T08:00:00Z",
      "updated_at": "2025-05-14T08:15:00Z"
    }
  ],
  "error": null
}
```

---

### GET /api/tickets/{id}

Get a single ticket with full chat transcript and status timeline.

**Path parameter:** `id` — integer

**Response:** Single ticket object plus `transcript` (chat messages) and `timeline` (array of status-change events with timestamps).

---

### PATCH /api/tickets/{id}/vendor

Reassign the vendor for a ticket.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `vendor_id` | `integer` | Yes | ID of the replacement vendor |

```json
{"vendor_id": 12}
```

Side effect: the previous vendor is notified of de-assignment; the new vendor receives the job card in the admin panel. The SLA clock continues (it is not reset by default).

**Response:** Updated ticket object.

---

### PATCH /api/tickets/{id}/priority

Escalate or change ticket priority.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `priority` | `"P1" \| "P2" \| "P3"` | Yes | New priority level |

```json
{"priority": "P1"}
```

Side effect: SLA deadline is recalculated from the time of escalation.

**Response:** Updated ticket object.

---

### PATCH /api/tickets/{id}/close

Manually close a ticket.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `resolution_note` | `string` | Yes | Description of how the issue was resolved |

```json
{"resolution_note": "HVAC unit serviced by Gulf Plumb Co., cooling restored."}
```

**Response:** Updated ticket object with `status: "closed"`.

---

## Work Order Endpoints

Authentication: **Bearer JWT required**

---

### GET /api/work-orders

Get all facility service work orders.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | `string` | Filter by status |
| `tower` | `string` | Filter by tower |
| `service_type` | `string` | Filter by service category |

**Work order status values:** `pending_approval`, `approved`, `in_progress`, `completed`, `cancelled`, `rejected`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 443,
      "ref": "FS-0443",
      "session_id": "abc-123",
      "tenant_name": "Dr. Hassan",
      "tower": "Clinic IV",
      "floor": "7",
      "service_type": "digital_display",
      "specification": {
        "size": "55_inch",
        "cms_addon": true
      },
      "quote_amount_kd": 380,
      "quote_breakdown": {
        "hardware_kd": 240,
        "cms_addon_kd": 60,
        "installation_kd": 45,
        "tower_access_fee_kd": 35
      },
      "status": "in_progress",
      "auto_approved": true,
      "approved_by": null,
      "vendor_id": 7,
      "vendor_name": "Bright Signs Kuwait",
      "created_at": "2025-05-14T09:00:00Z",
      "updated_at": "2025-05-14T09:05:00Z"
    }
  ],
  "error": null
}
```

---

### GET /api/work-orders/{id}

Get a single work order with full chat transcript.

**Path parameter:** `id` — integer

**Response:** Single work order object (same shape as list item above) plus `transcript`.

---

### PATCH /api/work-orders/{id}/approve

Approve a pending work order (FM manager action).

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `approved_by` | `string` | Yes | Name of the approver |

```json
{"approved_by": "FM Manager"}
```

Side effect: vendor is automatically dispatched on approval.

**Response:** Updated work order object with `status: "approved"`.

---

### PATCH /api/work-orders/{id}/reject

Reject a pending work order.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `rejected_by` | `string` | Yes | Name of the reviewer |
| `reason` | `string` | Yes | Rejection reason shown to the tenant |

```json
{"rejected_by": "FM Manager", "reason": "Tower access scheduled maintenance conflicts with installation window. Please resubmit after 20 May."}
```

**Response:** Updated work order object with `status: "rejected"`.

---

## Vendor Endpoints

Authentication: **Bearer JWT required**

---

### GET /api/vendors

Get all empaneled vendors.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | `"active" \| "onboarding" \| "suspended" \| "below_threshold"` | Filter by status |
| `category` | `string` | Filter by service category |
| `tower` | `string` | Filter by tower coverage |
| `min_score` | `integer` | Minimum performance score filter |
| `format` | `"json" \| "csv"` | Response format |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "ref": "VAP-0005",
      "company_name": "Gulf Plumb Co.",
      "categories": ["plumbing", "hvac"],
      "towers_covered": ["Clinic III", "Clinic IV", "Clinic V"],
      "contact_name": "Khalid Al-Rashidi",
      "phone": "+96566001234",
      "email": "khalid@gulfplumb.com",
      "trade_licence": "KW-TL-2024-09821",
      "score": 92,
      "status": "active",
      "jobs_30d": 14,
      "created_at": "2024-11-01T00:00:00Z",
      "updated_at": "2025-05-13T16:00:00Z"
    }
  ],
  "error": null
}
```

---

### POST /api/vendors

Manually create a vendor record (admin panel form).

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `company_name` | `string` | Yes | Legal company name |
| `categories` | `string[]` | Yes | Service categories. Valid values: `hvac`, `electrical`, `plumbing`, `lift`, `fire`, `medical_gas`, `civil`, `cleaning`, `pest`, `signage`, `cctv`, `lighting`, `partition`, `digital_display` |
| `towers_covered` | `string[]` | Yes | Tower names or `["all"]` |
| `contact_name` | `string` | Yes | Primary contact name |
| `phone` | `string` | Yes | Contact phone (international format) |
| `email` | `string` | No | Contact email |
| `trade_licence` | `string` | No | Kuwait trade licence number |

```json
{
  "company_name": "Al-Ameen Technical Services",
  "categories": ["electrical", "lighting"],
  "towers_covered": ["all"],
  "contact_name": "Faris Al-Ameen",
  "phone": "+96550123456",
  "email": "faris@alameen-tech.com",
  "trade_licence": "KW-TL-2024-44501"
}
```

**Response:** Created vendor object with initial `score: 70` and `status: "onboarding"`.

---

### GET /api/vendors/{id}

Get vendor detail including per-job performance history.

**Path parameter:** `id` — integer

**Response:** Single vendor object (same as list item) plus:
- `score_history`: array of `{date, score, reason}` events
- `job_history`: array of completed jobs with outcomes

---

### PATCH /api/vendors/{id}/status

Update vendor status.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | `string` | Yes | One of: `active`, `onboarding`, `suspended` |

```json
{"status": "active"}
```

**Response:** Updated vendor object.

---

### GET /api/vendors/dispatch

Get the best available vendor for a job. Used internally by the agent; also callable directly for manual dispatch decisions.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `category` | `string` | Yes | Service category |
| `tower` | `string` | Yes | Tower where work is needed |
| `exclude_ids` | `string` | No | Comma-separated vendor IDs to skip (e.g. previously unresponsive) |

**Response:**
```json
{
  "success": true,
  "data": {
    "vendor_id": 5,
    "ref": "VAP-0005",
    "company_name": "Gulf Plumb Co.",
    "score": 92,
    "contact_name": "Khalid Al-Rashidi",
    "contact_phone": "+96566001234"
  },
  "error": null
}
```

Returns `404` if no eligible vendor is found for the given criteria.

---

## Dashboard & Analytics Endpoints

Authentication: **Bearer JWT required**

---

### GET /api/dashboard/stats

Get all operational KPIs for the dashboard.

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
      {"tower": "Clinic I", "count": 2},
      {"tower": "Clinic II", "count": 3},
      {"tower": "Clinic III", "count": 7},
      {"tower": "Clinic IV", "count": 5},
      {"tower": "Clinic V", "count": 2},
      {"tower": "Clinic VI", "count": 1},
      {"tower": "Clinic VII", "count": 2},
      {"tower": "Clinic VIII", "count": 1}
    ],
    "leads_by_score_tier": {
      "hot": 4,
      "warm": 7,
      "cold": 1
    },
    "tickets_by_priority": {
      "P1": 2,
      "P2": 8,
      "P3": 13
    }
  },
  "error": null
}
```

---

### GET /api/dashboard/live-chats

Get active and recent chat sessions for the Live Chats admin page.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "display_name": "Dr. Al-Farsi",
      "last_message_preview": "I want to know more about the lease terms",
      "last_message_at": "2025-05-14T09:42:00Z",
      "inferred_intent": "enquiry",
      "channel": "web_chat",
      "language": "en",
      "state": "active"
    }
  ],
  "error": null
}
```

---

## Briefing Endpoints

Authentication: **Bearer JWT required**

---

### GET /api/briefing/latest

Get the most recent management briefing.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "period": "daily",
    "generated_at": "2025-05-14T08:00:00Z",
    "briefing_en": "Good morning. Here is your operational summary for Wednesday 14 May 2025. There are 23 open maintenance tickets across 8 towers. Two P1 issues require immediate attention...",
    "briefing_ar": "صباح الخير. إليكم ملخص العمليات ليوم الأربعاء 14 مايو 2025...",
    "alerts": [
      {
        "severity": "critical",
        "entity_type": "ticket",
        "entity_id": 2401,
        "message": "P1 ticket MX-2401: HVAC failure at Clinic IV Floor 9. Vendor unresponsive 3.5 hours.",
        "action_label": "Reassign vendor",
        "action_endpoint": "PATCH /api/tickets/2401/vendor"
      },
      {
        "severity": "warning",
        "entity_type": "lead",
        "entity_id": 42,
        "message": "Hot lead Dr. Al-Farsi (Cardiology, score 87) — no sales follow-up in 18 hours.",
        "action_label": "Assign to Ahmed K.",
        "action_endpoint": "PATCH /api/leads/42/assign"
      },
      {
        "severity": "info",
        "entity_type": "report",
        "entity_id": null,
        "message": "Service revenue KD 4,280 logged this week.",
        "action_label": "View report",
        "action_endpoint": "GET /api/dashboard/stats"
      }
    ]
  },
  "error": null
}
```

**Alert severity values:** `critical`, `warning`, `info`

**Alert entity_type values:** `ticket`, `lead`, `work_order`, `vendor`, `report`

---

### POST /api/briefing/generate

Trigger manual briefing generation outside the scheduled run.

Authentication: **Bearer JWT required**

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `period` | `"daily" \| "weekly"` | Yes | Briefing period |
| `language` | `"en" \| "ar"` | No | Defaults to `"en"` (both languages are always generated) |

```json
{"period": "daily", "language": "en"}
```

**Response:** Newly generated briefing object (same shape as `GET /api/briefing/latest`).

---

## Rate Card JSON Structure

The rate card is stored at `backend/data/rate_card.json` and drives all facility service quotes generated by the agent.

```json
{
  "auto_approval_threshold_kd": 500,
  "services": {
    "digital_display": {
      "32_inch":  { "hardware_kd": 160, "installation_kd": 35 },
      "43_inch":  { "hardware_kd": 200, "installation_kd": 35 },
      "55_inch":  { "hardware_kd": 240, "installation_kd": 45 },
      "cms_addon_kd": 60,
      "tower_access_fee_kd": 35
    },
    "signage": {
      "door_sign":      { "design_kd": 40, "print_kd": 30, "install_kd": 25 },
      "waiting_area":   { "design_kd": 60, "print_kd": 80, "install_kd": 40 },
      "lobby_directory":{ "design_kd": 80, "install_kd": 60 }
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

**Key fields:**

| Field | Description |
|---|---|
| `auto_approval_threshold_kd` | Quotes at or below this value (KD) are auto-approved without FM manager review. Overridden by `AUTO_APPROVAL_THRESHOLD_KD` env var |
| `services` | Nested object keyed by service type, then by sub-type or size |
| `tower_access_surcharge` | Multipliers applied to the total quote per tower. Used to price in access complexity |

To update pricing, edit `rate_card.json` and restart the backend. No code change required.

---

## Environment Variable Reference

```bash
# ─── Anthropic ────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=your_key_here
# Required. Obtain from console.anthropic.com

CLAUDE_MODEL=claude-sonnet-4-6
# Optional. Defaults to claude-sonnet-4-6

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=sqlite:///./mazaya_fm.db
# PoC default. For production use PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/mazaya_fm

# ─── Application ──────────────────────────────────────────────────────────────
SECRET_KEY=your_jwt_secret_here
# Required. Used to sign admin JWT tokens. Generate with: openssl rand -hex 32

CORS_ORIGINS=http://localhost:3000,http://localhost:3001
# Comma-separated list of allowed frontend origins

TIMEZONE=Asia/Kuwait
# Used by APScheduler for cron job scheduling

# ─── Agent thresholds ─────────────────────────────────────────────────────────
AUTO_APPROVAL_THRESHOLD_KD=500
# Work orders at or below this amount are auto-approved

LEAD_SCORE_HOT_THRESHOLD=70
# Leads with score >= this value are classified as "hot"

LEAD_SCORE_WARM_THRESHOLD=40
# Leads with score >= this value (and < hot threshold) are "warm"; below = "cold"

VENDOR_DISPATCH_TIMEOUT_MINUTES=30
# How long to wait for vendor acceptance before escalating to next vendor

# ─── SLA hours ────────────────────────────────────────────────────────────────
P1_SLA_HOURS=2
# P1 Critical: fire, flood, gas leak — must be resolved within 2 hours

P2_SLA_HOURS=8
# P2 Operational: HVAC, electrical — resolved within 8 hours

P3_SLA_HOURS=48
# P3 Routine: civil, cleaning, pest — resolved within 48 hours

# ─── Briefing schedule (cron format) ──────────────────────────────────────────
BRIEFING_DAILY_CRON="0 8 * * *"
# Runs daily at 08:00 Kuwait time (UTC+3)

BRIEFING_WEEKLY_CRON="0 9 * * 1"
# Runs every Monday at 09:00 Kuwait time
```

---

## Agent Tool Schemas

The following tools are passed to Claude as function definitions. They are executed by the Python backend when Claude emits a `tool_use` block.

### create_lead

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | `string` | Yes | Chat session UUID |
| `name` | `string` | Yes | Prospect name |
| `phone` | `string` | Yes | Contact phone |
| `specialty` | `string` | Yes | Medical specialty |
| `clinic_size` | `"small" \| "medium" \| "large" \| "unknown"` | No | |
| `tower_preference` | `string` | No | Preferred tower name |
| `budget_range` | `string` | No | Monthly budget in KD |
| `timeline` | `string` | No | One of: `within_1_month`, `1_3_months`, `3_6_months`, `just_exploring` |
| `source` | `"web_chat" \| "whatsapp" \| "email" \| "hotline"` | No | |

### score_lead

| Field | Type | Required | Description |
|---|---|---|---|
| `lead_id` | `integer` | Yes | Lead ID from `create_lead` result |
| `specialty` | `string` | No | |
| `tower_preference` | `string` | No | |
| `budget_range` | `string` | No | |
| `timeline` | `string` | No | |
| `clinic_size` | `string` | No | |

### create_ticket

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | `string` | Yes | |
| `tower` | `string` | Yes | Tower name |
| `floor` | `string` | Yes | Floor number |
| `category` | `string` | Yes | One of: `hvac`, `electrical`, `plumbing`, `lift`, `fire`, `medical_gas`, `civil`, `cleaning`, `pest`, `other` |
| `description` | `string` | Yes | Free-text issue description |
| `tenant_name` | `string` | No | |
| `clinic_number` | `string` | No | |

### dispatch_vendor

| Field | Type | Required | Description |
|---|---|---|---|
| `job_id` | `integer` | Yes | Ticket or work order ID |
| `job_type` | `"ticket" \| "work_order"` | Yes | |
| `category` | `string` | Yes | Service category |
| `tower` | `string` | Yes | |
| `priority` | `"P1" \| "P2" \| "P3"` | No | |

### get_quote

| Field | Type | Required | Description |
|---|---|---|---|
| `service_type` | `string` | Yes | Service type key matching rate card |
| `specifications` | `object` | Yes | Service-specific spec fields |
| `tower` | `string` | No | Used to apply tower access surcharge |

### create_work_order

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | `string` | Yes | |
| `service_type` | `string` | Yes | |
| `quote_amount` | `number` | Yes | Total quote in KD |
| `tenant_name` | `string` | No | |
| `tower` | `string` | No | |
| `floor` | `string` | No | |
| `specification` | `object` | No | Service specifications |
| `quote_breakdown` | `object` | No | Line-item breakdown |

### register_vendor

| Field | Type | Required | Description |
|---|---|---|---|
| `company_name` | `string` | Yes | |
| `categories` | `string[]` | Yes | |
| `contact_name` | `string` | Yes | |
| `phone` | `string` | Yes | |
| `towers_covered` | `string[]` | No | |
| `email` | `string` | No | |
| `trade_licence` | `string` | No | |

### generate_briefing

| Field | Type | Required | Description |
|---|---|---|---|
| `period` | `"daily" \| "weekly"` | Yes | |
| `language` | `"en" \| "ar"` | No | |

### get_dashboard_stats

| Field | Type | Required | Description |
|---|---|---|---|
| `tower_filter` | `string` | No | Filter stats to a specific tower |
