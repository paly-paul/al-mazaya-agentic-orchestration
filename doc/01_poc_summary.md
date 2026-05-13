# Mazaya Clinics — Agentic Facility Manager
## PoC Summary

**Version:** 1.0  
**Date:** May 2025  
**Prepared for:** Al Mazaya Holding Co. KSCP  
**Scope:** Mazaya Clinics vertical — all 8 towers, Kuwait

---

## 1. Why This Solution

### The Problem

Al Mazaya Holding manages 8 medical clinic towers in Kuwait housing 200+ independent tenant clinics. The company operates with a group headcount of 94 people managing KD 116M in investment properties. Revenue declined 18.4% from 2023 to 2024.

Three operational failure modes were identified as the primary contributors to revenue pressure and tenant dissatisfaction:

1. **No lead qualification layer.** Incoming clinic space enquiries from the website, email, and phone arrive directly at the sales team without any pre-qualification. This creates a long response lag for high-intent prospects and wastes sales time on cold contacts. There is no CRM automation or scoring in place.

2. **Manual facility service handling.** Tenant requests for value-added services — digital signage, lighting upgrades, display screens, partitions, CCTV — are handled entirely by phone and email. No rate card, no structured quoting, no vendor coordination system exists. This means uncaptured add-on revenue and slow turnaround.

3. **Manual maintenance coordination.** Maintenance requests across 200+ clinics and 8 towers are tracked manually. There is no ticketing system, no SLA framework, and no automated vendor dispatch. The FM team spends most of their time coordinating rather than managing.

The compound effect: a lean team is consumed by coordination overhead, leaving no bandwidth for proactive management, and creating a poor tenant experience that threatens occupancy.

### Why Agentic AI

An agentic AI approach — rather than a conventional CAFM software purchase or a simple chatbot — is the right fit because:

- **Minimal infrastructure:** Mazaya's current tech stack is minimal (Insightly CRM, Power BI, no CAFM). An agent works within existing tools via API rather than requiring a full platform replacement.
- **Conversational interface:** Medical tenants and doctors communicate via WhatsApp. An agent meets them on the channel they already use.
- **Multi-task orchestration:** A single agent handles intent classification, data collection, routing, vendor communication, and reporting — replacing multiple separate tools with one system.
- **Speed to value:** A PoC can go live in 8 weeks without replacing any existing system.

---

## 2. What the PoC Builds

The PoC is a **minimalistic, functional AI system** with three user-facing components:

| Component | Technology | Purpose |
|---|---|---|
| Mazaya Clinics website | Next.js | Public-facing site matching existing Mazaya brand; hosts the embedded chat widget |
| Chat agent (popup) | Next.js + Python backend | Bilingual (EN/AR) conversational agent covering all 5 use cases |
| Admin operations panel | Next.js | Internal dashboard for FM team, sales, and management |

The backend is a **Python agentic core** using Claude claude-sonnet-4-6 via the Anthropic API, with no third-party CRM or WhatsApp integrations in this PoC phase. All data is stored in a local database (SQLite for PoC, PostgreSQL-ready for production).

---

## 3. Use Cases Solved

### UC-01 — Inbound Lead Qualification Agent
**Problem solved:** Unfiltered enquiries reach the sales team with no context, no scoring, and delayed response.  
**What the agent does:** Greets the user, collects specialty, clinic size, tower preference, budget, and timeline through a guided conversation. Scores the lead 0–100 using weighted criteria. Routes hot leads (≥70) immediately to the sales pipeline with a fully populated record; places warm leads in a nurture queue; logs cold contacts for newsletter follow-up.  
**Value:** Sub-2-hour response time for hot leads. Sales team receives pre-qualified, pre-filled enquiries. No manual intake.

### UC-02 — Tenant Facility Services Agent
**Problem solved:** Tenants have no self-serve channel to request add-on services. Revenue from signage, lighting, and fit-out work is inconsistently captured.  
**What the agent does:** Collects service specification through a structured dialogue (type, dimensions, quantity, timeline). Generates an itemised indicative quote from a configured rate card. Auto-approves quotes under KD 500; routes larger quotes for FM manager approval. Creates a work order upon acceptance and dispatches to the vendor coordination flow.  
**Value:** Quote in under 10 minutes vs days. New structured revenue line. All service requests tracked.

### UC-03 — Maintenance Request Routing Agent
**Problem solved:** Maintenance requests are informal, untracked, and routed manually. No SLA framework exists. Tenants have no visibility on status.  
**What the agent does:** Accepts a maintenance report (issue description, tower, floor, clinic). Classifies by issue type and assigns a priority tier: P1 Critical (2-hour SLA), P2 Operational (8-hour SLA), P3 Routine (48-hour SLA). Creates a numbered ticket. Selects the best-matched empaneled vendor by score, availability, and proximity. Dispatches the job card via the admin panel's notification system. Sends three proactive status updates to the tenant. Closes the ticket upon vendor completion confirmation.  
**Value:** All maintenance work is tracked. TAT reduction of 35–40%. FM team freed from coordination calls.

### UC-04 — Vendor Onboarding and Coordination Agent
**Problem solved:** No structured vendor pool. No performance tracking. Subcontractor selection is informal and based on personal contacts rather than capability data.  
**What the agent does:** Accepts vendor self-registration via the website or admin panel. Validates inputs, classifies by service category, and creates a vendor profile with an initial performance score of 70/100. Score is updated automatically after each job: +5 for on-time completion, −10 for late, −20 for complaints, −30 for no-show. For each dispatched job, the agent selects the optimal vendor from the registry, sends the job card, monitors acceptance within a 30-minute window, and escalates to the next vendor if unresponsive.  
**Value:** Structured, accountable vendor pool. Better job outcomes. Automatic escalation removes FM team from the dispatch loop.

