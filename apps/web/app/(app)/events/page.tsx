"use client";

import { CalendarDaysIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  fetchEvents,
  fetchMyPhotos,
  triggerClustering,
  type EventSummary,
} from "@/lib/api";
import EventCard from "@/app/components/EventCard";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);
  const [autoClusterAttempted, setAutoClusterAttempted] = useState(false);

  const pollForEvents = useCallback(async (attempts = 8, delayMs = 2500) => {
    for (let i = 0; i < attempts; i++) {
      const data = await fetchEvents();
      setEvents(data);
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
      const data = await fetchEvents();
      setEvents(data);

      // If there are processed photos but no events yet, auto-run clustering once.
      if (!autoClusterAttempted && data.length === 0) {
        setAutoClusterAttempted(true);
        const photos = await fetchMyPhotos({ status: "done", limit: 1, offset: 0 });
        if (photos.total > 0) {
          setClustering(true);
          try {
            await triggerClustering("events");
            await pollForEvents();
          } catch (e) {
            console.error("Automatic event clustering failed:", e);
          } finally {
            setClustering(false);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setLoading(false);
    }
  }, [autoClusterAttempted, pollForEvents]);

  useEffect(() => { load(); }, [load]);

  const handleRecluster = async () => {
    setClustering(true);
    try {
      await triggerClustering("events");
      await pollForEvents();
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
          className="btn-primary inline-flex items-center gap-2"
          onClick={handleRecluster}
          disabled={clustering}
        >
          {clustering ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin-slow" aria-hidden="true" />
              Grouping...
            </>
          ) : (
            <>
              <RefreshCwIcon className="h-4 w-4" aria-hidden="true" />
              Re-group
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="page-loading">
          <Loader2Icon className="h-8 w-8 animate-spin-slow" aria-hidden="true" />
          <p>Loading events…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="page-empty">
          <CalendarDaysIcon className="h-16 w-16 text-(--text-muted)" style={{ opacity: 0.3 }} aria-hidden="true" />
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
