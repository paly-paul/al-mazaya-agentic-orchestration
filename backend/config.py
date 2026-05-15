from pydantic_settings import BaseSettings
from typing import List

_DEFAULT_ORIGINS = (
    "http://localhost:3000,"
    "http://localhost:3001,"
    "https://mazaya-website.vercel.app,"
    "https://mazaya-admin.vercel.app"
)


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"
    database_url: str = "postgresql://mazaya:mazaya@localhost:5432/mazaya_fm"
    secret_key: str = "dev-secret-key-change-in-prod"
    # ALLOWED_ORIGINS overrides the default list; CORS_ORIGINS is a legacy alias
    allowed_origins: str = _DEFAULT_ORIGINS
    cors_origins: str = ""          # kept for backwards compat — merged below
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
        combined = set()
        for raw in (self.allowed_origins, self.cors_origins):
            for o in raw.split(","):
                o = o.strip()
                if o:
                    combined.add(o)
        return list(combined)

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
