"""Unit test — EXIF / GPS metadata extraction.

Runs WITHOUT any ML models or Docker services.
Uses a synthetic EXIF image created in-memory with piexif.
"""

import io
from datetime import datetime

import numpy as np
import piexif
import pytest
from PIL import Image

# Adjust path so we can import the worker module directly
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from apps.worker.stages.metadata import extract_metadata, _dms_to_decimal


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_rational(value: float) -> tuple[int, int]:
    """Convert a float to an EXIF rational tuple."""
    denom = 10000
    return (int(value * denom), denom)


def _create_test_image_with_exif(
    width: int = 200,
    height: int = 150,
    dt: str = "2025:06:15 14:30:00",
    lat: float = 28.6139,
    lon: float = 77.2090,
    make: str = "TestCam",
    model: str = "TX-100",
) -> Image.Image:
    """Create a synthetic PIL image with embedded EXIF data."""
    img = Image.fromarray(np.random.randint(0, 255, (height, width, 3), dtype=np.uint8), "RGB")

    # Build EXIF dict
    zeroth_ifd = {
        piexif.ImageIFD.Make: make.encode(),
        piexif.ImageIFD.Model: model.encode(),
    }
    exif_ifd = {
        piexif.ExifIFD.DateTimeOriginal: dt.encode(),
    }

    # GPS: convert decimal → DMS rationals
    lat_deg = int(abs(lat))
    lat_min = int((abs(lat) - lat_deg) * 60)
    lat_sec = (abs(lat) - lat_deg - lat_min / 60) * 3600

    lon_deg = int(abs(lon))
    lon_min = int((abs(lon) - lon_deg) * 60)
    lon_sec = (abs(lon) - lon_deg - lon_min / 60) * 3600

    gps_ifd = {
        piexif.GPSIFD.GPSLatitude: (
            _make_rational(lat_deg),
            _make_rational(lat_min),
            _make_rational(lat_sec),
        ),
        piexif.GPSIFD.GPSLatitudeRef: ("N" if lat >= 0 else "S").encode(),
        piexif.GPSIFD.GPSLongitude: (
            _make_rational(lon_deg),
            _make_rational(lon_min),
            _make_rational(lon_sec),
        ),
        piexif.GPSIFD.GPSLongitudeRef: ("E" if lon >= 0 else "W").encode(),
    }

    exif_dict = {"0th": zeroth_ifd, "Exif": exif_ifd, "GPS": gps_ifd}
    exif_bytes = piexif.dump(exif_dict)

    # Attach EXIF to image
    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif_bytes)
    buf.seek(0)
    return Image.open(buf)


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestDmsToDecimal:
    def test_north(self):
        # 28° 36' 50.04" N ≈ 28.6139
        dms = ((28, 1), (36, 1), (5004, 100))
        result = _dms_to_decimal(dms, "N")
        assert result is not None
        assert abs(result - 28.6139) < 0.001

    def test_south(self):
        dms = ((33, 1), (51, 1), (5400, 100))
        result = _dms_to_decimal(dms, "S")
        assert result is not None
        assert result < 0

    def test_invalid_data(self):
        result = _dms_to_decimal(None, "N")
        assert result is None


class TestExtractMetadata:
    def test_full_exif(self):
        img = _create_test_image_with_exif()
        meta = extract_metadata(img)

        assert meta.width == 200
        assert meta.height == 150
        assert meta.camera_make == "TestCam"
        assert meta.camera_model == "TX-100"
        assert meta.datetime_original is not None
        assert meta.datetime_original.year == 2025
        assert meta.datetime_original.month == 6
        assert meta.gps_lat is not None
        assert abs(meta.gps_lat - 28.6139) < 0.01
        assert meta.gps_lon is not None
        assert abs(meta.gps_lon - 77.2090) < 0.01

    def test_no_exif(self):
        """Image with no EXIF should return None for all optional fields."""
        img = Image.fromarray(np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8), "RGB")
        meta = extract_metadata(img)

        assert meta.width == 100
        assert meta.height == 100
        assert meta.datetime_original is None
        assert meta.gps_lat is None
        assert meta.gps_lon is None
        assert meta.camera_make is None

    def test_partial_exif_no_gps(self):
        """Image with datetime but no GPS."""
        img = Image.fromarray(np.random.randint(0, 255, (50, 80, 3), dtype=np.uint8), "RGB")
        exif_dict = {
            "0th": {piexif.ImageIFD.Make: b"Phone"},
            "Exif": {piexif.ExifIFD.DateTimeOriginal: b"2024:01:01 12:00:00"},
        }
        exif_bytes = piexif.dump(exif_dict)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", exif=exif_bytes)
        buf.seek(0)

        meta = extract_metadata(Image.open(buf))
        assert meta.datetime_original is not None
        assert meta.datetime_original.year == 2024
        assert meta.camera_make == "Phone"
        assert meta.gps_lat is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
