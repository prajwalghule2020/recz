"use client";

import { useCallback, useState } from "react";
import UploadZone from "../components/UploadZone";
import { JobCard, useJobPoller, type JobStatus } from "../components/JobCard";

interface Job {
  job_id: string;
  image_id: string;
  status: JobStatus;
  face_count?: number;
  gps_lat?: number;
  gps_lon?: number;
  datetime_original?: string;
  error_msg?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live polling for active jobs
  useJobPoller(jobs, setJobs);

  const handleFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    setError(null);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    try {
      const res = await fetch(`${API}/api/v1/images/upload`, {
        method: "POST",
        credentials: "include", // Send auth cookies
        body: form,
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth/signin";
          return;
        }
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail ?? "Upload failed");
      }
      const data: { jobs: { job_id: string; image_id: string }[] } = await res.json();
      const newJobs: Job[] = data.jobs.map((j) => ({ ...j, status: "queued" }));
      setJobs((prev) => [...newJobs, ...prev]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUploading(false);
    }
  }, []);

  const doneJobs = jobs.filter((j) => j.status === "done");
  const totalFaces = doneJobs.reduce((acc, j) => acc + (j.face_count ?? 0), 0);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}
        >
          🧠
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-.01em" }}>
            Face-AI
          </h1>
          <p style={{ margin: 0, fontSize: ".75rem", color: "var(--text-muted)" }}>
            Intelligent Photo Analysis Pipeline
          </p>
        </div>

        {/* Stats bar */}
        {jobs.length > 0 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 24 }}>
            <Stat label="Jobs" value={jobs.length} />
            <Stat label="Faces" value={totalFaces} accent />
          </div>
        )}
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: jobs.length === 0 ? "1fr" : "1fr 380px",
          maxWidth: 1280, margin: "0 auto", width: "100%",
          padding: "40px 32px", gap: 32,
          alignItems: "start",
          transition: "grid-template-columns .3s ease",
        }}
      >
        {/* Left — Upload */}
        <section>
          <p style={{ color: "var(--text-muted)", fontSize: ".9rem", marginBottom: 24, marginTop: 0 }}>
            Upload photos and the AI pipeline will automatically detect faces,
            generate embeddings, and extract location &amp; time metadata.
          </p>

          <UploadZone onFilesSelected={handleFiles} disabled={uploading} />

          {/* Upload button */}
          {uploading && (
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
              <span className="animate-spin-slow" style={{ fontSize: 18 }}>⚙️</span>
              <span style={{ fontSize: ".875rem" }}>Uploading and queuing task…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 16, padding: "12px 16px", borderRadius: 10,
                background: "rgba(248,113,113,.1)", border: "1px solid var(--error)",
                color: "var(--error)", fontSize: ".875rem",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Pipeline steps */}
          <div style={{ marginTop: 40 }}>
            <p style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, letterSpacing: ".05em", textTransform: "uppercase" }}>
              Pipeline Stages
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PIPELINE_STEPS.map((s, i) => (
                <PipelineStep key={i} index={i + 1} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* Right — Job list */}
        {jobs.length > 0 && (
          <section style={{ position: "sticky", top: 24 }}>
            <p style={{
              fontSize: ".8rem", fontWeight: 600, color: "var(--text-muted)",
              letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 14, marginTop: 0,
            }}>
              Processing Queue ({jobs.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "75vh", overflowY: "auto" }}>
              {jobs.map((j) => (
                <JobCard key={j.job_id} job={j} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: accent ? "var(--accent)" : "var(--text)" }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: ".7rem", color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

const PIPELINE_STEPS = [
  { label: "EXIF orientation fix",     desc: "Correct camera rotation",           color: "#60a5fa" },
  { label: "Face Detection + Embed",   desc: "InsightFace buffalo_l",              color: "var(--accent)" },
  { label: "Scene Embedding",          desc: "OpenCLIP ViT-B/16",                  color: "var(--accent-2)" },
  { label: "Metadata Extraction",      desc: "GPS, timestamp, camera info",        color: "var(--success)" },
  { label: "Store Embeddings",         desc: "Qdrant (faces + scenes)",            color: "#f472b6" },
  { label: "Store Metadata",           desc: "Postgres (job + photo record)",      color: "var(--warning)" },
];

function PipelineStep({ index, label, desc, color }: { index: number; label: string; desc: string; color: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 10,
        background: "var(--surface)", border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: `${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: ".7rem", fontWeight: 700, color,
        }}
      >
        {index}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: ".825rem", fontWeight: 600, color: "var(--text)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: ".72rem", color: "var(--text-muted)" }}>{desc}</p>
      </div>
    </div>
  );
}
