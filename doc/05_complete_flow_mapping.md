# Complete User Journey Flow Mapping
## Mazaya Clinics — Agentic Facility Manager PoC
### End-to-End System Flow

**Document ID:** MZ-FLOW-001  
**Version:** 1.0  
**Date:** May 2025

---

## 1. System Overview Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MAZAYA CLINICS SYSTEM                              │
│                                                                             │
│  ┌──────────────────────────┐      ┌──────────────────────────────────┐    │
│  │   PUBLIC WEBSITE         │      │   ADMIN OPERATIONS PANEL         │    │
│  │   (Next.js)              │      │   (Next.js — Light Theme)        │    │
│  │                          │      │                                  │    │
│  │  ┌──────────────────┐    │      │  Dashboard   │  AI Briefing      │    │
│  │  │  CHAT WIDGET     │    │      │  Lead Pipeline│  Maintenance      │    │
│  │  │  (popup modal)   │    │      │  Facility Svc │  Vendors          │    │
│  │  │  EN | عربي       │    │      │  Live Chats   │  Reports          │    │
│  │  └──────┬───────────┘    │      └──────────┬───────────────────────┘    │
│  └─────────┼────────────────┘                 │                            │
│            │                                  │                            │
│            ▼                                  ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  PYTHON BACKEND — FastAPI                           │   │
│  │                                                                     │   │
│  │   ┌──────────────────────────────────────────────────────────┐     │   │
│  │   │              AGENT ORCHESTRATOR                          │     │   │
│  │   │   Claude claude-sonnet-4-6 + Tool-use + Conversation history  │     │   │
│  │   │                                                          │     │   │
│  │   │  Tools:                                                  │     │   │
│  │   │  create_lead │ score_lead │ create_ticket │ dispatch_vendor │  │   │
│  │   │  get_quote │ create_work_order │ register_vendor          │     │   │
│  │   │  generate_briefing │ get_dashboard_stats                  │     │   │
│  │   └──────────────────────────────────────────────────────────┘     │   │
│  │                                                                     │   │
│  │   ┌────────────────┐   ┌────────────────┐   ┌──────────────────┐   │   │
│  │   │  Lead Scoring  │   │  Rate Card     │   │  Vendor Scoring  │   │   │
│  │   │  Engine        │   │  Engine (JSON) │   │  Engine          │   │   │
│  │   └────────────────┘   └────────────────┘   └──────────────────┘   │   │
│  │                                                                     │   │
│  │   ┌─────────────────────────────────────────────────────────────┐  │   │
│  │   │            SQLite DATABASE (PostgreSQL-ready)                │  │   │
│  │   │  leads │ tickets │ work_orders │ vendors │ messages │ sessions│  │   │
│  │   └─────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │   ┌──────────────────────────────┐                                 │   │
│  │   │  APScheduler                 │                                 │   │
│  │   │  Daily 08:00 │ Weekly Mon 09:00 → generate_briefing()          │   │
│  │   └──────────────────────────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. UC-01 — Lead Qualification: Complete Flow

```
ACTOR: Prospective Tenant (Doctor / Medical Group)

ENTRY POINTS:
  [A] Clicks "Enquire for Space" on a clinic card on the website
  [B] Clicks floating "Talk to Us" button and selects "Clinic space enquiry"
  [C] Types enquiry intent in free text (e.g. "I want to rent a clinic")

┌─────────────────────────────────────────────────────────────────────────────┐
│  WEBSITE                                                                    │
│                                                                             │
│  User lands on site → browses clinics → clicks CTA                         │
│        │                                                                   │
│        ▼                                                                   │
│  Chat widget opens (modal popup)                                            │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │ POST /api/chat  (session created)
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AGENT                                                                      │
│                                                                             │
│  Step 1: Greet + confirm intent                                             │
│  Step 2: Collect specialty (quick reply)                                    │
│  Step 3: Collect clinic size (quick reply)                                  │
│  Step 4: Collect tower / area preference (quick reply)                      │
│  Step 5: Collect budget range (quick reply)                                 │
│  Step 6: Collect timeline (quick reply)                                     │
│  Step 7: Collect name + phone (free text)                                   │
│                                                                             │
│  → Calls tool: create_lead(all fields)                                      │
│  → Calls tool: score_lead(lead_id, fields)                                  │
│       Scoring:                                                              │
│         specialty_match   0–30                                              │
│         budget_fit        0–25                                              │
│         timeline_urgency  0–25                                              │
│         tower_availability 0–20                                             │
│       Score → tier: HOT (≥70) | WARM (40–69) | COLD (<40)                  │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
        HOT              WARM             COLD
     Score ≥ 70        Score 40–69      Score < 40
          │                │                │
          ▼                ▼                ▼
   Lead record:       Lead record:     Lead record:
   status=HOT         status=WARM      status=COLD
   Notify sales       Nurture queue    Newsletter
   < 2 hr target      T+3 follow-up    30-day re-engage
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL — LEAD PIPELINE                                                │
│                                                                             │
│  New row appears in Lead Pipeline table                                     │
│  Badge on sidebar updates count                                             │
│  If HOT: AI Briefing alert generated: "New hot lead — action required"      │
│                                                                             │
│  FM/Sales team sees:                                                        │
│    Name, Specialty, Tower pref, Score (82), Source (web_chat), Status       │
│    → Clicks "Assign" → selects rep → PATCH /api/leads/{id}/assign           │
│    → Updates status as pipeline progresses                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
              USER (chat): Sees score card + best tower match + next step info
              Confirmation: "Ahmed K. will contact you within 2 hours."
```

