"use client";

import { JobCard, type JobStatus, useJobPoller } from "@/app/components/JobCard";
import UploadZone from "@/app/components/UploadZone";
import { uploadImages } from "@/lib/api";
import Link from "next/link";
import { useCallback, useState } from "react";

interface UploadQueueJob {
  job_id: string;
  image_id: string;
  status: JobStatus;
  face_count?: number;
  gps_lat?: number;
  gps_lon?: number;
  datetime_original?: string;
  error_msg?: string;
}

export default function UploadPage() {
  const [jobs, setJobs] = useState<UploadQueueJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (!files.length) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImages(files);
      const queuedJobs: UploadQueueJob[] = result.jobs.map((job) => ({
        ...job,
        status: "queued",
      }));
      setJobs((current) => [...queuedJobs, ...current]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handlePollUpdate = useCallback((updatedJobs: UploadQueueJob[]) => {
    setJobs(updatedJobs);
  }, []);

  useJobPoller(jobs, handlePollUpdate);

  const activeJobs = jobs.filter((job) => job.status === "queued" || job.status === "pending" || job.status === "processing").length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Photos</h1>
          <p className="page-subtitle">
            Drop images to start processing. {jobs.length > 0 ? `${activeJobs} active of ${jobs.length} total job${jobs.length !== 1 ? "s" : ""}.` : "Your queue will appear below."}
          </p>
        </div>
        <Link href="/photos" className="btn-secondary">
          View Photos
        </Link>
      </div>

      <UploadZone onFilesSelected={handleFilesSelected} disabled={uploading} />

      {error ? <div className="search-error">{error}</div> : null}

      <div className="mt-6 flex flex-col gap-3">
        {jobs.length ? (
          jobs.map((job) => <JobCard key={job.job_id} job={job} />)
        ) : (
          <div className="page-empty py-10!">
            <p>Upload one or more photos to start the pipeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
