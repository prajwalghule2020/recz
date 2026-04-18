"use client";

import { Loader2Icon, RefreshCwIcon, UsersIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { fetchPeople, triggerClustering, filterPhotos, type Person } from "@/lib/api";
import PersonCard from "@/app/components/PersonCard";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [autoClusterAttempted, setAutoClusterAttempted] = useState(false);

  const pollForPeople = useCallback(async (attempts = 8, delayMs = 2500) => {
    for (let i = 0; i < attempts; i++) {
      const data = await fetchPeople(1);
      setPeople(data);
      if (data.length > 0) {
        return true;
      }
      await delay(delayMs);
    }
    return false;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPeople(1);
      setPeople(data);

      if (data.length === 0) {
        const phData = await filterPhotos({ limit: 1 });
        setPhotoCount(phData.total);

        // If processed photos exist but no people are visible, try one auto re-cluster.
        if (!autoClusterAttempted && phData.total > 0) {
          setAutoClusterAttempted(true);
          setClustering(true);
          try {
            await triggerClustering("faces");
            await pollForPeople();
          } catch (e) {
            console.error("Automatic people clustering failed:", e);
          } finally {
            setClustering(false);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load people:", e);
    } finally {
      setLoading(false);
    }
  }, [autoClusterAttempted, pollForPeople]);

  useEffect(() => { load(); }, [load]);

  const handleRecluster = async () => {
    setClustering(true);
    try {
      setAutoClusterAttempted(true);
      await triggerClustering("faces");
      await pollForPeople(10, 2500);
    } catch (e) {
      console.error("Clustering failed:", e);
    } finally {
      setClustering(false);
    }
  };

  const showAnalyzing = clustering || (!autoClusterAttempted && photoCount > 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">People</h1>
          <p className="page-subtitle">
            {people.length} {people.length === 1 ? "person" : "people"} detected<br />
            <span style={{ opacity: 0.6 }}>· showing clusters with 2+ photos</span>
          </p>
        </div>
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={handleRecluster}
          disabled={clustering}
        >
          {clustering ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin-slow" aria-hidden="true" />
              Clustering...
            </>
          ) : (
            <>
              <RefreshCwIcon className="h-4 w-4" aria-hidden="true" />
              Re-cluster
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="page-loading">
          <Loader2Icon className="h-8 w-8 animate-spin-slow" aria-hidden="true" />
          <p>Loading people…</p>
        </div>
      ) : people.length === 0 ? (
        <div className="page-empty">
          {showAnalyzing ? (
            <Loader2Icon
              className="h-16 w-16 animate-spin-slow text-(--text-muted)"
              style={{ opacity: 0.3 }}
              aria-hidden="true"
            />
          ) : (
            <UsersIcon className="h-16 w-16 text-(--text-muted)" style={{ opacity: 0.3 }} aria-hidden="true" />
          )}
          <p style={{ marginTop: 16 }}>
            {showAnalyzing
              ? "Analyzing your photos and forming clusters... This might take a few moments."
              : photoCount > 0
                ? "No recurring people clusters found yet. We show a person when the same face appears in at least 2 photos. Upload more photos or click Re-cluster."
                : "No people detected yet. Upload photos with faces to get started."}
          </p>
        </div>
      ) : (
        <div className="people-grid">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
