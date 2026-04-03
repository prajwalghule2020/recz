"""Face clustering using DBSCAN on Qdrant face embeddings.

Groups faces by vector similarity without needing to pre-specify the number
of people. Uses cosine distance with eps ≈ 0.45 (roughly 78% similarity).
"""

import logging

import numpy as np
from sklearn.cluster import DBSCAN

logger = logging.getLogger(__name__)


def cluster_faces_dbscan(
    embeddings: np.ndarray,
    eps: float = 0.45,
    min_samples: int = 2,
) -> np.ndarray:
    """Run DBSCAN on L2-normalised face embeddings.

    Args:
        embeddings: (N, 512) L2-normalised face embeddings.
        eps:        Max cosine distance for same-person threshold.
                    Lower = stricter (fewer false merges).
                    0.45 ≈ 78% cosine similarity cutoff.
        min_samples: Minimum faces to form a cluster.

    Returns:
        labels: Array of cluster IDs. -1 = noise/singleton (unassigned face).
    """
    if len(embeddings) < min_samples:
        logger.info("Too few faces (%d) for clustering, returning all as singletons", len(embeddings))
        return np.array([-1] * len(embeddings))

    # Cosine distance matrix: D = 1 - (E · E^T)
    # Since embeddings are L2-normalised, dot product = cosine similarity
    similarity_matrix = np.dot(embeddings, embeddings.T)
    # Clip to [0, 2] range to handle floating point errors
    distance_matrix = np.clip(1.0 - similarity_matrix, 0.0, 2.0)

    clustering = DBSCAN(
        eps=eps,
        min_samples=min_samples,
        metric="precomputed",
    )
    labels = clustering.fit_predict(distance_matrix)

    n_clusters = len(set(labels) - {-1})
    n_noise = int(np.sum(labels == -1))
    logger.info(
        "DBSCAN complete: %d clusters, %d noise points (from %d faces)",
        n_clusters, n_noise, len(embeddings),
    )

    return labels
