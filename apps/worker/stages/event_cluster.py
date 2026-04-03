"""Event clustering — hybrid CLIP + temporal + GPS grouping.

Uses AgglomerativeClustering on a blended distance matrix built from
three signals:
  1. CLIP scene embeddings  (cosine distance — visual similarity)
  2. Timestamps             (normalized time gap)
  3. GPS coordinates        (haversine distance, when available)

Every photo is assigned to an event (no noise/orphans).
"""

import logging
import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
from sklearn.cluster import AgglomerativeClustering

logger = logging.getLogger(__name__)

# ── Configurable weights & thresholds ────────────────────────────────────────

CLIP_WEIGHT = 0.80       # Visual similarity (primary signal)
TIME_WEIGHT = 0.15       # Temporal proximity
GPS_WEIGHT  = 0.05       # Location proximity

DISTANCE_THRESHOLD = 0.40  # AgglomerativeClustering cut — lower = more events
TIME_NORM_HOURS = 4.0      # Normalize time gaps: 4h apart → distance 1.0
GPS_NORM_KM = 100.0        # Normalize GPS: 100km apart → distance 1.0


@dataclass
class PhotoForEvent:
    """Lightweight photo record for event clustering."""
    job_id: str
    datetime_original: Optional[datetime]
    gps_lat: Optional[float]
    gps_lon: Optional[float]
    clip_embedding: Optional[list[float]] = None  # 512-d CLIP vector


@dataclass
class EventCluster:
    """A detected event."""
    photos: list[PhotoForEvent] = field(default_factory=list)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    def add(self, photo: PhotoForEvent):
        self.photos.append(photo)
        if photo.datetime_original:
            dt = photo.datetime_original.replace(tzinfo=None) if photo.datetime_original.tzinfo else photo.datetime_original
            if self.start_time is None or dt < self.start_time:
                self.start_time = dt
            if self.end_time is None or dt > self.end_time:
                self.end_time = dt


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS points in kilometres."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _build_clip_distance_matrix(photos: list[PhotoForEvent]) -> np.ndarray:
    """Build NxN cosine distance matrix from CLIP embeddings."""
    n = len(photos)
    embeddings = []
    has_clip = []

    for p in photos:
        if p.clip_embedding is not None:
            embeddings.append(p.clip_embedding)
            has_clip.append(True)
        else:
            embeddings.append([0.0] * 512)  # placeholder
            has_clip.append(False)

    emb = np.array(embeddings, dtype=np.float32)
    # L2-normalize
    norms = np.linalg.norm(emb, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    emb = emb / norms

    # Cosine distance = 1 - dot(a, b)
    sim = np.dot(emb, emb.T)
    dist = np.clip(1.0 - sim, 0.0, 2.0)

    # For photos without CLIP embeddings, set distance to neutral (0.5)
    for i in range(n):
        if not has_clip[i]:
            dist[i, :] = 0.5
            dist[:, i] = 0.5
            dist[i, i] = 0.0

    return dist


def _build_time_distance_matrix(photos: list[PhotoForEvent]) -> np.ndarray:
    """Build NxN normalized time-gap distance matrix."""
    n = len(photos)
    dist = np.zeros((n, n), dtype=np.float32)

    for i in range(n):
        for j in range(i + 1, n):
            dt_i = photos[i].datetime_original
            dt_j = photos[j].datetime_original
            if dt_i and dt_j:
                # Strip tzinfo to avoid naive vs aware comparison
                a = dt_i.replace(tzinfo=None) if dt_i.tzinfo else dt_i
                b = dt_j.replace(tzinfo=None) if dt_j.tzinfo else dt_j
                gap_hours = abs((b - a).total_seconds()) / 3600.0
                d = min(gap_hours / TIME_NORM_HOURS, 1.0)  # cap at 1.0
            else:
                d = 0.5  # neutral if either has no timestamp
            dist[i, j] = d
            dist[j, i] = d

    return dist


def _build_gps_distance_matrix(photos: list[PhotoForEvent]) -> np.ndarray:
    """Build NxN normalized GPS distance matrix."""
    n = len(photos)
    dist = np.zeros((n, n), dtype=np.float32)

    for i in range(n):
        for j in range(i + 1, n):
            pi, pj = photos[i], photos[j]
            if (pi.gps_lat is not None and pi.gps_lon is not None
                    and pj.gps_lat is not None and pj.gps_lon is not None):
                km = _haversine_km(pi.gps_lat, pi.gps_lon, pj.gps_lat, pj.gps_lon)
                d = min(km / GPS_NORM_KM, 1.0)  # cap at 1.0
            else:
                d = 0.5  # neutral if either has no GPS
            dist[i, j] = d
            dist[j, i] = d

    return dist


def cluster_events(photos: list[PhotoForEvent]) -> list[EventCluster]:
    """Group photos into events using hybrid multi-signal clustering.

    Uses AgglomerativeClustering on a weighted blend of CLIP visual
    distance, temporal distance, and GPS distance.

    Args:
        photos: List of PhotoForEvent with optional CLIP embeddings, timestamps, GPS.

    Returns:
        List of EventCluster objects, sorted by earliest timestamp.
    """
    if not photos:
        return []

    n = len(photos)

    # Single photo → single event
    if n == 1:
        event = EventCluster()
        event.add(photos[0])
        return [event]

    # ── Build individual distance matrices ────────────────────────────────
    clip_dist = _build_clip_distance_matrix(photos)
    time_dist = _build_time_distance_matrix(photos)
    gps_dist = _build_gps_distance_matrix(photos)

    # ── Blend into a single distance matrix ───────────────────────────────
    # Adjust weights based on data availability
    has_clip = sum(1 for p in photos if p.clip_embedding is not None)
    has_time = sum(1 for p in photos if p.datetime_original is not None)
    has_gps = sum(1 for p in photos if p.gps_lat is not None)

    w_clip = CLIP_WEIGHT if has_clip > n * 0.3 else 0.0
    w_time = TIME_WEIGHT if has_time > n * 0.3 else 0.0
    w_gps = GPS_WEIGHT if has_gps > n * 0.3 else 0.0

    total_w = w_clip + w_time + w_gps
    if total_w == 0:
        # No usable signals — put everything in one event
        logger.warning("No usable signals for event clustering, creating single event")
        event = EventCluster()
        for p in photos:
            event.add(p)
        return [event]

    # Normalize weights
    w_clip /= total_w
    w_time /= total_w
    w_gps /= total_w

    blended = w_clip * clip_dist + w_time * time_dist + w_gps * gps_dist

    logger.info(
        "Event distance matrix built: %d photos, weights=(clip=%.2f, time=%.2f, gps=%.2f)",
        n, w_clip, w_time, w_gps,
    )

    # ── Run AgglomerativeClustering ───────────────────────────────────────
    clustering = AgglomerativeClustering(
        n_clusters=None,
        metric="precomputed",
        linkage="average",
        distance_threshold=DISTANCE_THRESHOLD,
    )
    labels = clustering.fit_predict(blended)

    # ── Build EventCluster objects ────────────────────────────────────────
    cluster_map: dict[int, EventCluster] = {}
    for photo, label in zip(photos, labels):
        if label not in cluster_map:
            cluster_map[label] = EventCluster()
        cluster_map[label].add(photo)

    # Sort events by earliest timestamp (undated events go last)
    events = sorted(
        cluster_map.values(),
        key=lambda e: e.start_time or datetime.max,
    )

    n_clusters = len(events)
    logger.info(
        "Event clustering: %d events from %d photos (threshold=%.2f)",
        n_clusters, n, DISTANCE_THRESHOLD,
    )

    return events
