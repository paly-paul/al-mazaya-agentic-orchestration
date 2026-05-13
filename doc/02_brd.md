# Business Requirements Document (BRD)
## Mazaya Clinics — Agentic Facility Manager PoC

**Document ID:** MZ-BRD-001  
**Version:** 1.0  
**Status:** Draft for Review  
**Date:** May 2025  
**Client:** Al Mazaya Holding Co. KSCP  
**Project:** Agentic FM PoC — Mazaya Clinics, Kuwait

---

## 1. Executive Summary

Al Mazaya Holding Co. KSCP operates 8 purpose-built medical clinic towers across Kuwait under the Mazaya Clinics brand. The towers collectively house over 200 independent specialist clinic tenants. The company requires an AI-powered facility management system to automate lead qualification, tenant service requests, maintenance coordination, vendor management, and management reporting.

This PoC will deliver a functional, minimalistic system covering these five use cases through three components: a Mazaya-branded public website, a bilingual conversational chat agent, and a light-themed internal operations panel.

---

## 2. Business Context

### 2.1 Organisation

- **Entity:** Al Mazaya Holding Co. KSCP (dual-listed: Boursa Kuwait + Dubai Financial Market)
- **Founded:** 1998; operations as holding company from 2004
- **Group employees:** 94
- **Investment properties (Dec 2024):** KD 116,371,106
- **TTM Revenue (Dec 2025):** USD 38.5M
- **Revenue trend:** Declined 18.4% from 2023 to 2024

### 2.2 Mazaya Clinics Vertical

| Tower | Location | Floors | Clinics |
|---|---|---|---|
| Clinic I (Clover Centre) | Al Jabriya | Multi | 25+ |
| Clinic II | Sabah Al Salim | Multi | Multi |
| Clinic III | Bneid Al Gar | 25 | 72+ |
| Clinic IV | Hawally, 3rd Ring Road | 16 | 37 |
| Clinic V | Jabriya, 4th Ring Road | 19 | Multi |
| Clinic VI | Salmiya (Twin Towers) | 23+24 | Multi |
| Clinic VII | Jahra | 13 | Multi |
| Clinic VIII | Sabah Al Salem | Multi | Multi |

### 2.3 Current Technology Stack

| System | Tool | Status |
|---|---|---|
| CRM | Insightly (Android app confirmed) | Existing |
| BI / Reporting | Power BI | Existing |
| Ticketing | Manual (no system) | Gap |
| CAFM | None | Gap |
| WhatsApp | Manual (no Business API) | Gap |
| ERP | Unconfirmed | Unknown |
| Vendor management | Web form only | Gap |

---

## 3. Business Objectives

| ID | Objective | Priority |
|---|---|---|
| BO-01 | Reduce time-to-response for hot clinic space leads from 24–48 hrs to under 2 hours | Must Have |
| BO-02 | Create a tracked, SLA-bound maintenance system across all 8 towers | Must Have |
| BO-03 | Enable structured quoting and tracking for facility add-on services | Must Have |
| BO-04 | Build a scored, accountable empaneled vendor pool with automated dispatch | Must Have |
| BO-05 | Provide management with a daily AI-generated operational briefing | Must Have |
| BO-06 | Support Arabic and English throughout the tenant-facing experience | Must Have |
| BO-07 | Deliver all above on existing infrastructure without replacing Insightly or Power BI | Must Have |
| BO-08 | Design for Phase 2 WhatsApp Business API and Insightly write-back integration | Should Have |

---

## 4. Stakeholders

| Role | Responsibility | System Access |
|---|---|---|
| FM Manager | Approves high-value service quotes, reviews vendor scores, manages escalations | Admin panel — full access |
| Sales / Leasing team | Receives and acts on qualified leads | Admin panel — leads view |
| Operations team | Manages ticket queue, vendor dispatch | Admin panel — tickets + vendors |
| Management (CEO / Chairman) | Receives daily briefing, approves escalations | Admin panel — briefing + dashboard |
| Clinic tenant (doctor/clinic operator) | Raises maintenance requests, requests services, pays for add-ons | Website chat widget |
| Prospective tenant (doctor / group) | Enquires about clinic space | Website chat widget |
| Vendor / supplier | Receives job cards, submits completions, gets onboarded | Website vendor registration + admin |

---

## 5. Functional Requirements

### 5.1 Website (FR-WEB)

| ID | Requirement | Priority |
|---|---|---|
| FR-WEB-01 | Website must replicate the visual identity, navigation structure, and content hierarchy of mazayaholding.com | Must Have |
| FR-WEB-02 | Navigation must include: About Us, Operations (Clinics), Services, Investor Relations, Media Center, Contact Us | Must Have |
| FR-WEB-03 | Mazaya Clinic section must list all 8 towers with name, location, floors, number of clinics, and an Enquire CTA | Must Have |
| FR-WEB-04 | Language toggle (EN / AR) must switch full page content including direction (RTL for Arabic) | Must Have |
| FR-WEB-05 | A persistent floating chat button must appear on all pages | Must Have |
| FR-WEB-06 | Clicking the chat button must open the AI chat agent as a modal popup without page navigation | Must Have |
| FR-WEB-07 | Clicking "Enquire for Space" on a clinic card must open the chat agent pre-loaded to UC-01 flow | Must Have |
| FR-WEB-08 | Vendor registration form accessible from footer, routes to UC-04 onboarding flow | Must Have |
| FR-WEB-09 | Website must be responsive (mobile, tablet, desktop) | Must Have |
| FR-WEB-10 | All text content must be available in both English and Arabic | Should Have |

