# Face-AI

Face-AI is a monorepo for AI-powered photo analysis using Next.js, FastAPI, Celery, PostgreSQL, Redis, MinIO, and Qdrant.

## Architecture

1. apps/web (Next.js): user interface for upload, browse, and search.
2. apps/api (FastAPI): upload/search/filter APIs and auth-aware data access.
3. apps/worker (Celery): asynchronous face/scene embedding and clustering pipelines.
4. packages/*: shared workspace packages and configuration.

## Run Modes

### 1) Hybrid local development (recommended)

Use containers only for infrastructure and worker, and run web + api locally.

- Uses docker-compose.local.yml for:
  - postgres
  - redis
  - minio
  - qdrant
  - worker
- Runs locally via Turbo:
  - apps/web
  - apps/api

Commands:

```sh
conda env create -f environment.yml # first time only
conda activate face-ai
pnpm install
pnpm dev
```

What pnpm dev does:

1. Starts infra + worker in background with docker-compose.local.yml.
2. Starts local dev servers via Turbo for web and api.

Stop infra + worker:

```sh
pnpm run dev:infra:down
```

### 2) Full Docker mode

Run everything in containers (including web and api):

```sh
pnpm run dev:docker
```

Equivalent direct command:

```sh
docker compose up --build
```

### 3) Infra only (manual app start)

If you want only infra + worker in containers:

```sh
pnpm run dev:infra
```

Then start apps manually as needed.

## Compose Files

- docker-compose.yml: full stack (web + api + worker + infra).
- docker-compose.local.yml: minimal local-dev infra + worker only.
