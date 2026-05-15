# Mazaya FM — Agentic Facility Manager PoC

AI-powered facility management system for Al-Mazaya Healthcare Real Estate.

| Service | Local URL | Production |
|---|---|---|
| **Backend API** | http://localhost:8000 | Railway (FastAPI + Postgres) |
| **Website** | http://localhost:3000 | Vercel (`mazaya-website`) |
| **Admin Panel** | http://localhost:3001 | Vercel (`mazaya-admin`) |

---

## Deployment Path A — Local (docker-compose)

### 1. Prerequisites

- Docker 24+ and Docker Compose v2
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and set ANTHROPIC_API_KEY (all other values have safe defaults)
```

### 3. Start all services

```bash
docker compose up --build
```

This starts four containers: `postgres`, `backend`, `website`, `admin`.
Postgres is healthy-checked; backend waits for it; frontends wait for the backend.

First startup takes ~90 s (image builds + table creation + vendor seed).

| URL | Description |
|---|---|
| http://localhost:3000 | Public website — use the green chat bubble |
| http://localhost:3001 | Admin panel — login with credentials below |
| http://localhost:8000/docs | FastAPI Swagger UI |

### 4. Seed demo data (optional)

The backend seeds 6 vendors automatically. For the full demo dataset:

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
DATABASE_URL=postgresql://mazaya:mazaya@localhost:5432/mazaya_fm python seed_db.py
```

Inserts: 6 vendors, 5 leads, 8 tickets, 3 work orders.

### Useful docker-compose commands

```bash
docker compose up -d --build        # start detached
docker compose logs -f backend      # tail backend logs
docker compose ps                   # check service health
docker compose down                 # stop (keeps Postgres data)
docker compose down -v              # stop and erase all data
```

---

## Deployment Path B — Production (Vercel + Railway)

### Backend on Railway

1. Create a new Railway project and add a **PostgreSQL** plugin — copy the connection string.
2. Add a **New Service** from GitHub → select the repo → set the **Root Directory** to `backend`.
3. Set these Railway environment variables:

   | Variable | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | your key |
   | `DATABASE_URL` | Railway Postgres connection string |
   | `SECRET_KEY` | a long random string |
   | `ALLOWED_ORIGINS` | `https://mazaya-website.vercel.app,https://mazaya-admin.vercel.app` |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | strong password |
   | `CLAUDE_MODEL` | `claude-sonnet-4-6` |

4. Railway auto-detects the Dockerfile in `backend/`. Deploy.
5. Note your Railway public URL, e.g. `https://mazaya-backend.up.railway.app`.

### Website on Vercel

1. Import the repo into Vercel → set **Root Directory** to `frontend/website`.
2. Framework preset: **Next.js** (auto-detected).
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://mazaya-backend.up.railway.app
   ```
4. Deploy. The `vercel.json` at `frontend/website/vercel.json` handles the API rewrite.
5. Update Railway `ALLOWED_ORIGINS` to include the Vercel URL.

### Admin Panel on Vercel

1. Import the same repo → set **Root Directory** to `frontend/admin`.
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://mazaya-backend.up.railway.app
   ```
3. Deploy. The `vercel.json` at `frontend/admin/vercel.json` is pre-configured.
4. Add the admin Vercel URL to Railway `ALLOWED_ORIGINS`.

### Custom Vercel domains

Edit the production backend URL in both `vercel.json` files if your Railway service URL differs from `mazaya-backend.up.railway.app`:

```json
// frontend/website/vercel.json  and  frontend/admin/vercel.json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-actual-railway-url.up.railway.app"
  }
}
```

---

## Default Admin Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin@Mazaya2025` |

Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` (local) or Railway env vars (production) before any public deployment.

---

## Environment Variable Reference

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(required)* | Anthropic API key for the AI agent |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Claude model |
| `DATABASE_URL` | `postgresql://mazaya:mazaya@postgres:5432/mazaya_fm` | SQLAlchemy DB URL (PostgreSQL) |
| `POSTGRES_PASSWORD` | `mazaya` | Password for the docker-compose Postgres service |
| `SECRET_KEY` | `dev-secret-key-...` | JWT signing secret — **change in production** |
| `ALLOWED_ORIGINS` | localhost:3000, localhost:3001, Vercel URLs | Comma-separated allowed CORS origins |
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `Admin@Mazaya2025` | Admin login password |
| `AUTO_APPROVAL_THRESHOLD_KD` | `500` | Work orders below this KD are auto-approved |
| `LEAD_SCORE_HOT_THRESHOLD` | `70` | Minimum score for "hot" tier |
| `LEAD_SCORE_WARM_THRESHOLD` | `40` | Minimum score for "warm" tier |
| `P1_SLA_HOURS` | `2` | P1 ticket SLA in hours |
| `P2_SLA_HOURS` | `8` | P2 ticket SLA in hours |
| `P3_SLA_HOURS` | `48` | P3 ticket SLA in hours |

---

