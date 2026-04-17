FROM python:3.11-slim

WORKDIR /app

# ── System deps ──────────────────────────────────────────────────────────────
# OpenCV headless + build tools + Node.js for Prisma generate
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0t64 \
    libsm6 \
    libxrender1 \
    libxext6 \
    curl \
    build-essential \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Step 1: Install CPU-only PyTorch FIRST ───────────────────────────────────
# This must happen BEFORE `pip install -e .` so that open_clip_torch and
# insightface see the already-installed CPU wheels and don't trigger a
# CUDA-enabled re-install via the default PyPI index.
# The +cpu local version identifier pins CPU-only; no cuDNN/NCCL/cuSPARSELt.
RUN pip install --no-cache-dir pip setuptools wheel && \
    pip install --no-cache-dir \
        torch==2.3.0+cpu \
        torchvision==0.18.0+cpu \
        --index-url https://download.pytorch.org/whl/cpu

# ── Step 2: Install remaining Python deps (reads pyproject.toml) ─────────────
# torch/torchvision are already satisfied, so pip skips them.
COPY apps/worker/pyproject.toml .
RUN pip install --no-cache-dir -e . \
    --extra-index-url https://download.pytorch.org/whl/cpu

# ── Step 3: Prisma schema → Python client ────────────────────────────────────
COPY packages/db/prisma/ ./prisma/
RUN sed -i 's/provider = "prisma-client-js"/provider = "prisma-client-py"/' ./prisma/schema.prisma \
    && python -m prisma generate --schema=./prisma/schema.prisma

# ── Step 4: Pre-download InsightFace buffalo_l model (CPU only) ──────────────
ENV INSIGHTFACE_HOME=/models/insightface
RUN python -c "\
import os; os.makedirs('/models/insightface', exist_ok=True); \
import insightface; \
app = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider']); \
app.prepare(ctx_id=0, det_size=(640,640)); \
print('buffalo_l downloaded and verified (CPU)')"

# ── Step 5: Pre-download OpenCLIP ViT-B-16 weights (CPU) ─────────────────────
ENV TORCH_HOME=/models/openclip
RUN python -c "\
import os; os.makedirs('/models/openclip', exist_ok=True); \
import open_clip; \
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-16', pretrained='laion2b_s34b_b88k'); \
print('OpenCLIP ViT-B-16 downloaded and verified (CPU)')"

# ── App code ──────────────────────────────────────────────────────────────────
COPY apps/worker/ .

CMD ["celery", "-A", "celery_app", "worker", \
     "--loglevel=info", \
     "--concurrency=1", \
     "--pool=solo"]
