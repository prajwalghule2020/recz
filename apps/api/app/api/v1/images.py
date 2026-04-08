"""Upload API — handles image uploads and triggers the processing pipeline."""

import uuid
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.prisma import db
from app.core.storage import upload_object
from app.core.auth import get_current_user
from app.worker_client import celery_app

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/upload", summary="Upload one or more images for processing")
async def upload_images(
    files: list[UploadFile] = File(...),
    user_id: str = Depends(get_current_user),
):
    """Accept image files, store in MinIO, create job records, and enqueue tasks."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    jobs = []
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            continue

        image_id = str(uuid.uuid4())
        ext = (file.filename or "img").rsplit(".", 1)[-1] if file.filename else "jpg"
        object_key = f"{user_id}/{image_id}.{ext}"

        # Read file content
        content = await file.read()

        # Upload to MinIO
        upload_object(object_key, content, file.content_type)

        # Create job record
        job = await db.processingjob.create(
            data={
                "userId": user_id,
                "objectKey": object_key,
                "status": "queued",
            }
        )

        # Enqueue Celery task
        celery_app.send_task(
            "worker.pipeline.process_image",
            args=[job.id, user_id, image_id, object_key],
        )

        jobs.append({"job_id": job.id, "image_id": image_id})
        logger.info("Queued job %s for image %s (user=%s)", job.id, image_id, user_id)

    if not jobs:
        raise HTTPException(status_code=400, detail="No valid image files found")

    return {"jobs": jobs, "total": len(jobs)}


@router.get("/{job_id}/status", summary="Check job processing status")
async def get_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user),
):
    """Return the current processing status for a job."""
    job = await db.processingjob.find_unique(
        where={"id": job_id},
        include={"metadata": True},
    )
    if not job or job.userId != user_id:
        raise HTTPException(status_code=404, detail="Job not found")

    result = {
        "job_id": job.id,
        "status": job.status,
        "face_count": job.faceCount,
        "error_msg": job.errorMsg,
        "thumbnail_key": job.thumbnailKey,
    }

    if job.metadata:
        result.update({
            "gps_lat": job.metadata.gpsLat,
            "gps_lon": job.metadata.gpsLon,
            "datetime_original": job.metadata.datetimeOriginal.isoformat() if job.metadata.datetimeOriginal else None,
        })

    return result


@router.get("/{job_id}/thumbnail", summary="Get presigned URL for thumbnail")
async def get_thumbnail_url(
    job_id: str,
    user_id: str = Depends(get_current_user),
):
    """Return a presigned URL for the job's thumbnail image."""
    from app.core.storage import get_presigned_url

    job = await db.processingjob.find_unique(where={"id": job_id})
    if not job or job.userId != user_id:
        raise HTTPException(status_code=404, detail="Job not found")

    key = job.thumbnailKey or job.objectKey
    url = get_presigned_url(key)
    return {"url": url}


@router.get("/{job_id}/image", summary="Get presigned URL for full image")
async def get_image_url(
    job_id: str,
    user_id: str = Depends(get_current_user),
):
    """Return a presigned URL for the full-resolution image."""
    from app.core.storage import get_presigned_url

    job = await db.processingjob.find_unique(where={"id": job_id})
    if not job or job.userId != user_id:
        raise HTTPException(status_code=404, detail="Job not found")

    url = get_presigned_url(job.objectKey)
    return {"url": url}