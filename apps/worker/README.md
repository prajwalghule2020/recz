# Face-AI Celery Worker

The Celery Worker encapsulates the core artificial intelligence operations, processing image analysis tasks queued by the API.

## Overview

This worker runs a robust 4-stage pipeline orchestrated by Celery. Since deep learning models are computationally expensive and require heavy dependencies (like PyTorch and ONNX), separating this logic into a dedicated worker allows for independent scaling without blocking the API.

### The Pipeline Structure
When an image is handed to the worker, it goes through the following distinct steps:
1. **Load & Preprocess (Pillow):** Reads the image buffer from **MinIO**, applies an EXIF transpose rotation if necessary to orient the image correctly, and prepares the arrays (RGB/BGR).
2. **Face Analysis (InsightFace):** Executes detection, facial alignment, and feature embedding (resulting in a 512-dimension vector per face).
3. **Scene Embedding (OpenCLIP):** Analyzes the full frame using a ViT-B/16 vision-transformer base model to generate a 512-dimension scene embedding.
4. **Metadata Extraction (piexif):** Gathers photo-specific metadata such as original datetimes and GPS locations (latitude and longitude).
5. **Storage & Result Recording:** 
    - The high-dimensional feature vectors (from Faces & Scenes) are upserted into **Qdrant** (Vector Database) for fast similarity searches.
    - Standard metadata and final job states (done/failed) are tracked safely in **PostgreSQL** via **Prisma**.

## Tech Stack
- **Framework:** Celery
- **Database:** Prisma ORM (via PostgreSQL)
- **Vector DB:** Qdrant Client
- **Blob Storage:** Boto3 (MinIO)
- **Computer Vision:** PyTorch, ONNXRuntime, InsightFace, OpenCLIP, OpenCV, Pillow

## How to Run
Trigger the worker within the Turborepo stack or via the Docker orchestration:
```bash
docker compose up worker
```
