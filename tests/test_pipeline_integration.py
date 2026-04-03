"""Integration test — Full pipeline end-to-end.

⚠ REQUIRES all Docker services running:
     docker compose up -d redis postgres minio qdrant

   Also requires insightface + open_clip installed (run inside Docker or conda env with ML deps).
   Skipped automatically if dependencies are missing.
"""

import io
import json
import os
import sys
import uuid

import numpy as np
import pytest
from PIL import Image

# Skip if heavy deps missing
insightface = pytest.importorskip("insightface", reason="insightface not installed")
open_clip = pytest.importorskip("open_clip", reason="open_clip not installed")
qdrant_client_mod = pytest.importorskip("qdrant_client", reason="qdrant_client not installed")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "worker"))


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def face_app():
    app = insightface.app.FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
    app.prepare(ctx_id=0, det_size=(640, 640))
    return app


@pytest.fixture(scope="module")
def clip_model():
    model, _, preprocess = open_clip.create_model_and_transforms("ViT-B-16", pretrained="laion2b_s34b_b88k")
    model.eval()
    return model, preprocess


@pytest.fixture
def sample_image_pil():
    """Load fixture or generate a simple colour image."""
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "sample_face.jpg")
    if os.path.exists(fixture_path):
        return Image.open(fixture_path).convert("RGB")
    # Fallback: gradient image (won't have faces, but tests the pipeline flow)
    arr = np.tile(np.linspace(0, 255, 640, dtype=np.uint8), (480, 1))
    arr = np.stack([arr, arr, arr], axis=-1)
    return Image.fromarray(arr, "RGB")


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestPipelineStages:
    """Test each stage independently, then all together."""

    def test_stage1_orientation_fix(self, sample_image_pil):
        """ImageOps.exif_transpose should not crash on images without EXIF."""
        from PIL import ImageOps
        fixed = ImageOps.exif_transpose(sample_image_pil)
        assert fixed.size == sample_image_pil.size

    def test_stage2_face_analysis(self, sample_image_pil, face_app):
        from stages.face_analysis import run_face_analysis
        img_bgr = np.array(sample_image_pil)[:, :, ::-1].copy()
        results = run_face_analysis(img_bgr, face_app)
        assert isinstance(results, list)
        # Each result should have the correct keys
        for r in results:
            assert set(r.keys()) >= {"face_index", "bbox", "det_score", "embedding"}
            assert len(r["embedding"]) == 512

    def test_stage3_scene_embed(self, sample_image_pil, clip_model):
        from stages.scene_embed import run_scene_embed
        model, preprocess = clip_model
        embedding = run_scene_embed(sample_image_pil, model, preprocess)
        assert isinstance(embedding, list)
        assert len(embedding) == 512
        # Check L2 normalised
        norm = np.linalg.norm(embedding)
        assert abs(norm - 1.0) < 0.01

    def test_stage4_metadata(self, sample_image_pil):
        from stages.metadata import extract_metadata
        meta = extract_metadata(sample_image_pil)
        assert meta.width is not None
        assert meta.height is not None
        assert meta.width > 0 and meta.height > 0

    def test_qdrant_upsert(self):
        """Test Qdrant upsert if Qdrant is running (skip otherwise)."""
        from qdrant_client import QdrantClient
        try:
            client = QdrantClient(host="localhost", port=6333, timeout=3)
            client.get_collections()
        except Exception:
            pytest.skip("Qdrant not reachable at localhost:6333")

        from storage.qdrant_store import upsert_scene

        class FakeMeta:
            datetime_original = None
            gps_lat = None
            gps_lon = None
            camera_model = None

        test_embedding = np.random.randn(512).tolist()
        pid = upsert_scene(
            user_id="test-user",
            image_id=str(uuid.uuid4()),
            job_id=str(uuid.uuid4()),
            scene_embedding=test_embedding,
            photo_meta=FakeMeta(),
        )
        assert isinstance(pid, str)
        assert len(pid) == 36  # UUID format


class TestFullPipelineFlow:
    """Simulate the pipeline coordinator flow (without Celery)."""

    def test_end_to_end(self, sample_image_pil, face_app, clip_model):
        from PIL import ImageOps
        from stages.face_analysis import run_face_analysis
        from stages.scene_embed import run_scene_embed
        from stages.metadata import extract_metadata

        # Stage 1
        img_fixed = ImageOps.exif_transpose(sample_image_pil)
        img_bgr = np.array(img_fixed.convert("RGB"))[:, :, ::-1].copy()

        # Stage 2
        faces = run_face_analysis(img_bgr, face_app)
        assert isinstance(faces, list)

        # Stage 3
        model, preprocess = clip_model
        scene_emb = run_scene_embed(img_fixed.convert("RGB"), model, preprocess)
        assert len(scene_emb) == 512

        # Stage 4
        meta = extract_metadata(sample_image_pil)
        assert meta.width > 0

        # Summary
        print(f"\n✓ Pipeline complete: {len(faces)} face(s), scene_dim={len(scene_emb)}, "
              f"size={meta.width}×{meta.height}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
