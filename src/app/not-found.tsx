import Link from "next/link";
import { MapPin, ArrowLeft, Compass, Home } from "lucide-react";

export default function NotFound() {
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
          {/* Animated compass icon */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-[var(--accent-subtle)] animate-ping opacity-20" />
            <div className="relative w-24 h-24 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center">
              <Compass className="w-10 h-10 text-[var(--accent-hover)] animate-[spin_8s_linear_infinite]" strokeWidth={1.5} />
            </div>
          </div>

          {/* 404 Number */}
          <p className="text-[64px] sm:text-[80px] font-black tracking-[-0.04em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[var(--text)] to-[var(--text-dim)] mb-4">
            404
          </p>

          <h1 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[var(--text)] mb-3">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-[14px] leading-[1.7] text-[var(--text-mid)] mb-8">
            Sepertinya Anda tersesat! Halaman yang Anda cari tidak ada
            atau sudah dipindahkan ke lokasi lain.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Ke Dashboard</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-mid)] hover:text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
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
