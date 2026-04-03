"""Worker-specific settings (reads from same .env as the API)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class WorkerSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "face-ai-raw"
    minio_secure: bool = False

    # Postgres (Prisma reads DATABASE_URL directly, this is for reference only)
    database_url: str = "postgresql://postgres:postgres@localhost:5432/faceai"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333

    # Model paths
    insightface_home: str = "/models/insightface"
    openclip_cache_dir: str = "/models/openclip"


settings = WorkerSettings()
