"""Stage 4 — Metadata Extraction (EXIF, GPS, timestamp, camera info).

The EXIF orientation fix (ImageOps.exif_transpose) is applied in the pipeline
coordinator BEFORE this stage runs, so we only read fields here.
"""

import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

import piexif
from PIL import Image

logger = logging.getLogger(__name__)


@dataclass
class PhotoMeta:
    datetime_original: Optional[datetime] = None
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


def _rational_to_float(rational_tuple) -> float:
    """Convert EXIF rational (numerator, denominator) to float."""
    if isinstance(rational_tuple, tuple) and len(rational_tuple) == 2:
        num, den = rational_tuple
        return num / den if den != 0 else 0.0
    return float(rational_tuple)


def _dms_to_decimal(dms_rationals, ref: str) -> Optional[float]:
    """Convert EXIF GPS DMS rational tuples to decimal degrees.

    Args:
        dms_rationals: ((d_num, d_den), (m_num, m_den), (s_num, s_den))
        ref:           'N', 'S', 'E', or 'W'
    """
    try:
        degrees = _rational_to_float(dms_rationals[0])
        minutes = _rational_to_float(dms_rationals[1])
        seconds = _rational_to_float(dms_rationals[2])
        decimal = degrees + minutes / 60.0 + seconds / 3600.0
        if ref in ("S", "W"):
            decimal = -decimal
        return round(decimal, 8)
    except (IndexError, TypeError, ZeroDivisionError):
        return None


def _decode_string(raw) -> Optional[str]:
    """Safely decode an EXIF string value."""
    if raw is None:
        return None
    if isinstance(raw, bytes):
        return raw.decode("utf-8", errors="replace").strip().rstrip("\x00")
    return str(raw).strip()


def _parse_datetime(raw) -> Optional[datetime]:
    """Parse EXIF DateTimeOriginal string → datetime."""
    s = _decode_string(raw)
    if not s:
        return None
    for fmt in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y:%m:%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def extract_metadata(img_pil: Image.Image) -> PhotoMeta:
    """Extract EXIF metadata from a PIL image.

    Args:
        img_pil: Original PIL image (before orientation fix is fine —
                 we only read tags, not pixel data).

    Returns:
        PhotoMeta dataclass with all extracted fields (None where absent).
    """
    meta = PhotoMeta()
    meta.width, meta.height = img_pil.size

    # Try to load EXIF data
    try:
        exif_bytes = img_pil.info.get("exif", b"")
        if not exif_bytes:
            logger.debug("No EXIF data found")
            return meta
        exif_dict = piexif.load(exif_bytes)
    except Exception as e:
        logger.warning("Failed to parse EXIF: %s", e)
        return meta

    # ── DateTimeOriginal ──────────────────────────────────────────────────
    exif_ifd = exif_dict.get("Exif", {})
    meta.datetime_original = _parse_datetime(
        exif_ifd.get(piexif.ExifIFD.DateTimeOriginal)
    )

    # ── Camera make / model ───────────────────────────────────────────────
    zeroth_ifd = exif_dict.get("0th", {})
    meta.camera_make = _decode_string(zeroth_ifd.get(piexif.ImageIFD.Make))
    meta.camera_model = _decode_string(zeroth_ifd.get(piexif.ImageIFD.Model))

    # ── GPS ───────────────────────────────────────────────────────────────
    gps_ifd = exif_dict.get("GPS", {})
    lat_data = gps_ifd.get(piexif.GPSIFD.GPSLatitude)
    lat_ref = _decode_string(gps_ifd.get(piexif.GPSIFD.GPSLatitudeRef))
    lon_data = gps_ifd.get(piexif.GPSIFD.GPSLongitude)
    lon_ref = _decode_string(gps_ifd.get(piexif.GPSIFD.GPSLongitudeRef))

    if lat_data and lat_ref:
        meta.gps_lat = _dms_to_decimal(lat_data, lat_ref)
    if lon_data and lon_ref:
        meta.gps_lon = _dms_to_decimal(lon_data, lon_ref)

    logger.info(
        "Metadata extracted: datetime=%s, gps=(%s, %s), camera=%s %s",
        meta.datetime_original, meta.gps_lat, meta.gps_lon,
        meta.camera_make, meta.camera_model,
    )
    return meta
