"""Events API — list and detail for auto-detected event clusters."""

from fastapi import APIRouter, HTTPException, Query, Body

from app.core.prisma import db

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", summary="List all events for a user")
async def list_events(
    user_id: str = Query(..., description="User ID"),
):
    """Return all event clusters sorted by start time descending."""
    events = await db.event.find_many(
        where={"userId": user_id},
        include={"photos": True},
        order={"startTime": "desc"},
    )

    return {
        "events": [
            {
                "id": event.id,
                "title": event.title,
                "start_time": event.startTime.isoformat(),
                "end_time": event.endTime.isoformat(),
                "photo_count": len(event.photos) if event.photos else 0,
                "cover_image_id": event.coverImageId,
                "created_at": event.createdAt.isoformat(),
            }
            for event in events
        ],
        "total": len(events),
    }


@router.get("/{event_id}", summary="Get event detail with all photos")
async def get_event(event_id: str):
    """Get full event detail with all photos."""
    event = await db.event.find_unique(
        where={"id": event_id},
        include={
            "photos": {
                "include": {
                    "job": {"include": {"metadata": True, "faces": True}},
                },
            },
        },
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    photos = []
    for ep in (event.photos or []):
        job = ep.job
        meta = job.metadata if job else None
        photos.append({
            "job_id": job.id if job else None,
            "object_key": job.objectKey if job else None,
            "thumbnail_key": job.thumbnailKey if job else None,
            "face_count": job.faceCount if job else 0,
            "datetime_original": meta.datetimeOriginal.isoformat() if meta and meta.datetimeOriginal else None,
            "gps_lat": meta.gpsLat if meta else None,
            "gps_lon": meta.gpsLon if meta else None,
        })

    return {
        "id": event.id,
        "title": event.title,
        "start_time": event.startTime.isoformat(),
        "end_time": event.endTime.isoformat(),
        "photo_count": len(photos),
        "photos": photos,
    }


@router.patch("/{event_id}", summary="Rename an event")
async def rename_event(
    event_id: str,
    title: str = Body(..., embed=True),
):
    """Update the title for an event."""
    event = await db.event.find_unique(where={"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    updated = await db.event.update(
        where={"id": event_id},
        data={"title": title},
    )
    return {"id": updated.id, "title": updated.title}
