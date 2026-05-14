# Mazaya FM — Agentic Facility Manager PoC

AI-powered facility management system for Al-Mazaya Healthcare Real Estate. Three services:

| Service | URL | Description |
|---|---|---|
| **Backend API** | http://localhost:8000 | FastAPI + Claude AI agent |
| **Website** | http://localhost:3000 | Public site with AI chat widget |
| **Admin Panel** | http://localhost:3001 | Operations console |

---

## Quick Start

### 1. Prerequisites

- Docker 24+ and Docker Compose v2
- An Anthropic API key ([get one here](https://console.anthropic.com))

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY
```

### 3. Start all services

```bash
docker compose up --build
```

Wait ~60 seconds for all containers to become healthy. Then visit:

- **Website:** http://localhost:3000 — use the chat bubble (bottom-right)
- **Admin Panel:** http://localhost:3001 — log in with the default credentials below
- **API docs (Swagger):** http://localhost:8000/docs

### 4. Seed the database (optional — recommended for demo)

The backend seeds 6 vendors automatically on first start. For full demo data (leads, tickets, work orders):

```bash
pip install sqlalchemy python-dotenv
python seed_db.py
```

This inserts: 6 vendors, 5 leads, 8 tickets, 3 work orders.

---

## Default Admin Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin@Mazaya2025` |

Change these in `.env` before any production deployment.

---

## Docker Compose Details

```bash
# Start all services (detached)
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f website
docker compose logs -f admin

# Stop
docker compose down

# Stop and remove data volume
docker compose down -v
```

Services use a named volume `backend_data` for SQLite persistence. The backend health-checks on `/health` and the frontends wait for it to be healthy before starting.

---

## Running Without Docker (Development)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # edit and add your ANTHROPIC_API_KEY
mkdir -p data
uvicorn main:app --reload --port 8000
```

### Website

```bash
cd frontend/website
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
# → http://localhost:3000
```

### Admin Panel

```bash
cd frontend/admin
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
# → http://localhost:3001
```

---

## Environment Variable Reference

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(required)* | Anthropic API key for the AI agent |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Claude model to use |
| `DATABASE_URL` | `sqlite:///./data/mazaya_fm.db` | SQLAlchemy DB URL |
| `SECRET_KEY` | `dev-secret-key-...` | JWT signing secret — **change in production** |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Allowed CORS origins |
| `ADMIN_USERNAME` | `admin` | Admin panel login username |
| `ADMIN_PASSWORD` | `Admin@Mazaya2025` | Admin panel login password |
| `AUTO_APPROVAL_THRESHOLD_KD` | `500` | Work orders below this KD amount are auto-approved |
| `LEAD_SCORE_HOT_THRESHOLD` | `70` | Minimum score for "hot" tier |
| `LEAD_SCORE_WARM_THRESHOLD` | `40` | Minimum score for "warm" tier |
| `P1_SLA_HOURS` | `2` | P1 ticket SLA in hours |
| `P2_SLA_HOURS` | `8` | P2 ticket SLA in hours |
| `P3_SLA_HOURS` | `48` | P3 ticket SLA in hours |

---

## End-to-End Tests

The test suite in `tests/test_e2e.py` covers all five core flows. The backend must be running first.

```bash
pip install httpx pytest pytest-asyncio websockets
pytest tests/test_e2e.py -v
```

| Test | What it verifies |
|---|---|
| `test_e2e_lead_pipeline` | Chat → lead created → visible in admin Lead Pipeline |
| `test_e2e_maintenance_ticket_and_dispatch` | Chat → ticket created → vendor dispatched |
| `test_e2e_facility_service_work_order` | Work orders accessible in admin; approval PATCH works |
| `test_e2e_vendor_registration` | POST /api/vendors → appears in Vendor Registry |
| `test_e2e_briefing_generation` | POST /api/briefing/generate → alert visible in AI Briefing |
| `test_e2e_websocket_chat` | WebSocket streaming chat delivers tokens and done signal |
| `test_dashboard_stats` | GET /api/dashboard/stats returns all required KPI fields |

---

## API Documentation

Full API docs are served by FastAPI at runtime:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/token` | — | Get JWT token (form: username, password) |
| `POST` | `/api/chat` | — | Send message to AI agent |
| `WS` | `/ws/chat/{session_id}` | — | Streaming chat |
| `GET` | `/api/leads` | Bearer | List leads with filters |
| `PATCH` | `/api/leads/{id}/assign` | Bearer | Assign lead to rep |
| `GET` | `/api/tickets` | Bearer | List tickets |
| `PATCH` | `/api/tickets/{id}/vendor` | Bearer | Reassign vendor |
| `GET` | `/api/work-orders` | Bearer | List work orders |
| `PATCH` | `/api/work-orders/{id}/approve` | Bearer | Approve a work order |
| `GET` | `/api/vendors` | Bearer | List vendors |
| `GET` | `/api/vendors/dispatch` | — | Get best vendor for a job |
| `GET` | `/api/dashboard/stats` | Bearer | All dashboard KPIs |
| `GET` | `/api/briefing/latest` | Bearer | Most recent management briefing |
| `POST` | `/api/briefing/generate` | Bearer | Trigger manual briefing |

Full request/response schemas: see `doc/04_admin_backend_api.md` (Part 3).

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, reviewed code |
| `claude/finalize-deployment-XgLh9` | Active development branch for this PoC build |
| `feature/*` | Feature branches off `main` |

All PoC work is on `claude/finalize-deployment-XgLh9`. Merge to `main` after stakeholder sign-off.

---

## Architecture Overview

```
┌─────────────────────┐     WebSocket / HTTP      ┌─────────────────────┐
│  Website (Next.js)  │ ────────────────────────► │                     │
│   localhost:3000    │                            │  Backend (FastAPI)  │
└─────────────────────┘                            │   localhost:8000    │
                                                   │                     │
┌─────────────────────┐          HTTP             │  ┌───────────────┐  │
│  Admin (Next.js)    │ ────────────────────────► │  │ Claude Agent  │  │
│   localhost:3001    │                            │  │  (tool-use)   │  │
└─────────────────────┘                            │  └───────────────┘  │
                                                   │  ┌───────────────┐  │
                                                   │  │  SQLite DB    │  │
                                                   │  └───────────────┘  │
                                                   └─────────────────────┘
                                                              │
                                                   ┌─────────▼───────────┐
                                                   │   Anthropic API     │
                                                   │  claude-sonnet-4-6  │
                                                   └─────────────────────┘
```

The AI agent uses Claude's tool-use capability. On each chat message the agent loop:
1. Calls the Anthropic Messages API with conversation history + tool schemas
2. Executes any tool calls (create_lead, create_ticket, dispatch_vendor, etc.)
3. Feeds tool results back to Claude for a final natural-language response
4. Saves everything to SQLite and returns the response to the frontend

---

## Seed Data Summary

After running `seed_db.py`:

**Vendors (6):**
- Gulf HVAC Solutions — score 92, active
- Al-Noor Electrical — score 88, active
- Gulf Plumb Co. — score 79, active
- Medline Technical Services — score 95, active
- CleanPro Facilities — score 55, below_threshold
- Swift Signage & Displays — score 82, active

**Leads (5):** 2 hot (≥70), 2 warm (40-69), 1 cold (<40)

**Tickets (8):** 2 × P1, 3 × P2, 3 × P3 across Clinic III, IV, V, VI Tower A, VI Tower B, Medical Centre

**Work Orders (3):** 1 pending approval, 2 in progress
