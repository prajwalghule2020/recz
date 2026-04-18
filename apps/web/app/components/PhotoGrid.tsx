"use client";

import { CameraIcon, Trash2Icon, UserIcon } from "lucide-react";
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
  onPhotoDelete?: (jobId: string) => void;
  emptyMessage?: string;
}

export default function PhotoGrid({ photos, onPhotoClick, onPhotoDelete, emptyMessage }: Props) {
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  if (!photos.length) {
    return (
      <div className="photo-grid-empty">
        <CameraIcon className="h-12 w-12 text-(--text-muted)" style={{ opacity: 0.3 }} aria-hidden="true" />
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
              <div className="photo-grid-badge flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{photo.face_count}</span>
              </div>
            )}
            {photo.datetime_original && (
              <div className="photo-grid-date">
                {new Date(photo.datetime_original).toLocaleDateString()}
              </div>
            )}
            {onPhotoDelete && (
              <button
                className="photo-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
                    onPhotoDelete(photo.job_id);
                  }
                }}
                title="Delete Photo"
              >
                <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              </button>
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
