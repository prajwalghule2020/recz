"""Places API — list and detail for geo-grouped place clusters."""

from fastapi import APIRouter, HTTPException, Query

from app.core.prisma import db

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", summary="List all places for a user")
async def list_places(
    user_id: str = Query(..., description="User ID"),
):
    """Return all place clusters sorted by photo count descending."""
    places = await db.place.find_many(
        where={"userId": user_id},
        include={"photos": True},
        order={"createdAt": "desc"},
    )

    results = []
    for place in places:
        photo_count = len(place.photos) if place.photos else 0
        results.append({
            "id": place.id,
            "name": place.name,
            "country": place.country,
            "lat": place.lat,
            "lon": place.lon,
            "photo_count": photo_count,
            "created_at": place.createdAt.isoformat(),
        })

    # Sort by photo count desc
    results.sort(key=lambda x: x["photo_count"], reverse=True)

    return {"places": results, "total": len(results)}


@router.get("/{place_id}", summary="Get place detail with all photos")
async def get_place(place_id: str):
    """Get full place detail with all photos."""
    place = await db.place.find_unique(
        where={"id": place_id},
        include={
            "photos": {
                "include": {
                    "job": {"include": {"metadata": True, "faces": True}},
                },
            },
        },
    )
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    photos = []
    for pp in (place.photos or []):
        job = pp.job
        meta = job.metadata if job else None
        photos.append({
            "job_id": job.id if job else None,
            "object_key": job.objectKey if job else None,
            "thumbnail_key": job.thumbnailKey if job else None,
            "face_count": job.faceCount if job else 0,
            "datetime_original": meta.datetimeOriginal.isoformat() if meta and meta.datetimeOriginal else None,
        })

    return {
        "id": place.id,
        "name": place.name,
        "country": place.country,
        "lat": place.lat,
        "lon": place.lon,
        "photo_count": len(photos),
        "photos": photos,
    }
