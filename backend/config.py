from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Anthropic
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"

    # Database
    database_url: str = "sqlite:///./mazaya_fm.db"

    # Application
    secret_key: str = "changeme-in-production"
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    timezone: str = "Asia/Kuwait"

    # Agent config
    auto_approval_threshold_kd: float = 500.0
    lead_score_hot_threshold: int = 70
    lead_score_warm_threshold: int = 40
    vendor_dispatch_timeout_minutes: int = 30
    vendor_min_score_threshold: int = 60
    p1_sla_hours: int = 2
    p2_sla_hours: int = 8
    p3_sla_hours: int = 48

    # Briefing schedule
    briefing_daily_cron: str = "0 8 * * *"
    briefing_weekly_cron: str = "0 9 * * 1"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
