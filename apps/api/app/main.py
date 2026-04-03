from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.storage import ensure_bucket
from app.core.prisma import connect_db, disconnect_db
from app.api.v1.images import router as images_router
from app.api.v1.search import router as search_router
from app.api.v1.filter import router as filter_router
from app.api.v1.clustering import router as clustering_router
from app.api.v1.people import router as people_router
from app.api.v1.events import router as events_router
from app.api.v1.places import router as places_router


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
    description="Upload images, search faces, browse people/events/places",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── All v1 routers ────────────────────────────────────────────────────────────
app.include_router(images_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")
app.include_router(filter_router, prefix="/api/v1")
app.include_router(clustering_router, prefix="/api/v1")
app.include_router(people_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(places_router, prefix="/api/v1")


@app.get("/healthz", tags=["health"])
async def health():
    return {"status": "ok"}
