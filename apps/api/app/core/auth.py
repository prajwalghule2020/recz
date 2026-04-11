"""Auth dependency — validates Better Auth session tokens via Prisma."""

from datetime import datetime, timezone
from fastapi import HTTPException, Request

from app.core.prisma import db


async def get_current_user(request: Request) -> str:
    """Extract and validate session token from Authorization header or cookie.

    Returns the authenticated user's ID.
    Raises 401 if no valid session is found.
    """
    # Try Authorization header first, then fall back to cookie
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        token = request.cookies.get("__Secure-better-auth.session_token") or request.cookies.get("better-auth.session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Better Auth stores cookie as "token.signature" — extract just the token part
    if "." in token:
        token = token.split(".")[0]

    # Validate session against the database
    session = await db.session.find_first(
        where={
            "token": token,
            "expiresAt": {"gt": datetime.now(timezone.utc)},
        }
    )
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return session.userId
