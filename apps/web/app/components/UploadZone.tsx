"use client";

import { useCallback, useRef, useState } from "react";

interface UploadedFile {
  file: File;
  preview: string;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (raw: FileList | File[]) => {
      const files = Array.from(raw).filter((f) =>
        ["image/jpeg", "image/png", "image/webp", "image/heic"].includes(f.type)
      );
      if (!files.length) return;
      const items = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
      setPreviews((p) => [...p, ...items]);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const removePreview = (idx: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[idx].preview);
      return p.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        id="upload-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Upload images by clicking or dragging"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "16px",
          padding: "48px 24px",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          background: dragging ? "rgba(108,99,255,.06)" : "var(--surface)",
          transition: "all .2s ease",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(108,99,255,.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
          className={dragging ? "animate-pulse-ring" : ""}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--text)", marginBottom: 6 }}>
          {dragging ? "Drop images here" : "Drag & drop photos here"}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: ".875rem" }}>
          or <span style={{ color: "var(--accent)", fontWeight: 500 }}>browse files</span>
          &nbsp;· JPEG, PNG, WebP, HEIC
        </p>
      </div>

      <input
        ref={inputRef}
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        hidden
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      {/* Preview grid */}
      {previews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))", gap: 8 }}>
          {previews.map((p, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1/1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt={p.file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                id={`remove-preview-${i}`}
                aria-label="Remove image"
                onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                style={{
                  position: "absolute", top: 4, right: 4,
                  background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%",
                  width: 22, height: 22, cursor: "pointer", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
