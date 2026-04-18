"use client";

import { Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getFullImageUrl } from "../../lib/api";

interface Props {
  jobId: string;
  photos: { job_id: string }[];
  onClose: () => void;
  onNavigate?: (jobId: string) => void;
}

export default function Lightbox({ jobId, photos, onClose, onNavigate }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentIndex = photos.findIndex((p) => p.job_id === jobId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const loadImage = useCallback(async (id: string) => {
    setLoading(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    try {
      const url = await getFullImageUrl(id);
      setSrc(url);
    } catch {
      setSrc(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImage(jobId);
  }, [jobId, loadImage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrev) onNavigate?.(photos[currentIndex - 1].job_id);
          break;
        case "ArrowRight":
          if (hasNext) onNavigate?.(photos[currentIndex + 1].job_id);
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.25, 5));
          break;
        case "-":
          setZoom((z) => Math.max(z - 0.25, 0.25));
          break;
        case "0":
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNavigate, hasPrev, hasNext, photos, currentIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.min(Math.max(z + delta, 0.25), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      {/* Close button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        <XIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Counter */}
      <div className="lightbox-counter">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Previous arrow */}
      {hasPrev && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.(photos[currentIndex - 1].job_id);
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.(photos[currentIndex + 1].job_id);
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}

      {/* Image container */}
      <div
        className="lightbox-image-container"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
      >
        {loading ? (
          <div className="lightbox-loading">
            <Loader2Icon className="h-10 w-10 animate-spin-slow" aria-hidden="true" />
          </div>
        ) : src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt="Full-size photo"
            className="lightbox-image"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 0.2s ease",
            }}
            draggable={false}
          />
        ) : (
          <div className="lightbox-error">Failed to load image</div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-tool-btn" onClick={handleZoomOut} title="Zoom Out (-)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <span className="lightbox-zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="lightbox-tool-btn" onClick={handleZoomIn} title="Zoom In (+)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <div className="lightbox-tool-divider" />
        <button className="lightbox-tool-btn" onClick={handleReset} title="Reset (0)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
