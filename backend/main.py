"""
Mazaya Clinics Agentic Facility Manager — FastAPI backend entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
import models  # noqa: F401 — registers all ORM models with Base.metadata

from routers import chat, leads, tickets, work_orders, vendors, dashboard, briefing
from agent.scheduler import get_scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (idempotent)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")

    # Start APScheduler
    scheduler = get_scheduler()
    scheduler.start()
    logger.info("APScheduler started.")

    yield

    scheduler.shutdown(wait=False)
    logger.info("APScheduler stopped.")


app = FastAPI(
    title="Mazaya Clinics Agentic Facility Manager",
    description="AI-powered facility management backend for Mazaya Clinics, Kuwait",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(leads.router)
app.include_router(tickets.router)
app.include_router(work_orders.router)
app.include_router(vendors.router)
app.include_router(dashboard.router)
app.include_router(briefing.router)


@app.get("/health")
def health_check():
    return {"success": True, "data": {"status": "ok"}, "error": None}
