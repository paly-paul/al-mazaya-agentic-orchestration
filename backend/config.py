import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"
    database_url: str = "sqlite:///./data/mazaya_fm.db"
    secret_key: str = "dev-secret-key-change-in-prod"
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    admin_username: str = "admin"
    admin_password: str = "Admin@Mazaya2025"
    auto_approval_threshold_kd: float = 500.0
    lead_score_hot_threshold: float = 70.0
    lead_score_warm_threshold: float = 40.0
    p1_sla_hours: int = 2
    p2_sla_hours: int = 8
    p3_sla_hours: int = 48

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