---

## 3. UC-03 — Maintenance Request: Complete Flow

```
ACTOR: Existing Tenant (Doctor / Clinic Operator)

ENTRY POINTS:
  [A] Opens chat widget → selects "Report maintenance"
  [B] Navigates to Services → Maintenance page → opens chat

┌─────────────────────────────────────────────────────────────────────────────┐
│  CHAT WIDGET                                                                │
│                                                                             │
│  Step 1: Collect tower (quick reply: Clinic I–VIII)                         │
│  Step 2: Collect floor + clinic number (free text)                          │
│  Step 3: Collect issue type (quick reply: HVAC/Electrical/Plumbing/etc.)    │
│  Step 4: Collect description (free text)                                    │
│                                                                             │
│  → Calls tool: create_ticket(session_id, tower, floor, category, description)│
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
               PRIORITY CLASSIFICATION (backend):
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       P1 Critical      P2 Operational   P3 Routine
  (fire/flood/gas)   (HVAC/electrical)  (civil/cleaning)
    2-hour SLA          8-hour SLA       48-hour SLA
          │                │                │
          └────────────────┴────────────────┘
                           │
                           ▼
              Ticket created: ref MX-XXXX
              SLA deadline calculated and stored
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  VENDOR DISPATCH ENGINE                                                     │
│                                                                             │
│  → Calls tool: dispatch_vendor(ticket_id, category, tower, priority)        │
│                                                                             │
│  Selection logic:                                                           │
│    1. Filter vendors by: category match + tower coverage + status=active    │
│    2. Exclude vendors with score < 60 (configurable)                        │
│    3. Sort by: score DESC, then by last_job_timestamp ASC (least recently   │
│       dispatched first, for load balancing)                                 │
│    4. Select #1 → send job card notification (admin panel)                  │
│                                                                             │
│  ACCEPTANCE WINDOW: 30 minutes                                              │
│    → If vendor accepts (admin marks accepted): status → IN_PROGRESS         │
│    → If 30 min passes without acceptance:                                   │
│         Escalate: try next vendor in sorted list                            │
│         Alert to FM manager in AI Briefing                                  │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL — MAINTENANCE TICKETS                                          │
│                                                                             │
│  Ticket row appears:                                                        │
│    MX-2407 | Clinic IV · F9 | HVAC | P2 🟡 | Gulf Plumb Co. | Assigned    │
│    SLA: 7h 15m remaining                                                   │
│                                                                             │
│  FM team can:                                                               │
│    → View full chat transcript for context                                  │
│    → Reassign vendor (PATCH /api/tickets/{id}/vendor)                       │
│    → Escalate to P1 (PATCH /api/tickets/{id}/priority)                      │
│    → Manually close (PATCH /api/tickets/{id}/close)                         │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
              STATUS UPDATES TO TENANT (via chat or future WhatsApp):
                Update 1: "Ticket logged. Ref MX-2407. Vendor assigned."
                Update 2: "Vendor en route. ETA: 45 minutes."
                Update 3: "Job completed. Ticket closed."
                           │
                           ▼
              VENDOR SCORE UPDATED:
                On-time completion: score +5
                Late: score −10
                Complaint logged: score −20
                No-show: score −30
```

---

## 4. UC-02 — Facility Service Request: Complete Flow

