"""People API — CRUD for face-cluster Person records."""

import json
from fastapi import APIRouter, HTTPException, Query, Body

from app.core.prisma import db
from app.core.storage import get_presigned_url

router = APIRouter(prefix="/people", tags=["people"])


@router.get("", summary="List all people for a user")
async def list_people(
    user_id: str = Query(..., description="User ID"),
):
    """Return all person clusters with face count and cover image."""
    persons = await db.person.find_many(
        where={"userId": user_id},
        include={"faces": {"include": {"job": {"include": {"metadata": True}}}}},
        order={"updatedAt": "desc"},
    )

    results = []
    for person in persons:
        face_count = len(person.faces) if person.faces else 0
        # Use the cover face's job to get an image
        cover_object_key = None
        cover_thumbnail_key = None
        cover_image_url = None
        cover_width = None
        cover_height = None
        if person.faces:
            cover_face = person.faces[0]
            if cover_face.job:
                cover_object_key = cover_face.job.objectKey
                cover_thumbnail_key = cover_face.job.thumbnailKey
                # Generate presigned URL for the cover image (full-size, since bbox is in original pixels)
                cover_image_url = get_presigned_url(cover_face.job.objectKey)
                # Get image dimensions for face crop calculation
                if cover_face.job.metadata:
                    cover_width = cover_face.job.metadata.width
                    cover_height = cover_face.job.metadata.height

        results.append({
            "id": person.id,
            "name": person.name,
            "face_count": face_count,
            "cover_face_id": person.coverFaceId,
            "cover_object_key": cover_object_key,
            "cover_thumbnail_key": cover_thumbnail_key,
            "cover_image_url": cover_image_url,
            "cover_bbox": json.loads(person.faces[0].bboxJson) if person.faces and person.faces[0].bboxJson else None,
            "cover_width": cover_width,
            "cover_height": cover_height,
            "created_at": person.createdAt.isoformat(),
        })

    return {"people": results, "total": len(results)}


@router.get("/{person_id}", summary="Get a person with all their photos")
async def get_person(person_id: str):
    """Get a person detail including all photos they appear in."""
    person = await db.person.find_unique(
        where={"id": person_id},
        include={
            "faces": {
                "include": {
                    "job": {"include": {"metadata": True}},
                },
            },
        },
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    photos = []
    seen_jobs = set()
    for face in (person.faces or []):
        if face.job and face.job.id not in seen_jobs:
            seen_jobs.add(face.job.id)
            meta = face.job.metadata
            photos.append({
                "job_id": face.job.id,
                "object_key": face.job.objectKey,
                "thumbnail_key": face.job.thumbnailKey,
                "face_index": face.faceIndex,
                "bbox": json.loads(face.bboxJson) if face.bboxJson else None,
                "datetime_original": meta.datetimeOriginal.isoformat() if meta and meta.datetimeOriginal else None,
                "gps_lat": meta.gpsLat if meta else None,
                "gps_lon": meta.gpsLon if meta else None,
            })

    return {
        "id": person.id,
        "name": person.name,
        "face_count": len(person.faces or []),
        "photo_count": len(photos),
        "photos": photos,
    }


@router.patch("/{person_id}", summary="Rename a person")
async def rename_person(
    person_id: str,
    name: str = Body(..., embed=True),
):
    """Update the display name for a person cluster."""
    person = await db.person.find_unique(where={"id": person_id})
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    updated = await db.person.update(
        where={"id": person_id},
        data={"name": name},
    )
    return {"id": updated.id, "name": updated.name}


@router.post("/{person_id}/merge", summary="Merge two person clusters")
async def merge_persons(
    person_id: str,
    merge_with_id: str = Body(..., embed=True, description="Person ID to merge into this one"),
):
    """Merge another person cluster into this one. Reassigns all faces."""
    target = await db.person.find_unique(where={"id": person_id})
    source = await db.person.find_unique(where={"id": merge_with_id})
    if not target or not source:
        raise HTTPException(status_code=404, detail="One or both persons not found")

    # Reassign all source faces to target
    await db.facerecord.update_many(
        where={"personId": merge_with_id},
        data={"personId": person_id},
    )

    # Delete the source person
    await db.person.delete(where={"id": merge_with_id})

    return {"id": person_id, "merged_from": merge_with_id, "status": "merged"}
