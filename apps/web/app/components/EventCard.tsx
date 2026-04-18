"use client";

import { CalendarDaysIcon, CameraIcon } from "lucide-react";
import Link from "next/link";
import type { EventSummary } from "../../lib/api";

interface Props {
  event: EventSummary;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString("en-US", opts);
  }
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", opts)}`;
}

export default function EventCard({ event }: Props) {
  return (
    <Link href={`/events/${event.id}`} className="event-card animate-float-up">
      <div className="event-card-header">
        <div className="event-card-icon" aria-hidden="true">
          <CalendarDaysIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="event-card-title">
            {event.title ?? formatDateRange(event.start_time, event.end_time)}
          </h3>
          <p className="event-card-date">
            {formatDateRange(event.start_time, event.end_time)}
          </p>
        </div>
        <div className="event-card-count flex items-center gap-1">
          <CameraIcon className="h-4 w-4" aria-hidden="true" />
          <span>{event.photo_count}</span>
        </div>
      </div>
    </Link>
  );
}
