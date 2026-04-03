"""Embedding tasks — Celery tasks that compute face/scene embeddings.

These are called by the API's search endpoints so the API container
doesn't need any heavy ML dependencies (torch, insightface, etc.).
"""

import io
import logging

import numpy as np
from PIL import Image, ImageOps

from celery_app import app
import models as model_store
from stages.face_analysis import run_face_analysis
from stages.scene_embed import run_scene_embed

logger = logging.getLogger(__name__)


@app.task(name="worker.embed.compute_face_embedding")
def compute_face_embedding(image_bytes_hex: str) -> list[float] | None:
    """Detect the largest face in an image and return its 512-d embedding.

    Args:
        image_bytes_hex: Hex-encoded image bytes (JSON-safe transport).

    Returns:
        List of floats (512-d embedding) or None if no face detected.
    """
    image_bytes = bytes.fromhex(image_bytes_hex)
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    img_bgr = np.array(img.convert("RGB"))[:, :, ::-1].copy()

    faces = run_face_analysis(img_bgr, model_store.face_app)
    if not faces:
        logger.warning("No face detected in uploaded search image")
        return None

    # Pick the largest face (by bounding box area)
    biggest = max(faces, key=lambda f: (f["bbox"][2] - f["bbox"][0]) * (f["bbox"][3] - f["bbox"][1]))
    return biggest["embedding"]


@app.task(name="worker.embed.compute_scene_embedding")
def compute_scene_embedding(image_bytes_hex: str) -> list[float]:
    """Generate a 512-d CLIP scene embedding from an image.

    Args:
        image_bytes_hex: Hex-encoded image bytes (JSON-safe transport).

    Returns:
        List of floats (512-d embedding).
    """
    image_bytes = bytes.fromhex(image_bytes_hex)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = ImageOps.exif_transpose(img)

    embedding = run_scene_embed(img, model_store.clip_model, model_store.clip_preprocess)
    return embedding
