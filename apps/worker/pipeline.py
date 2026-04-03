"""Pipeline coordinator — Celery task that runs the full 4-stage pipeline.

Flow:
  [1] Load image + EXIF orientation fix  (Pillow ImageOps.exif_transpose)
  [2] FaceAnalysis (InsightFace)         (detect + align + embed → 512-d per face)
  [3] OpenCLIP ViT-B/16                  (scene embedding → 512-d)
  [4] Metadata extraction                (piexif — GPS, datetime, camera)
      ↓
  Store → Qdrant (vectors) + Postgres (metadata + job update)
"""

import io
import json
import logging
import uuid
from datetime import datetime, timezone

import numpy as np
from PIL import Image, ImageOps

from celery_app import app
import models as model_store
from stages.face_analysis import run_face_analysis
from stages.scene_embed import run_scene_embed
from stages.metadata import extract_metadata
from storage.qdrant_store import upsert_faces, upsert_scene
from storage.postgres_store import update_job_status, save_metadata, save_face_records
from minio_client import read_object_bytes
from stages.thumbnail import generate_thumbnail

logger = logging.getLogger(__name__)


@app.task(
    name="worker.pipeline.process_image_pipeline",
    bind=True,
    max_retries=2,
    default_retry_delay=30,
)
def process_image_pipeline(self, job_id: str, object_key: str, user_id: str, image_id: str):
    """Run the full 4-stage AI pipeline on a single uploaded image."""

    logger.info("Pipeline START  job=%s  key=%s", job_id, object_key)
    update_job_status(job_id, "processing")

    try:
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Stage 1: Load + EXIF orientation fix
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        raw_bytes = read_object_bytes(object_key)
        img_pil_original = Image.open(io.BytesIO(raw_bytes))
        img_pil = ImageOps.exif_transpose(img_pil_original)    # fix rotation
        img_rgb = np.array(img_pil.convert("RGB"))
        img_bgr = img_rgb[:, :, ::-1].copy()                    # InsightFace expects BGR
        logger.info("[1/4] Image loaded & oriented  (%dx%d)", img_pil.width, img_pil.height)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Stage 2: FaceAnalysis (detection + alignment + embedding)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        face_results = run_face_analysis(img_bgr, model_store.face_app)
        logger.info("[2/4] FaceAnalysis done  faces=%d", len(face_results))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Stage 3: Scene embedding (OpenCLIP)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        scene_embedding = run_scene_embed(
            img_pil.convert("RGB"),
            model_store.clip_model,
            model_store.clip_preprocess,
        )
        logger.info("[3/4] Scene embedding done  dim=%d", len(scene_embedding))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Stage 4: Metadata extraction
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        photo_meta = extract_metadata(img_pil_original)  # use original (before transpose) for EXIF bytes
        logger.info("[4/4] Metadata extracted  datetime=%s  gps=(%s,%s)",
                     photo_meta.datetime_original, photo_meta.gps_lat, photo_meta.gps_lon)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Stage 5: Thumbnail generation
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        thumbnail_key = generate_thumbnail(img_pil.convert("RGB"), object_key)
        logger.info("[5/5] Thumbnail generated → %s", thumbnail_key)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Store results
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        # Qdrant — face embeddings
        face_point_ids = upsert_faces(
            user_id=user_id,
            image_id=image_id,
            job_id=job_id,
            face_results=face_results,
            photo_meta=photo_meta,
        )

        # Qdrant — scene embedding
        upsert_scene(
            user_id=user_id,
            image_id=image_id,
            job_id=job_id,
            scene_embedding=scene_embedding,
            photo_meta=photo_meta,
        )

        # Postgres — metadata
        save_metadata(
            job_id=job_id,
            image_id=image_id,
            photo_meta=photo_meta,
        )

        # Postgres — face records
        save_face_records(
            job_id=job_id,
            image_id=image_id,
            face_results=face_results,
            qdrant_point_ids=face_point_ids,
        )

        # Mark job done (include thumbnail key)
        update_job_status(job_id, "done", face_count=len(face_results), thumbnail_key=thumbnail_key)
        logger.info("Pipeline DONE  job=%s  faces=%d", job_id, len(face_results))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Clustering is available manually via the /api/v1/cluster endpoints.
        # Auto-triggering after every upload was causing stale IDs on the frontend
        # because it deletes + recreates all person/event/place records each time.
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    except Exception as exc:
        logger.exception("Pipeline FAILED  job=%s", job_id)
        update_job_status(job_id, "failed", error_msg=str(exc))
        raise self.retry(exc=exc)
