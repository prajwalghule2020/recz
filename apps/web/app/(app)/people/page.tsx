"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPeople, triggerClustering, filterPhotos, type Person } from "@/lib/api";
import PersonCard from "@/app/components/PersonCard";

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
      if (data.length === 0) {
        const phData = await filterPhotos({ limit: 1 });
        setPhotoCount(phData.total);
      }
    } catch (e) {
      console.error("Failed to load people:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecluster = async () => {
    setClustering(true);
    try {
      await triggerClustering("faces");
      // Poll for completion after a delay
      setTimeout(load, 8000);
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
          <h1 className="page-title">People</h1>
          <p className="page-subtitle">
            {people.length} {people.length === 1 ? "person" : "people"} detected<br />
            <span style={{ opacity: 0.6 }}>· showing clusters with 3+ photos</span>
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleRecluster}
          disabled={clustering}
        >
          {clustering ? "⚙️ Clustering…" : "🔄 Re-cluster"}
        </button>
      </div>

      {loading ? (
        <div className="page-loading">
          <span className="animate-spin-slow" style={{ fontSize: 32 }}>⚙️</span>
          <p>Loading people…</p>
        </div>
      ) : people.length === 0 ? (
        <div className="page-empty">
          <span className={photoCount > 0 ? "animate-spin-slow" : ""} style={{ fontSize: 64, opacity: 0.3 }}>
            {photoCount > 0 ? "⚙️" : "👥"}
          </span>
          <p style={{ marginTop: 16 }}>
            {photoCount > 0 
              ? "Analyzing your photos and forming clusters... This might take a few moments." 
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
