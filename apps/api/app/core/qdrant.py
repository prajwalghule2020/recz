"""Shared Qdrant client for API (read-only usage — search & recommend)."""

import logging

from qdrant_client import QdrantClient

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: QdrantClient | None = None

FACE_COLLECTION = "faces"
SCENE_COLLECTION = "scenes"


def get_qdrant_client() -> QdrantClient:
    """Lazy-initialised singleton Qdrant client."""
    global _client
    if _client is None:
        _client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
        logger.info("Qdrant client connected → %s:%s", settings.qdrant_host, settings.qdrant_port)
    return _client
