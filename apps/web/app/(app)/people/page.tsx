"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPeople, triggerClustering, type Person } from "@/lib/api";
import PersonCard from "@/app/components/PersonCard";

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
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
            {people.length} {people.length === 1 ? "person" : "people"} detected · showing clusters with 3+ photos
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
          <span style={{ fontSize: 64, opacity: 0.3 }}>👥</span>
          <p>No people detected yet. Upload photos with faces to get started.</p>
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
