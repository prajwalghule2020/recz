FROM python:3.11-slim

WORKDIR /app

# System deps (OpenCV, build tools) + Node.js for Prisma generate
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

# Install Python deps
COPY apps/worker/pyproject.toml .
RUN pip install --no-cache-dir pip setuptools wheel && \
    pip install --no-cache-dir -e .

# Copy shared Prisma schema, swap JS generator → Python generator, then generate
COPY packages/db/prisma/ ./prisma/
RUN sed -i 's/provider = "prisma-client-js"/provider = "prisma-client-py"/' ./prisma/schema.prisma \
    && python -m prisma generate --schema=./prisma/schema.prisma

# Pre-download InsightFace buffalo_l model pack during build
ENV INSIGHTFACE_HOME=/models/insightface
RUN python -c "\
import os; os.makedirs('/models/insightface', exist_ok=True); \
import insightface; \
app = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider']); \
app.prepare(ctx_id=0, det_size=(640,640)); \
print('buffalo_l downloaded and verified')"

ENV TORCH_HOME=/models/openclip

# Copy worker code
COPY apps/worker/ .

CMD ["celery", "-A", "celery_app", "worker", \
     "--loglevel=info", \
     "--concurrency=1", \
     "--pool=solo"]