### UC-05 — Management Decision Briefing Agent
**Problem solved:** Management has no consolidated view across towers. Anomalies (SLA breaches, unresponsive vendors, overdue leads) surface slowly or not at all.  
**What the agent does:** Runs on a daily schedule (8:00 AM) and a weekly schedule (Monday 9:00 AM), plus real-time anomaly triggers. Aggregates KPIs from all active tickets, the lead pipeline, and vendor performance. Generates a natural language briefing in both English and Arabic. Pushes structured data to the Power BI dashboard (when integrated). Displays the briefing prominently in the admin panel with actionable items that management can approve or reassign in one click.  
**Value:** Sub-15-minute management awareness of any critical issue. Weekly reporting effort eliminated. Data-driven decisions replace manual aggregation.

---

## 4. Key Features

### Website (Next.js)
- Faithful reproduction of Mazaya Holding's existing design language: green/teal brand colour (#005B41 primary), white backgrounds, structured navigation, serif headline font
- Navigation mirrors mazayaholding.com structure: About Us, Operations, Mazaya Clinic, Services, Investor Relations, Media Center
- Clinic tower listings for all 8 towers with location, floors, and specialties
- Language switcher (EN / AR) with full RTL layout for Arabic
- Floating "Talk to Us" button that opens the chat agent as a modal popup
- "Enquire for Space" CTA on each clinic card routes into UC-01 flow

### Chat Agent (popup widget)
- Bilingual: English and Arabic with RTL layout toggle in-session
- Five use case entry points accessible via contextual topic selection
- Conversational qualification with quick-reply buttons for guided flows
- Typing indicators and natural response pacing
- Lead scoring output displayed to user upon completion
- Quote generation with itemised line items
- Ticket reference numbers issued on maintenance submission
- Vendor registration flow for UC-04

### Admin Panel (Next.js, light theme)
- Light theme: white/off-white backgrounds, Mazaya brand green accents, clean typographic hierarchy
- Left sidebar navigation: Dashboard, AI Briefing, Lead Pipeline, Maintenance Tickets, Facility Services, Vendor Registry, Live Chats, Reports
- Dashboard: 6 live metric cards + tower-level bar charts + priority breakdown
- AI Briefing page: daily NL digest with one-click action buttons (reassign vendor, assign lead)
- Lead Pipeline: sortable table with score, source, status, assigned rep
- Maintenance Tickets: table with priority colour-coding, SLA countdown, vendor assignment status
- Facility Services: work order table with quote amounts, approval status
- Vendor Registry: scored vendor list with visual score bars, category tags, per-job history
- Live Chats: session feed with intent classification and channel breakdown
- Reports: weekly funnel and resolution rate charts

### Backend Python Agentic Core
- FastAPI REST API serving all three frontend components
- Claude claude-sonnet-4-6 as the LLM with tool-use for all structured actions
- Agent tools: create_lead, update_lead, create_ticket, update_ticket, create_work_order, get_rate_quote, register_vendor, dispatch_job, generate_briefing
- In-memory conversation state per session (Redis-ready for production)
- SQLite database with full schema for leads, tickets, work orders, vendors, messages
- Scheduled task runner for UC-05 daily/weekly briefings
- Scoring engine for lead qualification and vendor performance

---

## 5. What Is Explicitly Out of Scope for This PoC

| Item | Reason | Phase |
|---|---|---|
| WhatsApp Business API integration | BSP provisioning not yet in place | Phase 2 |
| Insightly CRM write-back | API key and plan confirmation needed | Phase 2 |
| Power BI Push API live feed | Power BI workspace access needed | Phase 2 |
| Preventive maintenance scheduling | Requires asset register (does not exist) | Phase 2/3 |
| Lease renewal agent | Requires structured lease data from ERP | Phase 2/3 |
| Cross-geography data unification | Multi-silo ETL architecture | Phase 3 |
| Mobile app | Web-first for PoC | Post-PoC |
| Payment processing | Out of PoC scope | Post-PoC |

---

## 6. PoC Success Metrics

| Metric | Baseline (pre-PoC) | PoC target |
|---|---|---|
| Lead response time (hot leads) | 24–48 hours | < 2 hours |
| Maintenance tickets tracked per week | 0 (manual, untracked) | 100% of reported issues |
| Average maintenance TAT | Unknown / untracked | Tracked; target < 8 hrs for P2 |
| Service quote turnaround | 2–5 days | < 15 minutes |
| Management reporting effort | Manual, weekly or less | Automated daily briefing |
| Vendor dispatch time | Untracked | < 45 minutes from ticket creation |

---

## 7. Delivery Timeline

| Week | Deliverable |
|---|---|
| 1–2 | Backend Python core, FastAPI, database schema, agent framework |
| 2–3 | UC-01 (lead qualification) + UC-03 (maintenance routing) live on chat |
| 3–4 | Next.js website (Mazaya brand) + admin panel skeleton |
| 4–5 | UC-02 (facility services) + rate card engine |
| 5–6 | UC-04 (vendor onboarding + dispatch) |
| 6–7 | UC-05 (management briefing) + admin panel full feature set |
| 7–8 | Arabic language QA, end-to-end testing, handoff documentation |
