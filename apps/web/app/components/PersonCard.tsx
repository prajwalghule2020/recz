"use client";

import Link from "next/link";
import FaceAvatar from "./FaceAvatar";
import type { Person } from "../../lib/api";

interface Props {
  person: Person;
}

export default function PersonCard({ person }: Props) {
  const hasFaceData = person.cover_image_url && person.cover_bbox && person.cover_width && person.cover_height;

  return (
    <Link href={`/people/${person.id}`} className="person-card animate-float-up">
      <div className="person-card-avatar">
        {hasFaceData ? (
          <FaceAvatar
            imageUrl={person.cover_image_url!}
            bbox={person.cover_bbox!}
            imgWidth={person.cover_width!}
            imgHeight={person.cover_height!}
            size={80}
            alt={person.name ?? "Unknown person"}
          />
        ) : (
          <div className="person-card-placeholder">👤</div>
        )}
      </div>
      <div className="person-card-info">
        <h3 className="person-card-name">
          {person.name ?? "Unknown"}
        </h3>
        <p className="person-card-count">
          {person.face_count} photo{person.face_count !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
