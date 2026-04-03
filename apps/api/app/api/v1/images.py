import uuid
import json
import mimetypes
from typing import Annotated

from fastapi import APIRouter, File, UploadFile, HTTPException, Header
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.storage import upload_object, get_presigned_url
from app.core.prisma import db
from app.worker_client import enqueue_pipeline

router = APIRouter(prefix="/images", tags=["images"])

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


# ── Upload ─────────────────────────────────────────────────────────────────────

@router.post("/upload", summary="Upload one or more images for processing")
async def upload_images(
    files: list[UploadFile] = File(...),
    x_user_id: Annotated[str | None, Header()] = None,
):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header is required")

    results = []
    for file in files:
        # Validate MIME
        content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
        if content_type not in ALLOWED_MIME:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{content_type}'. Allowed: JPEG, PNG, WebP, HEIC",
            )

        data = await file.read()
        image_id = str(uuid.uuid4())
        ext = (file.filename or "image.jpg").rsplit(".", 1)[-1].lower()
        object_key = f"{x_user_id}/{image_id}.{ext}"

        # Upload to MinIO
        upload_object(object_key, data, content_type)

        # Insert job row via Prisma
        job = await db.processingjob.create(
            data={
                "userId": x_user_id,
                "status": "pending",
                "objectKey": object_key,
            }
        )

        # Enqueue Celery task
        enqueue_pipeline(job.id, object_key, x_user_id, image_id)

        results.append({"job_id": job.id, "image_id": image_id, "status": "queued"})

    return JSONResponse(content={"uploaded": len(results), "jobs": results})


# ── Status ─────────────────────────────────────────────────────────────────────

@router.get("/{job_id}/status", summary="Poll processing status for a job")
async def get_job_status(job_id: str):
    job = await db.processingjob.find_unique(where={"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    meta = await db.photometadata.find_unique(where={"jobId": job_id})

    return {
        "job_id": job.id,
        "status": job.status,
        "face_count": job.faceCount,
        "error_msg": job.errorMsg,
        "gps_lat": meta.gpsLat if meta else None,
        "gps_lon": meta.gpsLon if meta else None,
        "datetime_original": meta.datetimeOriginal.isoformat() if meta and meta.datetimeOriginal else None,
    }


# ── Results ────────────────────────────────────────────────────────────────────

@router.get("/{job_id}/results", summary="Get full results for a completed job")
async def get_job_results(job_id: str):
    job = await db.processingjob.find_unique(
        where={"id": job_id},
        include={"metadata": True, "faces": True},
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "done":
        raise HTTPException(status_code=202, detail=f"Job is not complete yet (status: {job.status})")

    meta = job.metadata

    return {
        "job_id": job_id,
        "face_count": job.faceCount,
        "faces": [
            {
                "face_index": f.faceIndex,
                "bbox": json.loads(f.bboxJson) if f.bboxJson else [],
                "det_score": f.detScore,
                "qdrant_point_id": f.qdrantPointId,
            }
            for f in (job.faces or [])
        ],
        "metadata": {
            "datetime_original": meta.datetimeOriginal.isoformat() if meta and meta.datetimeOriginal else None,
            "gps_lat": meta.gpsLat if meta else None,
            "gps_lon": meta.gpsLon if meta else None,
            "camera_make": meta.cameraMake if meta else None,
            "camera_model": meta.cameraModel if meta else None,
            "width": meta.width if meta else None,
            "height": meta.height if meta else None,
        } if meta else None,
    }