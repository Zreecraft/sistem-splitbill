import { MapPin } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mx-auto w-14 h-14 mb-6">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-2xl bg-[var(--accent)] animate-ping opacity-20" />
          {/* Inner logo */}
          <div className="relative w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MapPin className="w-6 h-6 text-white animate-bounce" strokeWidth={2} />
          </div>
        </div>

        {/* Brand name */}
        <p className="text-[15px] font-bold tracking-[-0.01em] text-[var(--text)] mb-3">
          SyncTrip
        </p>

        {/* Loading bar */}
        <div className="w-40 h-1 bg-[var(--bg-elevated)] rounded-full mx-auto overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-full animate-[loading-slide_1.2s_ease-in-out_infinite]" />
        </div>

        <p className="text-[12px] text-[var(--text-dim)] mt-3">
          Memuat halaman…
        </p>
      </div>
    </div>
  );
}
