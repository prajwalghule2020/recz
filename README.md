# Face-AI 

Face-AI is an intelligent, high-performance image processing architecture capable of ingesting raw images and running state-of-the-art vision models to extract faces, scene context, and hidden metadata seamlessly. The system operates as a fully integrated monorepo engineered around modern scaling principles.

## System Architecture Flow

The Face-AI structure implements a robust multi-service environment managed locally with Docker Compose and defined by a [Turborepo](https://turbo.build/repo/docs) framework:

1. **User Interaction (`apps/web`):**
   - The user interfaces with the Next.js web application. 
   - They provide images which the frontend either passes directly or indirectly to the backend. It also presents beautiful UI representations of the database vectors and processed statuses.

2. **Ingestion API (`apps/api`):**
   - A rapid-response FastAPI server. It handles standard HTTP REST routines.
   - It stores the raw image directly into **MinIO** object storage.
   - It issues a robust messaging task directly into **Celery/Redis**, tracking initial statuses in PostgreSQL via a shared Prisma connection.

3. **Background Inference Worker (`apps/worker`):**
   - A dedicated Python Celery worker completely segregated from real-time networking.
   - Using InsightFace and OpenCLIP algorithms, the worker identifies faces, corrects orientations based on EXIF data, aligns facial boundaries, and generates immense multi-dimensional analytical vectors.
   - The result arrays (`512-d` vectors) are committed directly to **Qdrant** (Vector Search DB), while operational metadata/logs revert to postgres.

4. **Shared Entities (`packages/*`):**
   - Using Turborepo, the NextJS Client and node scripts directly share `@repo/db` which instantiates the exact Prisma setup automatically.
   - UI configuration, typescript bindings, and lints all stream from the internal package directory uniformly.

## Infrastructure Map

The whole project relies heavily on these standard components provided via `docker-compose.yml`:
- **PostgreSQL**: Relational datastore holding user references, logs, boundaries, and traditional metadata. (Bounded via Prisma)
- **MinIO**: High-performance Object Storage bucket acting as a drop-in safe harbor for original photography buffers.
- **Redis**: The pure in-memory message broker that reliably queues the jobs transferring between `API` and `Worker`.
- **Qdrant**: Our core Vector Database designed explicitly to do high-scale facial mapping and scene visual-semantic similarity distance algorithms. 

## Getting Started

With Docker installed locally, spin up the entire cluster easily:
```sh
docker compose up --build
```
*This boots the API, Workers, PostgreSQL, Redis, MinIO, and Qdrant in unified harmony.*

For development, install all standard monorepo packages at the root:
```sh
pnpm install
pnpm dev
```
