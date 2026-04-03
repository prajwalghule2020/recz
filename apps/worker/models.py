"""Singleton model loader — loaded once per worker process via Celery signal.

InsightFace FaceAnalysis handles detection + alignment + embedding in one call.
OpenCLIP is loaded separately for whole-image scene embeddings.
"""

import logging
import os

import insightface
import open_clip
import torch
from celery.signals import worker_process_init

from config import settings

logger = logging.getLogger(__name__)

# ── Global singletons (populated on worker start) ────────────────────────────

face_app: insightface.app.FaceAnalysis | None = None
clip_model = None
clip_preprocess = None
clip_tokenizer = None


@worker_process_init.connect
def load_models(**kwargs):
    """Called once when each Celery worker process starts."""
    global face_app, clip_model, clip_preprocess, clip_tokenizer

    # ── InsightFace ───────────────────────────────────────────────────────
    os.environ["INSIGHTFACE_HOME"] = settings.insightface_home
    logger.info("Loading InsightFace buffalo_l …")

    providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
    face_app = insightface.app.FaceAnalysis(
        name="buffalo_l",
        providers=providers,
    )
    face_app.prepare(ctx_id=0, det_size=(640, 640))
    logger.info("InsightFace ready  (det_size=640, providers=%s)", providers)

    # ── OpenCLIP ──────────────────────────────────────────────────────────
    os.environ["TORCH_HOME"] = settings.openclip_cache_dir
    logger.info("Loading OpenCLIP ViT-B-16 (laion2b_s34b_b88k) …")

    clip_model, _, clip_preprocess = open_clip.create_model_and_transforms(
        "ViT-B-16",
        pretrained="laion2b_s34b_b88k",
    )
    clip_model.eval()

    # Move to GPU if available
    if torch.cuda.is_available():
        clip_model = clip_model.cuda()
        logger.info("OpenCLIP moved to CUDA")

    clip_tokenizer = open_clip.get_tokenizer("ViT-B-16")
    logger.info("OpenCLIP ready")
