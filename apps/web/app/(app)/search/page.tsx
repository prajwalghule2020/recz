"use client";

import { useState, useCallback, useRef } from "react";
import { searchByFaceImage, searchByFacePoint, searchSimilarImages, filterPhotos, type SearchResult, type Photo, type FilterParams } from "@/lib/api";
import PhotoGrid from "@/app/components/PhotoGrid";
import ImageThumbnail from "@/app/components/ImageThumbnail";

type SearchMode = "face-upload" | "face-point" | "similar" | "filter";

export default function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("face-upload");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filterResults, setFilterResults] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search inputs
  const [pointId, setPointId] = useState("");
  const [imageId, setImageId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cameraModel, setCameraModel] = useState("");

  const handleFaceUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchByFaceImage(file);
      setResults(res);
      setFilterResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePointSearch = useCallback(async () => {
    if (!pointId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchByFacePoint(pointId.trim());
      setResults(res);
      setFilterResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [pointId]);

  const handleSimilarSearch = useCallback(async () => {
    if (!imageId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchSimilarImages(imageId.trim());
      setResults(res);
      setFilterResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [imageId]);

  const handleFilter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: FilterParams = {};
      if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
      if (dateTo) params.date_to = new Date(dateTo).toISOString();
      if (cameraModel) params.camera_model = cameraModel;
      const res = await filterPhotos(params);
      setFilterResults(res.photos);
      setResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Filter failed");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, cameraModel]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">Find photos by face, visual similarity, or metadata</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="search-tabs">
        {([
          ["face-upload", "🧑 Face Upload"],
          ["face-point", "🔗 Face ID"],
          ["similar", "🖼️ Similar"],
          ["filter", "🔍 Filter"],
        ] as [SearchMode, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`search-tab ${mode === key ? "search-tab-active" : ""}`}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <div className="search-input-area">
        {mode === "face-upload" && (
          <div className="search-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="input-file"
              onChange={handleFaceUpload}
            />
            <button className="btn-primary" onClick={handleFaceUpload} disabled={loading}>
              {loading ? "Searching…" : "Search by Face"}
            </button>
          </div>
        )}

        {mode === "face-point" && (
          <div className="search-row">
            <input
              className="input-text"
              placeholder="Qdrant Point ID"
              value={pointId}
              onChange={(e) => setPointId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePointSearch()}
            />
            <button className="btn-primary" onClick={handlePointSearch} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        )}

        {mode === "similar" && (
          <div className="search-row">
            <input
              className="input-text"
              placeholder="Image ID"
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimilarSearch()}
            />
            <button className="btn-primary" onClick={handleSimilarSearch} disabled={loading}>
              {loading ? "Searching…" : "Find Similar"}
            </button>
          </div>
        )}

        {mode === "filter" && (
          <div className="search-filter-grid">
            <div className="search-field">
              <label className="search-label">From Date</label>
              <input type="date" className="input-text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="search-field">
              <label className="search-label">To Date</label>
              <input type="date" className="input-text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="search-field">
              <label className="search-label">Camera Model</label>
              <input className="input-text" placeholder="e.g. iPhone 15" value={cameraModel} onChange={(e) => setCameraModel(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleFilter} disabled={loading} style={{ alignSelf: "end" }}>
              {loading ? "Filtering…" : "Apply Filters"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="search-error">⚠ {error}</div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p className="page-subtitle" style={{ marginBottom: 16 }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="search-results-grid">
            {results.map((r) => (
              <div key={r.point_id} className="search-result-card animate-float-up">
                <ImageThumbnail jobId={r.job_id} />
                <div className="search-result-meta">
                  <span className="search-result-score">{(r.score * 100).toFixed(1)}% match</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterResults.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <PhotoGrid photos={filterResults} />
        </div>
      )}
    </div>
  );
}
