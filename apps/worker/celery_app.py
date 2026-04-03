"""Celery application configuration."""

from celery import Celery
from config import settings

app = Celery(
    "face_ai_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["pipeline"],
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
)
