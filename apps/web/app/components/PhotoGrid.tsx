"use client";

import { useState } from "react";
import ImageThumbnail from "./ImageThumbnail";
import Lightbox from "./Lightbox";

interface Photo {
  job_id: string;
  thumbnail_key?: string | null;
  face_count?: number;
  datetime_original?: string | null;
}

interface Props {
  photos: Photo[];
  onPhotoClick?: (jobId: string) => void;
  emptyMessage?: string;
}

export default function PhotoGrid({ photos, onPhotoClick, emptyMessage }: Props) {
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  if (!photos.length) {
    return (
      <div className="photo-grid-empty">
        <span style={{ fontSize: 48, opacity: 0.3 }}>📷</span>
        <p style={{ color: "var(--text-muted)", marginTop: 12 }}>
          {emptyMessage ?? "No photos found"}
        </p>
      </div>
    );
  }

  const handleClick = (jobId: string) => {
    if (onPhotoClick) {
      onPhotoClick(jobId);
    } else {
      setLightboxId(jobId);
    }
  };

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo) => (
          <div
            key={photo.job_id}
            className="photo-grid-item animate-float-up"
            onClick={() => handleClick(photo.job_id)}
          >
            <ImageThumbnail jobId={photo.job_id} />
            {photo.face_count != null && photo.face_count > 0 && (
              <div className="photo-grid-badge">
                👤 {photo.face_count}
              </div>
            )}
            {photo.datetime_original && (
              <div className="photo-grid-date">
                {new Date(photo.datetime_original).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxId && (
        <Lightbox
          jobId={lightboxId}
          photos={photos}
          onClose={() => setLightboxId(null)}
          onNavigate={(id) => setLightboxId(id)}
        />
      )}
    </>
  );
}
