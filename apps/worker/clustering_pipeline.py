"""Clustering pipeline — Celery tasks for face, event, and place clustering.

These tasks operate on a user's entire photo collection and produce/update
Person, Event, and Place records in Postgres.
"""

import asyncio
import logging
from collections import defaultdict

import numpy as np
from qdrant_client.models import FieldCondition, Filter, MatchValue

from celery_app import app
from config import settings
from storage.qdrant_store import _get_client, FACE_COLLECTION, SCENE_COLLECTION
from storage.postgres_store import _get_db

from stages.clustering import cluster_faces_dbscan
from stages.event_cluster import cluster_events, PhotoForEvent, EventCluster
from stages.place_group import group_by_place, PhotoForPlace

logger = logging.getLogger(__name__)


def _run(coro):
    """Run an async Prisma coroutine synchronously."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ── Face Clustering ───────────────────────────────────────────────────────────


@app.task(name="worker.clustering.run_face_clustering", bind=True, max_retries=1)
def run_face_clustering(self, user_id: str):
    """Cluster all face embeddings for a user using DBSCAN.

    1. Scroll ALL face points for this user from Qdrant
    2. Run DBSCAN clustering
    3. Create/update Person records in Postgres
    4. Assign FaceRecord.personId for each face
    """
    logger.info("Face clustering START for user=%s", user_id)

    try:
        qdrant = _get_client()
        db = _get_db()

        # Step 1: Fetch all face embeddings from Qdrant
        points = []
        offset = None
        while True:
            result, offset = qdrant.scroll(
                collection_name=FACE_COLLECTION,
                scroll_filter=Filter(must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                ]),
                limit=500,
                offset=offset,
                with_vectors=True,
            )
            points.extend(result)
            if offset is None:
                break

        if len(points) < 2:
            logger.info("Not enough faces (%d) for clustering, skipping", len(points))
            return {"status": "skipped", "reason": "too_few_faces", "count": len(points)}

        logger.info("Fetched %d face points from Qdrant", len(points))

        # Step 2: Extract embeddings and run DBSCAN
        embeddings = np.array([p.vector for p in points])
        labels = cluster_faces_dbscan(embeddings)

        # Step 3: Delete old Person records for this user (re-cluster from scratch)
        # First unlink all face records
        _run(db.facerecord.update_many(
            where={"job": {"userId": user_id}, "personId": {"not": None}},
            data={"personId": None},
        ))
        # Delete old persons
        _run(db.person.delete_many(where={"userId": user_id}))

        # Step 4: Keep only clusters that appear across >1 unique photo
        # This avoids single-photo noise while surfacing practical person groups.
        cluster_to_points: dict[int, list] = defaultdict(list)
        for point, label in zip(points, labels):
            if label != -1:
                cluster_to_points[int(label)].append(point)

        valid_cluster_ids: list[int] = []
        skipped_small_clusters = 0
        for cluster_id, cluster_points in cluster_to_points.items():
            unique_job_ids = {
                p.payload.get("job_id")
                for p in cluster_points
                if p.payload and p.payload.get("job_id")
            }
            if len(unique_job_ids) > 1:
                valid_cluster_ids.append(cluster_id)
            else:
                skipped_small_clusters += 1

        person_map = {}  # cluster_id → person_id
        for cluster_id in sorted(valid_cluster_ids):
            person = _run(db.person.create(
                data={
                    "userId": user_id,
                    "name": None,  # user can rename later
                },
            ))
            person_map[int(cluster_id)] = person.id

        # Step 5: Assign each face to its person
        assigned = 0
        for point, label in zip(points, labels):
            if label == -1 or int(label) not in person_map:
                continue  # noise — not assigned to any person

            # Find the FaceRecord by qdrant_point_id
            face_record = _run(db.facerecord.find_first(
                where={"qdrantPointId": str(point.id), "job": {"userId": user_id}},
            ))
            if face_record:
                _run(db.facerecord.update(
                    where={"id": face_record.id},
                    data={"personId": person_map[int(label)]},
                ))
                assigned += 1

        # Step 6: Set cover face for each person (first face in cluster)
        for cluster_id, person_id in person_map.items():
            first_face = _run(db.facerecord.find_first(
                where={"personId": person_id, "job": {"userId": user_id}},
                order={"faceIndex": "asc"},
            ))
            if first_face:
                _run(db.person.update(
                    where={"id": person_id},
                    data={"coverFaceId": first_face.id},
                ))

        logger.info(
            "Face clustering DONE: %d persons, %d faces assigned (from %d total)",
            len(person_map), assigned, len(points),
        )
        return {
            "status": "done",
            "persons_created": len(person_map),
            "faces_assigned": assigned,
            "total_faces": len(points),
            "clusters_skipped_small": skipped_small_clusters,
        }

    except Exception as exc:
        logger.exception("Face clustering FAILED for user=%s", user_id)
        raise self.retry(exc=exc)


# ── Event Clustering ──────────────────────────────────────────────────────────


@app.task(name="worker.clustering.run_event_clustering", bind=True, max_retries=1)
def run_event_clustering(self, user_id: str):
    """Group photos into events using hybrid CLIP + time + GPS clustering.

    1. Fetch all completed jobs with metadata from Postgres
    2. Fetch CLIP scene vectors from Qdrant
    3. Run hybrid multi-signal clustering
    4. Clear old events and create new Event + EventPhoto records
    """
    logger.info("Event clustering START for user=%s", user_id)

    try:
        db = _get_db()
        qdrant = _get_client()

        # Step 1: Fetch all completed jobs with metadata
        jobs = _run(db.processingjob.find_many(
            where={"userId": user_id, "status": "done"},
            include={"metadata": True},
            order={"createdAt": "asc"},
        ))

        if not jobs:
            logger.info("No completed jobs found for user=%s", user_id)
            return {"status": "skipped", "reason": "no_jobs"}

        # Step 2: Fetch CLIP scene embeddings from Qdrant
        # Build a job_id → CLIP vector map
        clip_map: dict[str, list[float]] = {}
        offset = None
        while True:
            from qdrant_client.models import FieldCondition, Filter, MatchValue
            result, offset = qdrant.scroll(
                collection_name=SCENE_COLLECTION,
                scroll_filter=Filter(must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                ]),
                limit=500,
                offset=offset,
                with_vectors=True,
            )
            for point in result:
                jid = point.payload.get("job_id") if point.payload else None
                if jid and point.vector:
                    clip_map[jid] = point.vector
            if offset is None:
                break

        logger.info("Fetched %d CLIP scene vectors from Qdrant", len(clip_map))

        # Step 3: Build PhotoForEvent objects with all signals
        photos = []
        for job in jobs:
            meta = job.metadata
            # Only use real EXIF datetime — not upload time
            dt = meta.datetimeOriginal if meta else None

            photos.append(PhotoForEvent(
                job_id=job.id,
                datetime_original=dt,
                gps_lat=meta.gpsLat if meta else None,
                gps_lon=meta.gpsLon if meta else None,
                clip_embedding=clip_map.get(job.id),
            ))

        # Step 4: Run hybrid clustering
        event_clusters = cluster_events(photos)

        if not event_clusters:
            return {"status": "skipped", "reason": "no_events"}

        # Step 5: Clear old events for this user
        _run(db.event.delete_many(where={"userId": user_id}))

        # Step 6: Create new events with auto-generated titles
        events_created = 0
        for cluster in event_clusters:
            if not cluster.photos:
                continue

            # Auto-generate title from date range
            title = _auto_event_title(cluster)

            # Ensure non-null start/end times (use first photo's datetime)
            start_time = cluster.start_time
            end_time = cluster.end_time
            if start_time is None:
                start_time = cluster.photos[0].datetime_original
            if end_time is None:
                end_time = cluster.photos[-1].datetime_original
            # Final fallback to now()
            from datetime import datetime, timezone
            if start_time is None:
                start_time = datetime.now(timezone.utc)
            if end_time is None:
                end_time = start_time

            event = _run(db.event.create(
                data={
                    "userId": user_id,
                    "title": title,
                    "startTime": start_time,
                    "endTime": end_time,
                    "coverImageId": cluster.photos[0].job_id,
                },
            ))

            # Create EventPhoto join records
            for photo in cluster.photos:
                _run(db.eventphoto.create(
                    data={
                        "eventId": event.id,
                        "jobId": photo.job_id,
                    },
                ))

            events_created += 1

        logger.info(
            "Event clustering DONE: %d events from %d photos",
            events_created, len(photos),
        )
        return {"status": "done", "events_created": events_created}

    except Exception as exc:
        logger.exception("Event clustering FAILED for user=%s", user_id)
        raise self.retry(exc=exc)


def _auto_event_title(cluster: EventCluster) -> str | None:
    """Generate a readable title from the event's date range."""
    if not cluster.start_time:
        return f"Album ({len(cluster.photos)} photos)"

    start = cluster.start_time
    end = cluster.end_time or start

    if start.date() == end.date():
        # Same day: "Feb 14, 2024"
        return start.strftime("%b %d, %Y")
    elif start.month == end.month and start.year == end.year:
        # Same month: "Feb 14 - 16, 2024"
        return f"{start.strftime('%b %d')} - {end.strftime('%d, %Y')}"
    elif start.year == end.year:
        # Same year: "Feb 14 - Mar 2, 2024"
        return f"{start.strftime('%b %d')} - {end.strftime('%b %d, %Y')}"
    else:
        # Different years: "Dec 31, 2023 - Jan 2, 2024"
        return f"{start.strftime('%b %d, %Y')} - {end.strftime('%b %d, %Y')}"


