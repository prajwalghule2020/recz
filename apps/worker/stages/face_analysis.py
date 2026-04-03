"""Stage 2 — Face Detection + Alignment + Embedding via InsightFace FaceAnalysis.

FaceAnalysis.get() runs the full pipeline internally:
  SCRFD detection → 5-point alignment → ArcFace embedding (512-d)
"""

import logging
import numpy as np

logger = logging.getLogger(__name__)


def run_face_analysis(img_bgr: np.ndarray, app) -> list[dict]:
    """Run InsightFace on a BGR image.

    Args:
        img_bgr: OpenCV BGR image (H×W×3, uint8).
        app:     The loaded FaceAnalysis instance (from models.py singleton).

    Returns:
        List of dicts, each containing:
            - bbox:      [x1, y1, x2, y2] floats
            - det_score: detection confidence
            - embedding: 512-d L2-normalised float list
            - kps:       5 facial landmarks [[x,y], ...]
    """
    faces = app.get(img_bgr)

    results = []
    for i, face in enumerate(faces):
        emb = face.normed_embedding  # already L2-normalised 512-d
        results.append({
            "face_index": i,
            "bbox": face.bbox.tolist(),              # [x1, y1, x2, y2]
            "det_score": float(face.det_score),
            "embedding": emb.tolist(),                # 512-d
            "kps": face.kps.tolist() if face.kps is not None else None,
        })

    logger.info("Detected %d face(s)", len(results))
    return results
