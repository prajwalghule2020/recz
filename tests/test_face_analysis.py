"""Unit test — FaceAnalysis (InsightFace buffalo_l).

⚠ REQUIRES: insightface + onnxruntime installed, and buffalo_l model downloaded.
   Best run inside the worker Docker container or on a machine with the model.
   Skipped automatically if InsightFace is not available.
"""

import io
import sys
import os

import numpy as np
import pytest
from PIL import Image

# Mark entire module as skippable if insightface isn't installed
insightface = pytest.importorskip("insightface", reason="insightface not installed — run in Docker")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "worker"))
from stages.face_analysis import run_face_analysis


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def face_app():
    """Load the FaceAnalysis model once for all tests in this module."""
    app = insightface.app.FaceAnalysis(
        name="buffalo_l",
        providers=["CPUExecutionProvider"],
    )
    app.prepare(ctx_id=0, det_size=(640, 640))
    return app


def _create_blank_image(w=640, h=480) -> np.ndarray:
    """A blank image with no faces — useful for negative test."""
    return np.zeros((h, w, 3), dtype=np.uint8)


def _load_sample_image() -> np.ndarray | None:
    """Try to load a test fixture image."""
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "sample_face.jpg")
    if os.path.exists(fixture_path):
        img = Image.open(fixture_path).convert("RGB")
        return np.array(img)[:, :, ::-1].copy()  # RGB → BGR
    return None


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestFaceAnalysis:
    def test_no_faces_on_blank(self, face_app):
        """A blank black image should detect zero faces."""
        img_bgr = _create_blank_image()
        results = run_face_analysis(img_bgr, face_app)
        assert isinstance(results, list)
        assert len(results) == 0

    def test_result_structure(self, face_app):
        """If a sample image with faces is available, check output shape."""
        img_bgr = _load_sample_image()
        if img_bgr is None:
            pytest.skip("No fixture sample_face.jpg found")

        results = run_face_analysis(img_bgr, face_app)
        assert len(results) >= 1, "Expected at least 1 face in sample image"

        face = results[0]
        assert "bbox" in face
        assert "det_score" in face
        assert "embedding" in face
        assert len(face["bbox"]) == 4
        assert 0 <= face["det_score"] <= 1.0
        assert len(face["embedding"]) == 512, f"Expected 512-d embedding, got {len(face['embedding'])}"

    def test_embedding_is_normalised(self, face_app):
        """Face embeddings should be L2-normalised (norm ≈ 1.0)."""
        img_bgr = _load_sample_image()
        if img_bgr is None:
            pytest.skip("No fixture sample_face.jpg found")

        results = run_face_analysis(img_bgr, face_app)
        if not results:
            pytest.skip("No faces detected")

        emb = np.array(results[0]["embedding"])
        norm = np.linalg.norm(emb)
        assert abs(norm - 1.0) < 0.01, f"Embedding L2 norm = {norm}, expected ~1.0"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
