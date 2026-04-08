const API = process.env.NEXT_PUBLIC_API_URL ?? "";
// When NEXT_PUBLIC_API_URL is empty, calls go through Next.js rewrites (see next.config.ts)
// which proxies /api/v1/* to the FastAPI backend — this forwards cookies automatically.

// ── Types ────────────────────────────────────────────────────────────────────

export interface Person {
  id: string;
  name: string | null;
  face_count: number;
  cover_face_id: string | null;
  cover_object_key: string | null;
  cover_thumbnail_key: string | null;
  cover_image_url: string | null;
  cover_bbox: number[] | null;
  cover_width: number | null;
  cover_height: number | null;
  created_at: string;
}

export interface EventSummary {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  photo_count: number;
  cover_image_id: string | null;
  created_at: string;
}

export interface PlaceSummary {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lon: number;
  photo_count: number;
  created_at: string;
}

export interface Photo {
  job_id: string;
  object_key: string;
  thumbnail_key: string | null;
  face_count?: number;
  datetime_original?: string | null;
  gps_lat?: number | null;
  gps_lon?: number | null;
  face_index?: number;
  bbox?: number[] | null;
}

export interface SearchResult {
  point_id: string;
  score: number;
  image_id: string;
  job_id: string;
  face_index?: number;
  bbox?: number[];
}

// ── Authenticated fetch wrapper ──────────────────────────────────────────────

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    credentials: "include", // Send cookies for session auth
  });
  if (res.status === 401) {
    // Session expired — redirect to sign in
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
    throw new Error("Not authenticated");
  }
  return res;
}

// ── People ───────────────────────────────────────────────────────────────────

export async function fetchPeople(): Promise<Person[]> {
  const res = await authFetch(`${API}/api/v1/people`);
  if (!res.ok) throw new Error("Failed to fetch people");
  const data = await res.json();
  return data.people;
}

export async function fetchPerson(personId: string): Promise<{ id: string; name: string | null; face_count: number; photo_count: number; photos: Photo[] }> {
  const res = await authFetch(`${API}/api/v1/people/${personId}`);
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

export async function renamePerson(personId: string, name: string): Promise<void> {
  await authFetch(`${API}/api/v1/people/${personId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

// ── Events ───────────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<EventSummary[]> {
  const res = await authFetch(`${API}/api/v1/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const data = await res.json();
  return data.events;
}

export async function fetchEvent(eventId: string): Promise<{ id: string; title: string | null; start_time: string; end_time: string; photo_count: number; photos: Photo[] }> {
  const res = await authFetch(`${API}/api/v1/events/${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

export async function renameEvent(eventId: string, title: string): Promise<void> {
  await authFetch(`${API}/api/v1/events/${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

// ── Places ───────────────────────────────────────────────────────────────────

export async function fetchPlaces(): Promise<PlaceSummary[]> {
  const res = await authFetch(`${API}/api/v1/places`);
  if (!res.ok) throw new Error("Failed to fetch places");
  const data = await res.json();
  return data.places;
}

export async function fetchPlace(placeId: string): Promise<{ id: string; name: string; country: string | null; lat: number; lon: number; photo_count: number; photos: Photo[] }> {
  const res = await authFetch(`${API}/api/v1/places/${placeId}`);
  if (!res.ok) throw new Error("Failed to fetch place");
  return res.json();
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchByFacePoint(pointId: string, limit = 20): Promise<SearchResult[]> {
  const res = await authFetch(`${API}/api/v1/search/face?point_id=${pointId}&limit=${limit}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Face search failed");
  const data = await res.json();
  return data.results;
}

export async function searchByFaceImage(file: File, limit = 20): Promise<SearchResult[]> {
  const form = new FormData();
  form.append("file", file);
  const res = await authFetch(`${API}/api/v1/search/face?limit=${limit}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Face search failed");
  const data = await res.json();
  return data.results;
}

export async function searchSimilarImages(imageId: string, limit = 20): Promise<SearchResult[]> {
  const res = await authFetch(`${API}/api/v1/search/similar?image_id=${imageId}&limit=${limit}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Similarity search failed");
  const data = await res.json();
  return data.results;
}

// ── Clustering ───────────────────────────────────────────────────────────────

export async function triggerClustering(type: "faces" | "events" | "places" | "all"): Promise<{ task_id: string }> {
  const res = await authFetch(`${API}/api/v1/cluster/${type}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger clustering");
  return res.json();
}

// ── Image URLs ───────────────────────────────────────────────────────────────

export async function getThumbnailUrl(jobId: string): Promise<string> {
  const res = await authFetch(`${API}/api/v1/images/${jobId}/thumbnail`);
  if (!res.ok) throw new Error("Failed to get thumbnail URL");
  const data = await res.json();
  return data.url;
}

export async function getFullImageUrl(jobId: string): Promise<string> {
  const res = await authFetch(`${API}/api/v1/images/${jobId}/image`);
  if (!res.ok) throw new Error("Failed to get image URL");
  const data = await res.json();
  return data.url;
}

export async function fetchMyPhotos(params?: { status?: string; limit?: number; offset?: number }): Promise<{ total: number; photos: Photo[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));

  const url = `${API}/api/v1/images${query.toString() ? `?${query}` : ""}`;
  const res = await authFetch(url);
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
}

export async function deletePhoto(jobId: string): Promise<void> {
  const res = await authFetch(`${API}/api/v1/images/${jobId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete photo");
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface FilterParams {
  date_from?: string;
  date_to?: string;
  lat_min?: number;
  lat_max?: number;
  lon_min?: number;
  lon_max?: number;
  camera_model?: string;
  person_id?: string;
  limit?: number;
  offset?: number;
}

export async function filterPhotos(params: FilterParams): Promise<{ total: number; photos: Photo[] }> {
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      query.set(key, String(val));
    }
  }
  const res = await authFetch(`${API}/api/v1/filter?${query}`);
  if (!res.ok) throw new Error("Filter failed");
  return res.json();
}
