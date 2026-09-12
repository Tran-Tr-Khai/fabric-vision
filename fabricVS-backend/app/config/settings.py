from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    app_name: str = "Fabric Vision Backend"
    database_path: Path = BACKEND_ROOT / "data" / "fabric_vision.db"
    capture_dir: Path = BACKEND_ROOT / "data" / "captures"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
