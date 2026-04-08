"""Upload API — handles image uploads and triggers the processing pipeline."""

import uuid
import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

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


@router.get("", summary="List photos uploaded by the current user")
async def list_images(
    user_id: str = Depends(get_current_user),
    status: str = Query("done", description="Filter jobs by status"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Return the current user's uploaded photos with metadata."""
    where = {"userId": user_id}
    if status:
        where["status"] = status

    jobs = await db.processingjob.find_many(
        where=where,
        include={"metadata": True},
        take=limit,
        skip=offset,
        order={"createdAt": "desc"},
    )
    total = await db.processingjob.count(where=where)

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "photos": [
            {
                "job_id": job.id,
                "object_key": job.objectKey,
                "thumbnail_key": job.thumbnailKey,
                "face_count": job.faceCount,
                "datetime_original": job.metadata.datetimeOriginal.isoformat() if job.metadata and job.metadata.datetimeOriginal else None,
                "gps_lat": job.metadata.gpsLat if job.metadata else None,
                "gps_lon": job.metadata.gpsLon if job.metadata else None,
            }
            for job in jobs
        ],
    }


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


@router.delete("/{job_id}", summary="Delete a photo and all associated data")
async def delete_image(
    job_id: str,
    user_id: str = Depends(get_current_user),
):
    """Delete image from MinIO, Qdrant vectors, and DB records."""
    from app.core.storage import delete_object
    from app.core.qdrant import get_qdrant_client, FACE_COLLECTION, SCENE_COLLECTION
    from qdrant_client.models import FieldCondition, Filter, MatchValue

    job = await db.processingjob.find_unique(where={"id": job_id})
    if not job or job.userId != user_id:
        raise HTTPException(status_code=404, detail="Job not found")

    # 1. Delete from MinIO
    if job.objectKey:
        delete_object(job.objectKey)
    if job.thumbnailKey:
        delete_object(job.thumbnailKey)

    # 2. Delete from Qdrant
    qdrant = get_qdrant_client()
    point_selector = Filter(must=[FieldCondition(key="job_id", match=MatchValue(value=job.id))])
    
    try:
        qdrant.delete(collection_name=FACE_COLLECTION, points_selector=point_selector)
    except Exception as e:
        logger.warning(f"Failed to delete face vectors for job {job.id}: {e}")
        
    try:
        qdrant.delete(collection_name=SCENE_COLLECTION, points_selector=point_selector)
    except Exception as e:
        logger.warning(f"Failed to delete scene vectors for job {job.id}: {e}")

    # 3. Delete DB records (explicit cascade)
    await db.photometadata.delete_many(where={"jobId": job.id})
    await db.facerecord.delete_many(where={"jobId": job.id})
    await db.eventphoto.delete_many(where={"jobId": job.id})
    await db.placephoto.delete_many(where={"jobId": job.id})
    
    # Finally, delete the processing job
    await db.processingjob.delete(where={"id": job.id})

    # 4. Cleanup empty clusters and stale cover-face pointers for this user
    persons = await db.person.find_many(
        where={"userId": user_id},
        include={
            "faces": {
                "where": {"job": {"userId": user_id}},
                "order": {"faceIndex": "asc"},
            }
        },
    )
    for person in persons:
        if not person.faces:
            await db.person.delete(where={"id": person.id})
            continue

        valid_face_ids = {f.id for f in person.faces}
        if not person.coverFaceId or person.coverFaceId not in valid_face_ids:
            await db.person.update(
                where={"id": person.id},
                data={"coverFaceId": person.faces[0].id},
            )

    # 5. Remove empty events and places left after this photo deletion
    events = await db.event.find_many(
        where={"userId": user_id},
        include={"photos": {"where": {"job": {"userId": user_id}}}},
    )
    for event in events:
        if not event.photos:
            await db.event.delete(where={"id": event.id})

    places = await db.place.find_many(
        where={"userId": user_id},
        include={"photos": {"where": {"job": {"userId": user_id}}}},
    )
    for place in places:
        if not place.photos:
            await db.place.delete(where={"id": place.id})

    return {"status": "deleted", "job_id": job.id}