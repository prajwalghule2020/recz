"""Search API — face search (by point ID or uploaded image) + image similarity.

Embedding computation is delegated to the worker via Celery tasks,
keeping this API container free of heavy ML dependencies.
"""

import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from qdrant_client.models import FieldCondition, Filter, MatchValue, RecommendQuery

from app.core.qdrant import FACE_COLLECTION, SCENE_COLLECTION, get_qdrant_client
from app.core.prisma import db
from app.core.auth import get_current_user
from app.worker_client import celery_app

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["search"])

# Timeout for waiting on worker embedding tasks (seconds)
EMBED_TIMEOUT = 120


def _call_worker_embed(task_name: str, image_bytes: bytes) -> list[float]:
    """Send image to the worker for embedding and wait for the result."""
    hex_data = image_bytes.hex()
    result = celery_app.send_task(task_name, args=[hex_data])
    embedding = result.get(timeout=EMBED_TIMEOUT)
    if embedding is None:
        raise HTTPException(status_code=422, detail="No face detected in uploaded image")
    return embedding


def _format_results(points):
    """Format Qdrant query results into a consistent response."""
    return [
        {
            "point_id": str(p.id),
            "score": round(p.score, 4) if p.score is not None else None,
            "image_id": p.payload.get("image_id") if p.payload else None,
            "job_id": p.payload.get("job_id") if p.payload else None,
            "face_index": p.payload.get("face_index") if p.payload else None,
            "bbox": p.payload.get("bbox") if p.payload else None,
        }
        for p in points
    ]


# ── Face Search ───────────────────────────────────────────────────────────────


@router.post("/face", summary="Search for similar faces")
async def search_face(
    user_id: str = Depends(get_current_user),
    point_id: str | None = Query(None, description="Existing Qdrant point ID to search from"),
    limit: int = Query(20, ge=1, le=100),
    file: UploadFile | None = File(None, description="Upload a face image to search"),
):
    """Search for similar faces by Qdrant point ID or by uploading a face image."""
    qdrant = get_qdrant_client()
    user_filter = Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))])

    if point_id:
        # Search by existing point — recommend similar
        results = qdrant.query_points(
            collection_name=FACE_COLLECTION,
            query=RecommendQuery(recommend={"positive": [point_id]}),
            query_filter=user_filter,
            limit=limit,
        )
    elif file:
        # Search by uploaded image — delegate embedding to worker
        image_bytes = await file.read()
        embedding = _call_worker_embed("worker.embed.compute_face_embedding", image_bytes)
        results = qdrant.query_points(
            collection_name=FACE_COLLECTION,
            query=embedding,
            query_filter=user_filter,
            limit=limit,
        )
    else:
        raise HTTPException(status_code=400, detail="Provide either point_id or upload a face image")

    return {"results": _format_results(results.points)}


# ── Image Similarity Search ──────────────────────────────────────────────────


@router.post("/similar", summary="Find visually similar images")
async def search_similar(
    user_id: str = Depends(get_current_user),
    image_id: str | None = Query(None, description="Existing image ID to find similar images for"),
    limit: int = Query(20, ge=1, le=100),
    file: UploadFile | None = File(None, description="Upload an image to search"),
):
    """Search for visually similar images using CLIP scene embeddings."""
    qdrant = get_qdrant_client()
    user_filter = Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))])

    if image_id:
        # Find the existing scene point for this image, then recommend
        scroll_result = qdrant.scroll(
            collection_name=SCENE_COLLECTION,
            scroll_filter=Filter(must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="image_id", match=MatchValue(value=image_id)),
            ]),
            limit=1,
        )
        points, _ = scroll_result
        if not points:
            raise HTTPException(status_code=404, detail="Scene embedding not found for this image")

        results = qdrant.query_points(
            collection_name=SCENE_COLLECTION,
            query=RecommendQuery(recommend={"positive": [points[0].id]}),
            query_filter=user_filter,
            limit=limit,
        )
    elif file:
        # Delegate scene embedding to worker
        image_bytes = await file.read()
        embedding = _call_worker_embed("worker.embed.compute_scene_embedding", image_bytes)
        results = qdrant.query_points(
            collection_name=SCENE_COLLECTION,
            query=embedding,
            query_filter=user_filter,
            limit=limit,
        )
    else:
        raise HTTPException(status_code=400, detail="Provide either image_id or upload an image")

    return {"results": _format_results(results.points)}