## Running Without Docker (Development)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # set ANTHROPIC_API_KEY and DATABASE_URL
uvicorn main:app --reload --port 8000
```

Requires a local Postgres instance. Quick option:
```bash
docker run -d -p 5432:5432 -e POSTGRES_DB=mazaya_fm -e POSTGRES_USER=mazaya -e POSTGRES_PASSWORD=mazaya postgres:16-alpine
```

### Website

```bash
cd frontend/website
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev   # → http://localhost:3000
```

### Admin Panel

```bash
cd frontend/admin
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev   # → http://localhost:3001
```

---

## End-to-End Tests

The backend must be running and seeded first.

```bash
pip install httpx pytest pytest-asyncio
pytest tests/test_e2e.py -v
```

| Test | Flow |
|---|---|
| `test_e2e_lead_pipeline` | Chat → lead created → visible in Lead Pipeline |
| `test_e2e_maintenance_ticket_and_dispatch` | Chat → ticket created → vendor dispatched |
| `test_e2e_facility_service_work_order` | Work orders in admin; approval PATCH verified |
| `test_e2e_vendor_registration` | POST `/api/vendors` → entry in Vendor Registry |
| `test_e2e_briefing_generation` | POST `/api/briefing/generate` → alert in AI Briefing |
| `test_e2e_sse_chat_stream` | POST `/api/chat/stream` → SSE tokens + done event |
| `test_dashboard_stats` | GET `/api/dashboard/stats` returns all KPI fields |

---

## API Documentation

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/token` | — | Get JWT (form: username, password) |
| `POST` | `/api/chat` | — | Standard chat (full response) |
| `POST` | `/api/chat/stream` | — | SSE streaming chat |
| `GET` | `/api/chat/sessions/{id}` | — | Full conversation history |
| `GET` | `/api/leads` | Bearer | List leads |
| `PATCH` | `/api/leads/{id}/assign` | Bearer | Assign lead to rep |
| `PATCH` | `/api/leads/{id}/status` | Bearer | Update lead status |
| `GET` | `/api/tickets` | Bearer | List tickets |
| `PATCH` | `/api/tickets/{id}/vendor` | Bearer | Reassign vendor |
| `PATCH` | `/api/tickets/{id}/close` | Bearer | Close ticket |
| `GET` | `/api/work-orders` | Bearer | List work orders |
| `PATCH` | `/api/work-orders/{id}/approve` | Bearer | Approve work order |
| `PATCH` | `/api/work-orders/{id}/reject` | Bearer | Reject work order |
| `GET` | `/api/vendors` | Bearer | List vendors |
| `POST` | `/api/vendors` | Bearer | Register vendor |
| `GET` | `/api/vendors/dispatch` | — | Best vendor for a job |
| `GET` | `/api/dashboard/stats` | Bearer | All KPIs |
| `GET` | `/api/briefing/latest` | Bearer | Latest management briefing |
| `POST` | `/api/briefing/generate` | Bearer | Trigger manual briefing |

Full schema reference: `doc/04_admin_backend_api.md`  
Interactive docs (local): http://localhost:8000/docs

---

## Architecture

```
┌────────────────────┐    SSE / HTTP     ┌─────────────────────────────┐
│ Website (Next.js)  │ ────────────────► │                             │
│  localhost:3000    │                   │   Backend (FastAPI)         │
└────────────────────┘                   │   localhost:8000            │
                                         │                             │
┌────────────────────┐      HTTP         │  ┌──────────────────────┐  │
│ Admin  (Next.js)   │ ────────────────► │  │  Claude Agent        │  │
│  localhost:3001    │                   │  │  (tool-use loop)     │  │
└────────────────────┘                   │  └──────────────────────┘  │
                                         │  ┌──────────────────────┐  │
                                         │  │  PostgreSQL           │  │
                                         │  └──────────────────────┘  │
                                         └─────────────────────────────┘
                                                      │
                                         ┌────────────▼────────────────┐
                                         │     Anthropic API           │
                                         │   claude-sonnet-4-6         │
                                         └─────────────────────────────┘
```

Chat uses **Server-Sent Events** (POST `/api/chat/stream`): the client sends one POST with the message body and consumes a `text/event-stream` response — no WebSocket upgrade needed, works through all HTTP proxies and Vercel edge functions.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, reviewed code |
| `claude/finalize-deployment-XgLh9` | Active PoC development branch |
| `feature/*` | Feature branches off `main` |

---

## Seed Data Summary

After `python seed_db.py`:

**Vendors (6):** Gulf HVAC Solutions (92), Al-Noor Electrical (88), Gulf Plumb Co. (79), Medline Technical Services (95), CleanPro Facilities (55 — below threshold), Swift Signage & Displays (82)

**Leads (5):** 2 hot ≥70, 2 warm 40–69, 1 cold <40

**Tickets (8):** 2 × P1 · 3 × P2 · 3 × P3 — across Clinic III, IV, V, VI Tower A, VI Tower B, Medical Centre

**Work Orders (3):** 1 pending approval · 2 in progress