### 5.2 Chat Agent (FR-CHAT)

| ID | Requirement | Priority |
|---|---|---|
| FR-CHAT-01 | Agent must support English and Arabic; language switchable mid-session | Must Have |
| FR-CHAT-02 | Arabic mode must render full RTL layout in the chat UI | Must Have |
| FR-CHAT-03 | Agent must identify intent from the first user message and route to the appropriate use case flow | Must Have |
| FR-CHAT-04 | Agent must cover all 5 use cases: lead qualification, facility services, maintenance, vendor onboarding, management briefing | Must Have |
| FR-CHAT-05 | Quick-reply buttons must guide users through structured flows without requiring free-text | Must Have |
| FR-CHAT-06 | Agent must display a lead score (0–100) upon completing the UC-01 qualification flow | Must Have |
| FR-CHAT-07 | Agent must generate an itemised quote with total for UC-02 service requests | Must Have |
| FR-CHAT-08 | Agent must issue a ticket reference number (e.g. MX-XXXX) for UC-03 requests | Must Have |
| FR-CHAT-09 | Agent must confirm vendor application reference (e.g. VAP-XXXX) for UC-04 onboarding | Must Have |
| FR-CHAT-10 | Conversation state must be maintained for the full session | Must Have |
| FR-CHAT-11 | Typing indicators must display while the agent is generating a response | Must Have |
| FR-CHAT-12 | Agent responses must include structured summaries (score card, quote table, ticket details) | Must Have |
| FR-CHAT-13 | The management briefing flow (UC-05) must be accessible via chat for authenticated management users | Should Have |

### 5.3 Admin Panel (FR-ADMIN)

