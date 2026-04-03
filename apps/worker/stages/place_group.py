"""Place grouping — reverse geocode GPS coordinates and group photos by location.

Uses the `reverse_geocoder` library for offline, fast batch reverse geocoding.
No API keys needed — uses an offline GeoNames database (~30MB).
"""

import logging
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class PhotoForPlace:
    """Lightweight photo record for place grouping."""
    job_id: str
    gps_lat: float
    gps_lon: float


@dataclass
class PlaceCluster:
    """A detected geographic cluster."""
    name: str
    country: str
    lat: float
    lon: float
    photos: list[PhotoForPlace] = field(default_factory=list)


def group_by_place(photos: list[PhotoForPlace]) -> list[PlaceCluster]:
    """Group photos by city/locality using offline reverse geocoding.

    Args:
        photos: List of PhotoForPlace with GPS coordinates.

    Returns:
        List of PlaceCluster objects, one per unique city.
    """
    if not photos:
        return []

    import reverse_geocoder as rg

    coordinates = [(p.gps_lat, p.gps_lon) for p in photos]
    results = rg.search(coordinates)

    # Group by location key (city + country code)
    groups: dict[str, PlaceCluster] = {}

    for photo, geo in zip(photos, results):
        key = f"{geo['name']}, {geo['cc']}"
        if key not in groups:
            groups[key] = PlaceCluster(
                name=geo["name"],
                country=geo["cc"],
                lat=float(geo["lat"]),
                lon=float(geo["lon"]),
            )
        groups[key].photos.append(photo)

    clusters = list(groups.values())
    logger.info(
        "Place grouping: %d places from %d GPS-tagged photos",
        len(clusters), len(photos),
    )
    return clusters
