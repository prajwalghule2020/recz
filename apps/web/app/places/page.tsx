"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPlaces, triggerClustering, type PlaceSummary } from "../../lib/api";
import PlaceCard from "../components/PlaceCard";

export default function PlacesPage() {
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlaces();
      setPlaces(data);
    } catch (e) {
      console.error("Failed to load places:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecluster = async () => {
    setClustering(true);
    try {
      await triggerClustering("places");
      setTimeout(load, 5000);
    } catch (e) {
      console.error("Clustering failed:", e);
    } finally {
      setClustering(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Places</h1>
          <p className="page-subtitle">
            {places.length} location{places.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleRecluster}
          disabled={clustering}
        >
          {clustering ? "⚙️ Grouping…" : "🔄 Re-group"}
        </button>
      </div>

      {loading ? (
        <div className="page-loading">
          <span className="animate-spin-slow" style={{ fontSize: 32 }}>⚙️</span>
          <p>Loading places…</p>
        </div>
      ) : places.length === 0 ? (
        <div className="page-empty">
          <span style={{ fontSize: 64, opacity: 0.3 }}>📍</span>
          <p>No places detected yet. Upload GPS-tagged photos to get started.</p>
        </div>
      ) : (
        <div className="places-list">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
