"""
APScheduler tasks for automated briefing generation.
Daily at 08:00 Kuwait time (UTC+3) and weekly on Monday at 09:00.
"""
import json
import logging
from datetime import datetime

import anthropic
import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from agent.prompts import get_briefing_prompt
from agent.tools import execute_generate_briefing
from config import settings
from database import SessionLocal
from models.briefing import Briefing

logger = logging.getLogger(__name__)

KUWAIT_TZ = pytz.timezone("Asia/Kuwait")

_scheduler: AsyncIOScheduler | None = None


async def _generate_and_store_briefing(period: str) -> None:
    """Pull operational data, call Claude to write the NL briefing, persist to DB."""
    db = SessionLocal()
    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        ops_data = execute_generate_briefing(db, {"period": period})

        data_context = json.dumps(ops_data, indent=2, default=str)

        # Generate English briefing
        en_resp = client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=get_briefing_prompt("en"),
            messages=[{"role": "user", "content": f"Generate the {period} management briefing based on this data:\n\n{data_context}"}],
        )
        briefing_en = en_resp.content[0].text if en_resp.content else ""

        # Generate Arabic briefing
        ar_resp = client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=get_briefing_prompt("ar"),
            messages=[{"role": "user", "content": f"أنشئ إحاطة {period} للإدارة بناءً على هذه البيانات:\n\n{data_context}"}],
        )
        briefing_ar = ar_resp.content[0].text if ar_resp.content else ""

        briefing = Briefing(
            period=period,
            briefing_en=briefing_en,
            briefing_ar=briefing_ar,
            alerts=json.dumps(ops_data.get("alerts", []), default=str),
        )
        db.add(briefing)
        db.commit()
        logger.info("Briefing generated: period=%s id=%s", period, briefing.id)

    except Exception as exc:
        logger.exception("Failed to generate %s briefing: %s", period, exc)
    finally:
        db.close()


async def run_daily_briefing() -> None:
    logger.info("Running scheduled daily briefing at %s", datetime.now(KUWAIT_TZ))
    await _generate_and_store_briefing("daily")


async def run_weekly_briefing() -> None:
    logger.info("Running scheduled weekly briefing at %s", datetime.now(KUWAIT_TZ))
    await _generate_and_store_briefing("weekly")


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(timezone=KUWAIT_TZ)
        _scheduler.add_job(
            run_daily_briefing,
            CronTrigger(hour=8, minute=0, timezone=KUWAIT_TZ),
            id="daily_briefing",
            replace_existing=True,
        )
        _scheduler.add_job(
            run_weekly_briefing,
            CronTrigger(day_of_week="mon", hour=9, minute=0, timezone=KUWAIT_TZ),
            id="weekly_briefing",
            replace_existing=True,
        )
    return _scheduler
