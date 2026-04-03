"""Prisma client singleton for the FastAPI app."""

from prisma import Prisma

db = Prisma()


async def connect_db():
    """Connect Prisma client — call during app startup."""
    await db.connect()


async def disconnect_db():
    """Disconnect Prisma client — call during app shutdown."""
    await db.disconnect()