```
ACTOR: Existing Tenant

ENTRY: Chat widget → "Request service" OR Services page → "Request Service" CTA

┌─────────────────────────────────────────────────────────────────────────────┐
│  CHAT WIDGET                                                                │
│                                                                             │
│  Step 1: Collect service type (quick reply)                                 │
│  Step 2: Collect specifications (conditional on type):                      │
│    LED screen → size + CMS option                                           │
│    Signage → placement + artwork availability                               │
│    CCTV → number of cameras + recording option                              │
│    Lighting → area + fixture type                                           │
│    Partition → dimensions + door required                                   │
│  Step 3: Collect timeline preference (quick reply)                          │
│                                                                             │
│  → Calls tool: get_quote(service_type, specifications, tower)               │
│       Reads from rate_card.json                                             │
│       Returns line-item breakdown + total                                   │
│                                                                             │
│  Displays quote to user:                                                    │
│    📋 FS-0443 | 55" LED + CMS | KD 380 | ✅ Auto-approved                  │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
    Quote ≤ KD 500                   Quote > KD 500
    (auto-approved)               (requires FM approval)
          │                                 │
          ▼                                 ▼
   User accepts →                  Status: PENDING_APPROVAL
   Order confirmed                 Admin panel alert appears
   → create_work_order()           FM manager reviews + clicks "Approve"
   → dispatch_vendor()             → create_work_order() called
          │                                 │
          └─────────────────┬───────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL — FACILITY SERVICES                                            │
│                                                                             │
│  FS-0443 | Dr. Hassan · IV F7 | LED 55" + CMS | KD 380 | In progress        │
│                                                                             │
│  If pending approval:                                                       │
│    FM manager sees alert in AI Briefing                                     │
│    Clicks "Approve" → work order status → APPROVED                          │
│    Vendor dispatched automatically                                          │
│                                                                             │
│  Revenue tracked: KD 380 added to "Service revenue (7d)" metric            │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              Vendor receives job card → completes work → closes via admin
              Tenant receives confirmation in chat
```

---

## 5. UC-04 — Vendor Onboarding + Dispatch: Complete Flow

```
ACTOR: New Vendor (registration) + Existing Vendor (job dispatch)

─────────────────────── PART A: ONBOARDING ───────────────────────

ENTRY: Website footer → "Vendor Registration" → chat opens

┌─────────────────────────────────────────────────────────────────────────────┐
│  CHAT WIDGET                                                                │
│                                                                             │
│  Step 1: Company name (free text)                                           │
│  Step 2: Service categories (multi-select quick replies)                    │
│  Step 3: Tower coverage (all or specific)                                   │
│  Step 4: Contact name + phone + email (free text)                           │
│  Step 5: Trade licence number (free text)                                   │
│                                                                             │
│  → Calls tool: register_vendor(all fields)                                  │
│       Initial score: 70/100                                                 │
│       Status: ONBOARDING                                                    │
│                                                                             │
│  Confirmation: "VAP-0090 created. FM team reviews within 24 hours."         │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL — VENDOR REGISTRY                                              │
│                                                                             │
│  New row: Al-Ameen Technical | Electrical | All towers | Score: 70 | Onboarding│
│                                                                             │
│  FM team:                                                                   │
│    → Reviews application                                                    │
│    → Verifies trade licence                                                 │
│    → Updates status to ACTIVE (PATCH /api/vendors/{id}/status)              │
└─────────────────────────────────────────────────────────────────────────────┘

─────────────────────── PART B: JOB DISPATCH ─────────────────────

TRIGGER: Ticket (UC-03) or Work Order (UC-02) requires vendor

┌─────────────────────────────────────────────────────────────────────────────┐
│  DISPATCH ENGINE (backend)                                                  │
│                                                                             │
│  dispatch_vendor(job_id, job_type, category, tower, priority)               │
│                                                                             │
│  1. Query vendors: category IN categories, tower IN towers_covered,         │
│                    status = "active", score >= threshold                    │
│  2. Sort: score DESC                                                        │
│  3. Select top vendor                                                       │
│  4. Create dispatch record: job_id, vendor_id, dispatched_at, deadline      │
│  5. Mark job: vendor_id assigned, status = DISPATCHED                      │
│                                                                             │
│  ACCEPTANCE MONITORING (30-minute window):                                  │
│    → APScheduler checks acceptance every 5 minutes                         │
│    → If not accepted at 30 min: try next vendor, alert FM manager           │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
              Vendor sees job in admin panel or receives notification
              Vendor accepts → job status: IN_PROGRESS
              Vendor completes → submits completion note → job status: COMPLETED
              Score updated automatically
```

---

## 6. UC-05 — Management Briefing: Complete Flow

