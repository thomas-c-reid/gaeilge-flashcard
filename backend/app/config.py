from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    api_key: str
    anthropic_api_key: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
