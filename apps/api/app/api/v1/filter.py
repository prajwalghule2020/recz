"""Filter API — query photos by date range, GPS bounding box, camera, person."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.prisma import db
from app.core.auth import get_current_user

router = APIRouter(prefix="/filter", tags=["filter"])


@router.get("", summary="Filter photos by metadata")
async def filter_photos(
    user_id: str = Depends(get_current_user),
    date_from: Optional[datetime] = Query(None, description="Start date (ISO 8601)"),
    date_to: Optional[datetime] = Query(None, description="End date (ISO 8601)"),
    lat_min: Optional[float] = Query(None, description="Min latitude"),
    lat_max: Optional[float] = Query(None, description="Max latitude"),
    lon_min: Optional[float] = Query(None, description="Min longitude"),
    lon_max: Optional[float] = Query(None, description="Max longitude"),
    camera_model: Optional[str] = Query(None, description="Camera model substring match"),
    person_id: Optional[str] = Query(None, description="Filter by person cluster ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Filter and retrieve photos using Postgres metadata queries."""

    # Build the where clause
    where: dict = {"userId": user_id, "status": "done"}

    # Metadata sub-filters
    meta_where: dict = {}

    if date_from or date_to:
        dt_filter: dict = {}
        if date_from:
            dt_filter["gte"] = date_from
        if date_to:
            dt_filter["lte"] = date_to
        meta_where["datetimeOriginal"] = dt_filter

    if lat_min is not None or lat_max is not None:
        lat_filter: dict = {}
        if lat_min is not None:
            lat_filter["gte"] = lat_min
        if lat_max is not None:
            lat_filter["lte"] = lat_max
        meta_where["gpsLat"] = lat_filter

    if lon_min is not None or lon_max is not None:
        lon_filter: dict = {}
        if lon_min is not None:
            lon_filter["gte"] = lon_min
        if lon_max is not None:
            lon_filter["lte"] = lon_max
        meta_where["gpsLon"] = lon_filter

    if camera_model:
        meta_where["cameraModel"] = {"contains": camera_model, "mode": "insensitive"}

    if meta_where:
        where["metadata"] = {"is": meta_where}

    # Person filter — find jobs that have at least one face assigned to this person
    if person_id:
        person = await db.person.find_first(where={"id": person_id, "userId": user_id})
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        where["faces"] = {"some": {"personId": person_id}}

    jobs = await db.processingjob.find_many(
        where=where,
        include={"metadata": True, "faces": True},
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
                "status": job.status,
                "metadata": {
                    "datetime_original": job.metadata.datetimeOriginal.isoformat() if job.metadata and job.metadata.datetimeOriginal else None,
                    "gps_lat": job.metadata.gpsLat if job.metadata else None,
                    "gps_lon": job.metadata.gpsLon if job.metadata else None,
                    "camera_make": job.metadata.cameraMake if job.metadata else None,
                    "camera_model": job.metadata.cameraModel if job.metadata else None,
                    "width": job.metadata.width if job.metadata else None,
                    "height": job.metadata.height if job.metadata else None,
                } if job.metadata else None,
                "faces": [
                    {
                        "id": f.id,
                        "face_index": f.faceIndex,
                        "person_id": f.personId,
                        "qdrant_point_id": f.qdrantPointId,
                    }
                    for f in (job.faces or [])
                ],
            }
            for job in jobs
        ],
    }
