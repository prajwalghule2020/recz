"""Stage 5 — Thumbnail Generation.

Creates a 300px-wide JPEG thumbnail and uploads it to MinIO alongside the original.
"""

import io
import logging

from PIL import Image

from minio_client import upload_object

logger = logging.getLogger(__name__)

THUMBNAIL_MAX_WIDTH = 300
THUMBNAIL_QUALITY = 82


def generate_thumbnail(
    img_pil: Image.Image,
    object_key: str,
) -> str:
    """Create a 300px-wide thumbnail and upload to MinIO.

    Args:
        img_pil: Orientation-corrected PIL image.
        object_key: Original object key (e.g. "user-id/image-id.jpg").

    Returns:
        The thumbnail object key (e.g. "user-id/thumbs/image-id.jpg").
    """
    # Compute proportional height
    w, h = img_pil.size
    if w <= THUMBNAIL_MAX_WIDTH:
        # Image is already small enough — use as-is
        thumb = img_pil.copy()
    else:
        ratio = THUMBNAIL_MAX_WIDTH / w
        new_h = int(h * ratio)
        thumb = img_pil.resize((THUMBNAIL_MAX_WIDTH, new_h), Image.LANCZOS)

    # Convert to RGB if necessary (handles RGBA, P, etc.)
    if thumb.mode not in ("RGB", "L"):
        thumb = thumb.convert("RGB")

    # Encode to JPEG bytes
    buf = io.BytesIO()
    thumb.save(buf, format="JPEG", quality=THUMBNAIL_QUALITY, optimize=True)
    thumb_bytes = buf.getvalue()

    # Build thumbnail key: insert /thumbs/ before the filename
    parts = object_key.rsplit("/", 1)
    if len(parts) == 2:
        thumb_key = f"{parts[0]}/thumbs/{parts[1]}"
    else:
        thumb_key = f"thumbs/{object_key}"

    # Ensure .jpg extension
    if not thumb_key.lower().endswith((".jpg", ".jpeg")):
        thumb_key = thumb_key.rsplit(".", 1)[0] + ".jpg"

    upload_object(thumb_key, thumb_bytes, "image/jpeg")
    logger.info("Thumbnail uploaded: %s (%d bytes, %dx%d)", thumb_key, len(thumb_bytes), thumb.width, thumb.height)

    return thumb_key
