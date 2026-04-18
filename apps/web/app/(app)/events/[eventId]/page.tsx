"use client";

import { Loader2Icon, SquarePenIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchEvent, renameEvent, type Photo } from "@/lib/api";
import PhotoGrid from "@/app/components/PhotoGrid";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<{ id: string; title: string | null; start_time: string; end_time: string; photo_count: number; photos: Photo[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEvent(eventId);
      setEvent(data);
      setTitleInput(data.title ?? "");
    } catch (e) {
      console.error("Failed to load event:", e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const handleSaveTitle = async () => {
    if (!event) return;
    await renameEvent(eventId, titleInput);
    setEvent({ ...event, title: titleInput });
    setEditing(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <Loader2Icon className="h-8 w-8 animate-spin-slow" aria-hidden="true" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="page-empty"><p>Event not found</p></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input-text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                placeholder="Event title…"
                autoFocus
              />
              <button className="btn-primary" onClick={handleSaveTitle}>Save</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <h1 className="page-title" onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
              <span className="inline-flex items-center gap-2">
                {event.title ?? `${formatDate(event.start_time)}`}
                <SquarePenIcon className="h-4 w-4 text-(--text-muted)" aria-hidden="true" />
              </span>
            </h1>
          )}
          <p className="page-subtitle">
            {formatDate(event.start_time)} – {formatDate(event.end_time)} · {event.photo_count} photo{event.photo_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <PhotoGrid
        photos={event.photos}
        emptyMessage="No photos in this event"
      />
    </div>
  );
}
