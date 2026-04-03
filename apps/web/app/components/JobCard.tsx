"use client";

import { useEffect, useRef, useState } from "react";

export type JobStatus = "queued" | "pending" | "processing" | "done" | "failed";

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

const STATUS_COLOR: Record<JobStatus, string> = {
  queued:     "var(--text-muted)",
  pending:    "var(--warning)",
  processing: "var(--accent)",
  done:       "var(--success)",
  failed:     "var(--error)",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  queued:     "Queued",
  pending:    "Pending",
  processing: "Processing…",
  done:       "Done",
  failed:     "Failed",
};

function StatusDot({ status }: { status: JobStatus }) {
  return (
    <span
      style={{
        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
        background: STATUS_COLOR[status],
        flexShrink: 0,
        animation: status === "processing" ? "pulse-ring 1.5s ease-in-out infinite" : undefined,
      }}
    />
  );
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div
      id={`job-card-${job.job_id}`}
      className="animate-float-up"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 12, padding: "14px 16px",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}
    >
      {/* Status indicator */}
      <div style={{ paddingTop: 3 }}>
        <StatusDot status={job.status} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: ".75rem", color: "var(--text-muted)" }}>
            {job.job_id.split("-")[0]}…
          </span>
          <span style={{ fontSize: ".75rem", fontWeight: 600, color: STATUS_COLOR[job.status] }}>
            {STATUS_LABEL[job.status]}
          </span>
        </div>

        {job.status === "processing" && (
          <div style={{ marginTop: 8, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%", background: "var(--accent)", borderRadius: 2,
                animation: "progress-bar 4s linear forwards",
              }}
            />
          </div>
        )}

        {job.status === "done" && (
          <div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {job.face_count !== undefined && (
              <Chip icon="👤" label={`${job.face_count} face${job.face_count !== 1 ? "s" : ""}`} />
            )}
            {job.datetime_original && (
              <Chip icon="🕐" label={new Date(job.datetime_original).toLocaleDateString()} />
            )}
            {job.gps_lat !== null && job.gps_lat !== undefined && (
              <Chip icon="📍" label={`${job.gps_lat?.toFixed(3)}, ${job.gps_lon?.toFixed(3)}`} />
            )}
          </div>
        )}

        {job.status === "failed" && job.error_msg && (
          <p style={{ marginTop: 6, fontSize: ".75rem", color: "var(--error)" }}>{job.error_msg}</p>
        )}
      </div>
    </div>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "rgba(108,99,255,.1)", borderRadius: 20, padding: "3px 10px",
        fontSize: ".75rem", color: "var(--text-muted)",
      }}
    >
      {icon} {label}
    </span>
  );
}

interface JobListProps {
  jobs: Job[];
  onUpdate: (jobs: Job[]) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useJobPoller(jobs: Job[], onUpdate: (jobs: Job[]) => void) {
  const ref = useRef(jobs);
  ref.current = jobs;

  useEffect(() => {
    const active = jobs.filter((j) => j.status === "pending" || j.status === "processing" || j.status === "queued");
    if (!active.length) return;

    const timer = setInterval(async () => {
      const updated = await Promise.all(
        ref.current.map(async (j) => {
          if (j.status === "done" || j.status === "failed") return j;
          try {
            const res = await fetch(`${API}/api/v1/images/${j.job_id}/status`);
            if (!res.ok) return j;
            const data = await res.json();
            return { ...j, ...data, status: data.status as JobStatus };
          } catch {
            return j;
          }
        })
      );
      onUpdate(updated);
    }, 2500);

    return () => clearInterval(timer);
  }, [jobs, onUpdate]);
}
