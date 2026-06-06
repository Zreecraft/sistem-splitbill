"use client";

import Link from "next/link";
import { MapPin, RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Navbar */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <MapPin className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-[-0.01em] text-[var(--text)]">SyncTrip</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-9 h-9 text-rose-400" strokeWidth={1.5} />
          </div>

          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-[var(--text)] mb-3">
            Terjadi Kesalahan
          </h1>

          <p className="text-[14px] leading-[1.7] text-[var(--text-mid)] mb-3">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi
            atau kembali ke halaman utama.
          </p>

          {/* Error details (dev only) */}
          {error?.message && (
            <div className="mb-6 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-left">
              <p className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-1.5">Detail Error</p>
              <p className="text-[12px] text-rose-400 font-mono break-all leading-relaxed">{error.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => reset()}
              className="group inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-mid)] hover:text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-5 px-6">
        <div className="max-w-[1080px] mx-auto text-center">
          <p className="text-[11px] text-[var(--text-dim)]">&copy; {new Date().getFullYear()} SyncTrip</p>
        </div>
      </footer>
    </div>
  );
}
