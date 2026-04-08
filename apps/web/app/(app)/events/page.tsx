"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchEvents, triggerClustering, type EventSummary } from "@/lib/api";
import EventCard from "@/app/components/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecluster = async () => {
    setClustering(true);
    try {
      await triggerClustering("events");
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
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">
            {events.length} event{events.length !== 1 ? "s" : ""} detected
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
          <p>Loading events…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="page-empty">
          <span style={{ fontSize: 64, opacity: 0.3 }}>📅</span>
          <p>No events detected yet. Upload photos with timestamps to get started.</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
