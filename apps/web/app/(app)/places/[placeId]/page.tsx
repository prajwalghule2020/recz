"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchPlace, type Photo } from "@/lib/api";
import PhotoGrid from "@/app/components/PhotoGrid";

export default function PlaceDetailPage() {
  const params = useParams();
  const placeId = params.placeId as string;

  const [place, setPlace] = useState<{ id: string; name: string; country: string | null; lat: number; lon: number; photo_count: number; photos: Photo[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlace(placeId);
      setPlace(data);
    } catch (e) {
      console.error("Failed to load place:", e);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <span className="animate-spin-slow" style={{ fontSize: 32 }}>⚙️</span>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="page-container">
        <div className="page-empty"><p>Place not found</p></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📍 {place.name}</h1>
          <p className="page-subtitle">
            {place.country} · {place.photo_count} photo{place.photo_count !== 1 ? "s" : ""} · ({place.lat.toFixed(4)}, {place.lon.toFixed(4)})
          </p>
        </div>
      </div>

      <PhotoGrid
        photos={place.photos}
        emptyMessage="No photos in this place"
      />
    </div>
  );
}
