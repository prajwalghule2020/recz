"use client";

import { useEffect, useState } from "react";
import { getThumbnailUrl } from "../../lib/api";

interface Props {
  jobId: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export default function ImageThumbnail({ jobId, alt, className, onClick }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getThumbnailUrl(jobId)
      .then((url) => { if (mounted) setSrc(url); })
      .catch(() => { if (mounted) setError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [jobId]);

  if (loading) {
    return (
      <div className={`img-thumb img-thumb-loading ${className ?? ""}`}>
        <span className="animate-pulse-ring" style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--border)" }} />
      </div>
    );
  }

  if (error || !src) {
    return (
      <div className={`img-thumb img-thumb-error ${className ?? ""}`}>
        <span style={{ fontSize: 20 }}>🖼️</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? "Photo"}
      className={`img-thumb ${className ?? ""}`}
      onClick={onClick}
      loading="lazy"
    />
  );
}
