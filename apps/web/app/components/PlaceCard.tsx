"use client";

import Link from "next/link";
import type { PlaceSummary } from "../../lib/api";

interface Props {
  place: PlaceSummary;
}

export default function PlaceCard({ place }: Props) {
  return (
    <Link href={`/places/${place.id}`} className="place-card animate-float-up">
      <div className="place-card-icon">📍</div>
      <div className="place-card-info">
        <h3 className="place-card-name">{place.name}</h3>
        <p className="place-card-country">{place.country ?? ""}</p>
      </div>
      <div className="place-card-count">
        {place.photo_count} photo{place.photo_count !== 1 ? "s" : ""}
      </div>
    </Link>
  );
}
