from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.storage import ensure_bucket
from app.core.prisma import connect_db, disconnect_db
from app.api.v1.images import router as images_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure MinIO bucket + connect Prisma
    ensure_bucket()
    await connect_db()
    yield
    # Shutdown: disconnect Prisma
    await disconnect_db()


app = FastAPI(
    title="Face-AI API",
    description="Upload images and run the face recognition pipeline",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images_router, prefix="/api/v1")


@app.get("/healthz", tags=["health"])
async def health():
    return {"status": "ok"}