```
ACTOR: Management (CEO / FM Manager)

TRIGGERS:
  [A] Scheduled: 08:00 daily (Kuwait time, UTC+3)
  [B] Scheduled: 09:00 every Monday (weekly summary)
  [C] Real-time: Any P1 ticket created → immediate partial briefing
  [D] Manual: "Generate briefing" button in admin panel

┌─────────────────────────────────────────────────────────────────────────────┐
│  SCHEDULER / TRIGGER                                                        │
│                                                                             │
│  APScheduler fires → calls generate_briefing(period="daily", language="en")│
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BRIEFING GENERATOR (backend)                                               │
│                                                                             │
│  1. Query database for current state:                                       │
│     → open tickets count, P1 count, P2 count                               │
│     → SLA compliance rate (completed on-time / total completed)             │
│     → avg TAT for last 24 hours                                             │
│     → lead pipeline: total, hot, warm, overdue follow-ups                  │
│     → vendor performance: avg score, below-threshold count                 │
│     → service revenue: last 7 days                                         │
│     → alerts: P1 tickets > 2 hrs old, vendors unresponsive, leads > 18 hrs │
│                                                                             │
│  2. Call Claude claude-sonnet-4-6 with all data as context:                       │
│     → Generate natural language briefing (EN + AR)                         │
│     → Structure alert items with severity and recommended actions           │
│                                                                             │
│  3. Store briefing record in database                                       │
│  4. Update admin panel via WebSocket push (or next poll)                    │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL — AI BRIEFING PAGE                                             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Daily Briefing · Wed 14 May 2025 · 08:00                             │  │
│  │                                                                      │  │
│  │ Good morning. 23 open tickets across 8 towers. Two P1 issues need   │  │
│  │ immediate attention: HVAC at Clinic IV F9 (vendor unresponsive       │  │
│  │ 3.5 hrs — escalation recommended). Lead pipeline has 4 hot leads;   │  │
│  │ Dr. Al-Farsi (Cardiology, score 87) has no sales follow-up in       │  │
│  │ 18 hours. SLA compliance: 91% (+6pts vs last week).                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [🔴 Critical] HVAC failure Clinic IV F9 — vendor unresponsive 3.5h        │
│                [ Reassign vendor → ]                                        │
│                                                                             │
│  [🟡 Warning] Hot lead Dr. Al-Farsi — no follow-up 18h                     │
│               [ Assign to Ahmed K. → ]                                     │
│                                                                             │
│  [🔵 Info] Service revenue KD 4,280 logged this week                       │
│            [ View report → ]                                                │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
              Management clicks an action button
                           │
                    Modal opens:
              "Reassign ticket MX-2401 to:"
              [ Gulf Plumb Co. (92) ] [ Kuwait Elec. Svcs (88) ] [ Cancel ]
                           │
              Management confirms
                           │
              PATCH /api/tickets/{id}/vendor → vendor reassigned
              Alert dismissed from briefing
              Ticket status updated
```

---

## 7. Cross-Use-Case Data Flow

```
USER (chat)                BACKEND                      ADMIN PANEL
    │                         │                              │
    │  POST /api/chat          │                              │
    ├─────────────────────────►│                              │
    │                         │  LLM processes message       │
    │                         │  → tool_use → Python fn      │
    │                         │  → DB write                  │
    │                         │                 DB read ─────►│
    │                         │                              │ (live data)
    │◄─────────────────────── │  Agent response              │
    │  (text + quick_replies   │                              │
    │  + structured_output)   │                              │
    │                         │                              │
    │ (ticket created)        │                   badge +1 ─►│
    │ (lead scored)           │             new table row ──►│
    │ (quote generated)       │         pending approval ───►│
    │ (vendor dispatched)     │          dispatch alert ────►│
    │                         │                              │
    │                         │◄─────────────────────────────│
    │                         │  PATCH /api/tickets/{id}     │
    │                         │  (admin action)              │
    │                         │                              │
    │◄────────────────────────│  Status update pushed back   │
    │  (if session active)    │  to open chat session        │
```

---

## 8. Complete Actor × Use Case Matrix

| | UC-01 Lead Qual. | UC-02 Facility Svc | UC-03 Maintenance | UC-04 Vendor | UC-05 Briefing |
|---|---|---|---|---|---|
| **Prospective tenant** | Primary actor | — | — | — | — |
| **Existing tenant** | — | Primary actor | Primary actor | — | — |
| **Vendor** | — | Receives job | Receives job | Primary actor | — |
| **Sales team** | Receives lead | — | — | — | Views pipeline |
| **FM Manager** | — | Approves quotes | Manages tickets | Manages registry | Primary actor |
| **Management** | Views pipeline | Views revenue | Views SLA | Views scores | Primary actor |
| **Agent (AI)** | Qualifies + scores | Gathers spec + quotes | Classifies + dispatches | Onboards + dispatches | Generates digest |
| **Backend tools** | create_lead, score_lead | get_quote, create_work_order | create_ticket, dispatch_vendor | register_vendor, dispatch_vendor | generate_briefing, get_dashboard_stats |

