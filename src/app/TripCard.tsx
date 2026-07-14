// src/app/TripCard.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Trip } from "@/lib/tripService";

/**
 * Premium card component that displays a trip summary.
 * Includes subtle glassmorphism background, hover elevation and a CTA button.
 */
export default function TripCard({ trip }: { trip: Trip }) {
  const startDateVal = trip.start_date || (trip as any).startDate;
  const endDateVal = trip.end_date || (trip as any).endDate;

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "";
    const dateObj = new Date(dateVal);
    return isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const startStr = formatDate(startDateVal);
  const endStr = formatDate(endDateVal);
  const dateRangeStr = startStr && endStr ? `${startStr} – ${endStr}` : startStr || endStr || "Tanggal tidak ditentukan";

  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[rgba(var(--bg-card-rgb),0.4)] backdrop-filter backdrop-blur-lg p-5 transition-transform hover:scale-[1.02] hover:shadow-xl">
      <h3 className="text-[18px] font-semibold text-[var(--text-mid)] mb-2 truncate">{trip.name}</h3>
      <p className="text-[13px] text-[var(--text-dim)] mb-4">
        {dateRangeStr}
      </p>
      <Link
        href={`/trip/${trip.id}`}
        className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
      >
        Lihat Detail
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
