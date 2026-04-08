"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchMyPhotos, deletePhoto, type Photo } from "@/lib/api";
import PhotoGrid from "@/app/components/PhotoGrid";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyPhotos({ limit: 100, status: "done" });
      setPhotos(data.photos);
      setTotal(data.total);
    } catch (e) {
      console.error("Failed to load photos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (jobId: string) => {
    try {
      await deletePhoto(jobId);
      setPhotos(p => p.filter(x => x.job_id !== jobId));
      setTotal(t => t - 1);
    } catch (e) {
      console.error("Failed to delete photo:", e);
      alert("Failed to delete photo");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Photos</h1>
          <p className="page-subtitle">
            {total} photo{total !== 1 ? "s" : ""} uploaded
          </p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <span className="animate-spin-slow" style={{ fontSize: 32 }}>⚙️</span>
          <p>Loading photos…</p>
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          onPhotoDelete={handleDelete}
          emptyMessage="No photos found. Upload some to get started."
        />
      )}
    </div>
  );
}
