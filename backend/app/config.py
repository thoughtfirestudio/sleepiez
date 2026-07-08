from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Sleepiez Fantasy Football"
    debug: bool = True
    database_url: str = "postgresql://sleepiez:sleepiez@localhost:5432/sleepiez"
    allowed_emails: str = ""
    session_secret: str = "change-me-in-production"
    cors_origins: str = "http://localhost:8000,http://localhost:5173"

    # Sleeper API
    sleeper_league_id: str = ""
    sleeper_poll_interval_min: int = 5

    @property
    def allowed_email_list(self) -> list[str]:
        return [e.strip() for e in self.allowed_emails.split(",") if e.strip()]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