---

## 9. Error and Edge Case Flows

### No matching vendor available
```
dispatch_vendor() finds no vendor matching criteria
    → Ticket status: PENDING_VENDOR
    → AI Briefing alert: "No available vendor for [category] at [tower]. Manual dispatch required."
    → Admin panel badge turns red on Tickets nav item
    → FM manager manually selects vendor from full registry
```

### Vendor accepts but fails to complete within SLA
```
Ticket status: IN_PROGRESS but SLA deadline passed
    → Automated alert triggered: "SLA breach: MX-XXXX"
    → Ticket status → SLA_BREACH
    → Vendor score penalty: −10 (treated as late)
    → AI Briefing includes in next briefing + real-time alert for P1
```

### Tenant submits unclear maintenance request
```
Agent cannot classify issue type with confidence
    → Agent asks follow-up: "Could you describe the issue in more detail?"
    → If still unclear after 2 attempts: defaults to P3, category="other"
    → FM manager reviews via admin panel and reclassifies manually
```

### Quote over threshold, FM manager not available
```
Work order created with status PENDING_APPROVAL
    → No approval after 4 hours → AI Briefing escalation alert
    → If management admin role exists: secondary approval path enabled
    → Work order remains PENDING until approved; tenant informed of delay via chat
```

### Arabic session: tool outputs in wrong language
```
All tool output strings (agent messages, confirmations) are localised at the prompts.py level
System prompt instructs Claude to always respond in the session language
Structured outputs (ticket refs, score numbers) are language-neutral
```

---

## 10. Session State Machine

```
Session states:

NEW → ACTIVE → COMPLETED
         │
         ├── (timeout 30 min of inactivity) → EXPIRED
         │
         └── (user closes widget) → ENDED

Chat message flow within ACTIVE session:

INTENT_DETECTION → USE_CASE_SELECTED → DATA_COLLECTION → PROCESSING → CONFIRMED → FOLLOW_UP

States by use case:

UC-01:  GREETING → SPECIALTY → SIZE → LOCATION → BUDGET → TIMELINE → CONTACT → SCORED → DONE
UC-03:  GREETING → TOWER → FLOOR → ISSUE_TYPE → DESCRIPTION → CLASSIFIED → TICKET_CREATED → DONE
UC-02:  GREETING → SERVICE_TYPE → SPEC → QUOTE_GENERATED → ACCEPTANCE → WORK_ORDER → DONE
UC-04:  GREETING → COMPANY_NAME → CATEGORIES → TOWERS → CONTACT → LICENCE → REGISTERED → DONE
UC-05:  GREETING → PERIOD → DATA_PULLED → BRIEFING_GENERATED → ACTION_OPTIONS → DONE
```

---

## 11. Design System Reference (Website + Admin)

### Website (mazayaholding.com style)
| Element | Value |
|---|---|
| Primary green | #005B41 |
| Hover green | #004A36 |
| Top bar background | #1a1a1a |
| Navigation bar | #005B41 background, white text |
| Body background | #FFFFFF |
| Section backgrounds (alternating) | #FFFFFF / #F5F5F5 |
| Heading font | Georgia / serif |
| Body font | Arial / system sans-serif |
| CTA buttons | #005B41 background, white text, 4px radius |
| Card borders | #E0E0E0, 1px solid |
| Footer background | #1a1a1a |
| Footer text | #CCCCCC |

### Admin Panel (light theme)
| Element | Value |
|---|---|
| Page background | #F8F7F4 |
| Sidebar background | #FFFFFF |
| Sidebar border | #E8E5DF |
| Active nav item | #005B41 left border, #F0F8F5 background |
| Card background | #FFFFFF |
| Card border | #E8E5DF, 1px solid |
| Primary accent | #005B41 |
| Metric number colour | #1A1A18 |
| Muted text | #6B6B65 |
| P1 red | #A32D2D |
| P2 amber | #854F0B |
| P3 green | #0F6E56 |
| Badge active | #005B41 background, white text |
| Badge pending | #854F0B background, white text |
| Badge critical | #A32D2D background, white text |
| Table header | #F8F7F4 background, uppercase 11px |
| Table row hover | #F5F9F7 |

### Chat Widget
| Element | Value |
|---|---|
| Header background | #005B41 |
| User bubble | #005B41 background, white text |
| Agent bubble | #F8F7F4 background, dark text |
| Quick reply border | #E8E5DF → #005B41 on hover |
| Send button | #005B41 |
| Trigger button | #005B41, 56px circle, bottom-right |
