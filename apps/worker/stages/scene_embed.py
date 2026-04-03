"""Stage 3 — Scene Embedding via OpenCLIP ViT-B/16.

Encodes the full image (not individual face crops) into a 512-d scene vector.
"""

import logging

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

logger = logging.getLogger(__name__)


def run_scene_embed(img_pil: Image.Image, model, preprocess) -> list[float]:
    """Encode a full PIL image into a 512-d scene embedding.

    Args:
        img_pil:    PIL RGB image (the orientation-corrected image).
        model:      The loaded OpenCLIP model (from models.py singleton).
        preprocess: The corresponding transform.

    Returns:
        512-d L2-normalised float list.
    """
    device = next(model.parameters()).device
    tensor = preprocess(img_pil).unsqueeze(0).to(device)

    with torch.no_grad(), torch.amp.autocast(device_type=device.type, enabled=device.type == "cuda"):
        features = model.encode_image(tensor)

    # L2 normalise
    features = F.normalize(features, dim=-1)
    embedding = features.squeeze(0).cpu().numpy().tolist()

    logger.info("Scene embedding generated (dim=%d)", len(embedding))
    return embedding