# ── Place Grouping ────────────────────────────────────────────────────────────


@app.task(name="worker.clustering.run_place_grouping", bind=True, max_retries=1)
def run_place_grouping(self, user_id: str):
    """Group photos by geographic location.

    1. Fetch all GPS-tagged photos
    2. Reverse geocode to city names
    3. Create Place + PlacePhoto records
    """
    logger.info("Place grouping START for user=%s", user_id)

    try:
        db = _get_db()

        # Step 1: Fetch all GPS-tagged metadata
        jobs = _run(db.processingjob.find_many(
            where={
                "userId": user_id,
                "status": "done",
                "metadata": {
                    "is": {
                        "gpsLat": {"not": None},
                        "gpsLon": {"not": None},
                    },
                },
            },
            include={"metadata": True},
        ))

        if not jobs:
            logger.info("No GPS-tagged photos found for user=%s", user_id)
            return {"status": "skipped", "reason": "no_gps_photos"}

        # Convert to PhotoForPlace
        photos = []
        for job in jobs:
            if job.metadata and job.metadata.gpsLat is not None and job.metadata.gpsLon is not None:
                photos.append(PhotoForPlace(
                    job_id=job.id,
                    gps_lat=job.metadata.gpsLat,
                    gps_lon=job.metadata.gpsLon,
                ))

        if not photos:
            return {"status": "skipped", "reason": "no_gps_photos"}

        # Step 2: Run place grouping
        place_clusters = group_by_place(photos)

        # Step 3: Clear old places
        _run(db.place.delete_many(where={"userId": user_id}))

        # Step 4: Create new places
        places_created = 0
        for cluster in place_clusters:
            place = _run(db.place.create(
                data={
                    "userId": user_id,
                    "name": cluster.name,
                    "country": cluster.country,
                    "lat": cluster.lat,
                    "lon": cluster.lon,
                },
            ))

            for photo in cluster.photos:
                _run(db.placephoto.create(
                    data={
                        "placeId": place.id,
                        "jobId": photo.job_id,
                    },
                ))

            places_created += 1

        logger.info(
            "Place grouping DONE: %d places from %d GPS-tagged photos",
            places_created, len(photos),
        )
        return {"status": "done", "places_created": places_created}

    except Exception as exc:
        logger.exception("Place grouping FAILED for user=%s", user_id)
        raise self.retry(exc=exc)


# ── Run All ───────────────────────────────────────────────────────────────────


@app.task(name="worker.clustering.run_all_clustering")
def run_all_clustering(user_id: str):
    """Run face, event, and place clustering sequentially."""
    logger.info("Running ALL clustering for user=%s", user_id)
    face_result = run_face_clustering(user_id)
    event_result = run_event_clustering(user_id)
    place_result = run_place_grouping(user_id)
    return {
        "faces": face_result,
        "events": event_result,
        "places": place_result,
    }
