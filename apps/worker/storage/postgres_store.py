"""Postgres storage for the worker — sync Prisma client (Celery tasks are sync)."""

import json
import logging
import uuid
from datetime import datetime, timezone

from prisma import Prisma

logger = logging.getLogger(__name__)

_db = None


def _get_db() -> Prisma:
    """Lazy sync Prisma client — created on first call."""
    global _db
    if _db is None:
        _db = Prisma()
        _db.connect()
    return _db


# ── Public functions ──────────────────────────────────────────────────────────

def update_job_status(
    job_id: str,
    status: str,
    face_count: int | None = None,
    error_msg: str | None = None,
):
    """Update the processing job row."""
    db = _get_db()
    data: dict = {
        "status": status,
        "updatedAt": datetime.now(timezone.utc),
    }
    if face_count is not None:
        data["faceCount"] = face_count
    if error_msg is not None:
        data["errorMsg"] = error_msg[:2000]

    db.processingjob.update(
        where={"id": job_id},
        data=data,
    )
    logger.info("Job %s → status=%s", job_id, status)


def save_metadata(job_id: str, image_id: str, photo_meta):
    """Insert a photo_metadata row."""
    db = _get_db()
    db.photometadata.create(
        data={
            "jobId": job_id,
            "imageId": image_id,
            "datetimeOriginal": photo_meta.datetime_original,
            "gpsLat": photo_meta.gps_lat,
            "gpsLon": photo_meta.gps_lon,
            "cameraMake": photo_meta.camera_make,
            "cameraModel": photo_meta.camera_model,
            "width": photo_meta.width,
            "height": photo_meta.height,
        }
    )
    logger.info("Saved metadata for image_id=%s", image_id)


def save_face_records(
    job_id: str,
    image_id: str,
    face_results: list[dict],
    qdrant_point_ids: list[str],
):
    """Insert face_record rows."""
    db = _get_db()
    for face, pid in zip(face_results, qdrant_point_ids):
        db.facerecord.create(
            data={
                "jobId": job_id,
                "imageId": image_id,
                "faceIndex": face["face_index"],
                "bboxJson": json.dumps(face["bbox"]),
                "detScore": face["det_score"],
                "qdrantPointId": pid,
            }
        )
    logger.info("Saved %d face records for image_id=%s", len(face_results), image_id)
