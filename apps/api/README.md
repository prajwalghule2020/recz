# Face-AI APIGateway

The API application serves as the primary entry point for managing image uploads and interfacing with the Face-AI pipeline. Built with FastAPI, it provides a high-performance asynchronous REST backend.

## Overview

The API is responsible for taking user uploads, ensuring safe ingestion, and queuing processing jobs. This separates the fast web request layer from the heavy computer vision operations, providing a responsive experience. Let's look at the core responsibilities:
- **Image Upload:** Accept image uploads via `multipart/form-data`.
- **Blob Storage:** Upload the ingested images directly into **MinIO** object storage.
- **Job Queuing:** Push an AI pipeline processing task via **Celery** (using Redis as the message broker).
- **Database Interaction:** It uses a shared **Prisma** package (`@repo/db`) to create and update job statuses inside PostgreSQL.
- **Health Checks & Configuration:** Simple endpoints like `/healthz` to check the service status, and `lifespan` events for graceful startup (connecting to the database and ensuring the storage bucket exists).

## Tech Stack
- **Framework:** FastAPI
- **Database:** Prisma ORM, PostgreSQL
- **Object Storage:** Boto3, MinIO
- **Task Queue:** Celery, Redis

## How to Run
Usually, this service is executed as part of the overall Turbo repo using:
```bash
pnpm turbo dev --filter=api
```
Or directly from the Docker configuration via:
```bash
docker compose up api
```
