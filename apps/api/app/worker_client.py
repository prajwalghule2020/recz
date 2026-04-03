from celery import Celery
from app.core.config import settings

_celery = Celery("face_ai", broker=settings.redis_url, backend=settings.redis_url)


def enqueue_pipeline(job_id: str, object_key: str, user_id: str, image_id: str):
    """Send the process_image_pipeline task to the worker queue."""
    _celery.send_task(
        "worker.pipeline.process_image_pipeline",
        args=[job_id, object_key, user_id, image_id],
    )
