"""Qdrant vector storage — upsert face and scene embeddings."""

import logging
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)

from config import settings

logger = logging.getLogger(__name__)

_client = None
FACE_COLLECTION = "faces"
SCENE_COLLECTION = "scenes"
VECTOR_DIM = 512
_collections_ready = False


def _get_client() -> QdrantClient:
    """Lazy client — created on first call, not at import time."""
    global _client, _collections_ready
    if _client is None:
        _client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
    if not _collections_ready:
        _ensure_collection(FACE_COLLECTION)
        _ensure_collection(SCENE_COLLECTION)
        _collections_ready = True
    return _client


def _ensure_collection(name: str):
    """Create collection if it doesn't exist."""
    existing = [c.name for c in _client.get_collections().collections]
    if name not in existing:
        _client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )
        logger.info("Created Qdrant collection: %s", name)


def upsert_faces(
    user_id: str,
    image_id: str,
    job_id: str,
    face_results: list[dict],
    photo_meta,
) -> list[str]:
    """Upsert face embeddings into the 'faces' collection.

    Returns:
        List of Qdrant point IDs (one per face).
    """
    if not face_results:
        return []

    points = []
    point_ids = []
    for face in face_results:
        pid = str(uuid.uuid4())
        point_ids.append(pid)
        points.append(
            PointStruct(
                id=pid,
                vector=face["embedding"],
                payload={
                    "user_id": user_id,
                    "image_id": image_id,
                    "job_id": job_id,
                    "face_index": face["face_index"],
                    "bbox": face["bbox"],
                    "det_score": face["det_score"],
                    "datetime": photo_meta.datetime_original.isoformat() if photo_meta.datetime_original else None,
                    "lat": photo_meta.gps_lat,
                    "lon": photo_meta.gps_lon,
                },
            )
        )

    _get_client().upsert(collection_name=FACE_COLLECTION, points=points)
    logger.info("Upserted %d face vectors to Qdrant", len(points))
    return point_ids


def upsert_scene(
    user_id: str,
    image_id: str,
    job_id: str,
    scene_embedding: list[float],
    photo_meta,
) -> str:
    """Upsert scene embedding into the 'scenes' collection.

    Returns:
        Qdrant point ID.
    """
    pid = str(uuid.uuid4())
    _get_client().upsert(
        collection_name=SCENE_COLLECTION,
        points=[
            PointStruct(
                id=pid,
                vector=scene_embedding,
                payload={
                    "user_id": user_id,
                    "image_id": image_id,
                    "job_id": job_id,
                    "datetime": photo_meta.datetime_original.isoformat() if photo_meta.datetime_original else None,
                    "lat": photo_meta.gps_lat,
                    "lon": photo_meta.gps_lon,
                    "camera_model": photo_meta.camera_model,
                },
            )
        ],
    )
    logger.info("Upserted scene vector to Qdrant  point_id=%s", pid)
    return pid
