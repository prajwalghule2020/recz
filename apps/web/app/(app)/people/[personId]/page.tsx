"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchPerson, renamePerson, type Photo } from "@/lib/api";
import PhotoGrid from "@/app/components/PhotoGrid";

export default function PersonDetailPage() {
  const params = useParams();
  const personId = params.personId as string;

  const [person, setPerson] = useState<{ id: string; name: string | null; face_count: number; photo_count: number; photos: Photo[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPerson(personId);
      setPerson(data);
      setNameInput(data.name ?? "");
    } catch (e) {
      console.error("Failed to load person:", e);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { load(); }, [load]);

  const handleSaveName = async () => {
    if (!person) return;
    await renamePerson(personId, nameInput);
    setPerson({ ...person, name: nameInput });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <span className="animate-spin-slow" style={{ fontSize: 32 }}>⚙️</span>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="page-container">
        <div className="page-empty">
          <p>Person not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input-text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
              />
              <button className="btn-primary" onClick={handleSaveName}>Save</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <h1 className="page-title" onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
              {person.name ?? "Unknown Person"} ✏️
            </h1>
          )}
          <p className="page-subtitle">
            {person.photo_count} photo{person.photo_count !== 1 ? "s" : ""} · {person.face_count} appearance{person.face_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <PhotoGrid
        photos={person.photos}
        emptyMessage="No photos found for this person"
      />
    </div>
  );
}