| ID | Requirement | Priority |
|---|---|---|
| FR-ADMIN-01 | Admin panel must use a light theme: white/off-white backgrounds, Mazaya brand green (#005B41) accents | Must Have |
| FR-ADMIN-02 | Left sidebar navigation must include: Dashboard, AI Briefing, Lead Pipeline, Maintenance Tickets, Facility Services, Vendor Registry, Live Chats, Reports | Must Have |
| FR-ADMIN-03 | Dashboard page must show: open ticket count, avg TAT, lead pipeline count, active vendors, chat session count, SLA compliance % | Must Have |
| FR-ADMIN-04 | Dashboard must include bar charts: ticket volume by tower, lead score distribution, priority breakdown | Must Have |
| FR-ADMIN-05 | AI Briefing page must display the latest daily NL briefing with timestamp | Must Have |
| FR-ADMIN-06 | AI Briefing must include actionable alert cards for critical items (P1 breach, lead overdue, vendor underperformance) | Must Have |
| FR-ADMIN-07 | Each alert card must have a one-click action button (reassign, assign, escalate) | Must Have |
| FR-ADMIN-08 | Lead Pipeline table must show: name, specialty, tower preference, score, source, status, assigned rep | Must Have |
| FR-ADMIN-09 | Maintenance Tickets table must show: ref, tower/floor, category, priority dot, vendor, status, SLA remaining | Must Have |
| FR-ADMIN-10 | Tickets must be colour-coded by priority: P1 red, P2 amber, P3 green | Must Have |
| FR-ADMIN-11 | Facility Services table must show: ref, tenant/tower, service type, quote amount, approval status, vendor | Must Have |
| FR-ADMIN-12 | Vendor Registry must show: vendor name, category, towers covered, score (numeric + bar), jobs (30d), status | Must Have |
| FR-ADMIN-13 | Live Chats page must show active sessions with user name, last message, time, and intent classification | Must Have |
| FR-ADMIN-14 | Reports page must include: weekly ticket resolution rate, lead conversion funnel, channel breakdown | Must Have |
| FR-ADMIN-15 | Navigation badges must show unread/open counts on relevant items | Must Have |
| FR-ADMIN-16 | Admin panel must be accessible only to authenticated internal users | Must Have |

### 5.4 Python Backend Agentic Core (FR-BE)

| ID | Requirement | Priority |
|---|---|---|
| FR-BE-01 | Backend must be built in Python using FastAPI | Must Have |
| FR-BE-02 | LLM must be Claude claude-sonnet-4-6 accessed via Anthropic Messages API with tool-use | Must Have |
| FR-BE-03 | Agent must maintain per-session conversation history sent on each request | Must Have |
| FR-BE-04 | Agent must expose the following tools as callable functions: create_lead, score_lead, create_ticket, assign_ticket, create_work_order, get_quote, register_vendor, dispatch_vendor, generate_briefing, get_dashboard_stats | Must Have |
| FR-BE-05 | Lead scoring must use a weighted rubric: specialty match (30%), budget fit (25%), timeline urgency (25%), tower availability (20%) | Must Have |
| FR-BE-06 | Rate card must be configurable via a JSON file loaded at startup, not hardcoded | Must Have |
| FR-BE-07 | Approval threshold for auto-approval of service quotes must be configurable (default: KD 500) | Must Have |
| FR-BE-08 | Vendor scoring must update automatically: +5 on-time, −10 late, −20 complaint, −30 no-show | Must Have |
| FR-BE-09 | Scheduled briefing task must run daily at 08:00 Kuwait time (UTC+3) and weekly on Monday at 09:00 | Must Have |
| FR-BE-10 | Database must support: leads, tickets, work_orders, vendors, messages, sessions tables | Must Have |
| FR-BE-11 | All API endpoints must return JSON with consistent envelope: `{success, data, error}` | Must Have |
| FR-BE-12 | API must expose a WebSocket or SSE endpoint for real-time chat streaming | Must Have |
| FR-BE-13 | Backend must support CORS for the Next.js frontend origins | Must Have |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Chat response latency (agent first token) | < 1.5 seconds |
| NFR-02 | API endpoint response time (non-LLM) | < 200ms |
| NFR-03 | Concurrent chat sessions supported in PoC | 50 |
| NFR-04 | Database: PoC uses SQLite; schema must be PostgreSQL-compatible | PostgreSQL-ready |
| NFR-05 | All secrets (API keys, DB credentials) via environment variables; no hardcoding | Required |
| NFR-06 | Arabic text rendering: full Unicode support, RTL layout | Required |
| NFR-07 | Website: responsive breakpoints at 375px (mobile), 768px (tablet), 1280px (desktop) | Required |
| NFR-08 | Deployable via Docker Compose (single `docker-compose up`) for PoC | Required |

---

## 7. Data Requirements

### 7.1 Core Entities

**Leads**
- id, session_id, name, phone, email, specialty, clinic_size, tower_preference, budget_range, timeline, score, score_tier (hot/warm/cold), source (web/chat/email), status, assigned_to, created_at, updated_at

**Tickets**
- id, ref_number (MX-XXXX), session_id, tenant_name, tower, floor, clinic_number, category, description, priority (P1/P2/P3), sla_deadline, status, vendor_id, assigned_at, completed_at, created_at

**Work Orders (Facility Services)**
- id, ref_number (FS-XXXX), session_id, tenant_name, tower, floor, service_type, specification (JSON), quote_amount, quote_breakdown (JSON), approval_status, approved_by, vendor_id, scheduled_date, status, created_at

**Vendors**
- id, company_name, category (JSON array), towers_covered (JSON array), contact_name, phone, email, trade_licence, score, total_jobs, on_time_count, late_count, complaint_count, no_show_count, status (active/onboarding/suspended), created_at

**Messages**
- id, session_id, role (user/assistant), content, language (en/ar), created_at

**Sessions**
- id, user_type (tenant/prospect/vendor/management), language, use_case, created_at, last_active_at

### 7.2 Data Retention

- Chat messages: retained for 90 days in PoC
- Tickets and work orders: permanent retention
- Leads: permanent retention
- Vendor records: permanent retention

---

## 8. Integration Requirements (Phase 2 — Not in PoC Scope)

| Integration | System | API Type | Notes |
|---|---|---|---|
| CRM write-back | Insightly REST API v3.1 | REST | Leads + Opportunities endpoints |
| Messaging | WhatsApp Business API (Twilio / 360dialog) | Webhook + REST | Bi-directional messaging for tenants and vendors |
| BI dashboard | Power BI Push Dataset API | REST | Real-time KPI tiles |
| Email | SMTP / SendGrid | SMTP/REST | Lead notifications, quote emails |

---

## 9. Assumptions and Constraints

| Item | Detail |
|---|---|
| No WhatsApp integration in PoC | All communication via web chat interface only |
| No Insightly write-back in PoC | Leads stored in local DB only; manual CRM sync |
| No real payment processing | Quotes and work orders are informational only |
| ERP unknown | No ERP integration in PoC or Phase 2 until ERP is identified |
| Rate card | Initial rate card provided by Mazaya FM team before Week 4 |
| Vendor data | Mazaya provides initial list of existing vendors for migration into registry |
| Arabic content | Translation of all UI strings provided by Mazaya or approved translation partner |
| Hosting environment | PoC deployed on a single cloud VM (AWS EC2 t3.medium or equivalent) |

---

## 10. Acceptance Criteria

The PoC is accepted when:

1. All 5 use case flows complete end-to-end without errors in both English and Arabic
2. Lead scoring produces a score and routing tier for every completed qualification flow
3. Maintenance ticket creation issues a unique reference number and displays in the admin panel
4. Facility service quote generates correct line items from the configured rate card
5. Vendor onboarding creates a new vendor record with initial score of 70
6. Management briefing generates and displays in the admin panel on schedule
7. Admin panel dashboard displays live counts from the database
8. All P1 ticket alert cards appear on the AI Briefing page within 1 minute of ticket creation
9. Arabic mode renders correctly with RTL layout in both the website and chat widget
10. System deploys successfully from a single `docker-compose up` command
