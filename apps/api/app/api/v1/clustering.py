"""Clustering API — trigger face, event, place clustering tasks."""

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.worker_client import celery_app

router = APIRouter(prefix="/cluster", tags=["clustering"])


@router.post("/faces", summary="Trigger face clustering for a user")
async def trigger_face_clustering(
    user_id: str = Depends(get_current_user),
):
    """Run DBSCAN on all face embeddings for this user. Creates/updates Person records."""
    task = celery_app.send_task(
        "worker.clustering.run_face_clustering",
        args=[user_id],
    )
    return {"task_id": task.id, "status": "queued", "type": "face_clustering"}


@router.post("/events", summary="Trigger event clustering for a user")
async def trigger_event_clustering(
    user_id: str = Depends(get_current_user),
):
    """Group photos into events by time gaps and GPS distance."""
    task = celery_app.send_task(
        "worker.clustering.run_event_clustering",
        args=[user_id],
    )
    return {"task_id": task.id, "status": "queued", "type": "event_clustering"}


@router.post("/places", summary="Trigger place grouping for a user")
async def trigger_place_grouping(
    user_id: str = Depends(get_current_user),
):
    """Group photos by geographic location using reverse geocoding."""
    task = celery_app.send_task(
        "worker.clustering.run_place_grouping",
        args=[user_id],
    )
    return {"task_id": task.id, "status": "queued", "type": "place_grouping"}


@router.post("/all", summary="Trigger all clustering tasks for a user")
async def trigger_all_clustering(
    user_id: str = Depends(get_current_user),
):
    """Trigger face, event, and place clustering in sequence."""
    task = celery_app.send_task(
        "worker.clustering.run_all_clustering",
        args=[user_id],
    )
    return {"task_id": task.id, "status": "queued", "type": "all_clustering"}
