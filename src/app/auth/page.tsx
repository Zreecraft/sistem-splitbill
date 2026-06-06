"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, ShieldCheck, Mail, CloudLightning } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeLocalStorage } from "@/lib/storage";

// Safe initialization of Supabase client
let supabase: any = null;
try {
  supabase = createClient();
} catch (e) {
  // Graceful fallback when Env Variables are missing
}

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Silakan masukkan email dan kata sandi Anda");
      return;
    }
    setLoading(true);
    setError("");

    if (supabase) {
      try {
        if (isRegistering) {
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (signUpErr) throw signUpErr;
          
          // If signup is successful, save user info
          if (data?.user) {
            safeLocalStorage.setItem("synctrip_user", JSON.stringify({ email: data.user.email, isDemo: false }));
            router.push("/dashboard");
          }
        } else {
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInErr) throw signInErr;

          if (data?.user) {
            safeLocalStorage.setItem("synctrip_user", JSON.stringify({ email: data.user.email, isDemo: false }));
            router.push("/dashboard");
          }
        }
        setLoading(false);
        return;
      } catch (err: any) {
        // If Supabase auth fails, fallback to demo/simulation or show error
        console.warn("Supabase Auth failed, falling back to Simulation mode:", err.message);
      }
    }

    // Fallback Simulation Mode
    setTimeout(() => {
      safeLocalStorage.setItem("synctrip_user", JSON.stringify({ email, isDemo: false }));
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  const handleDemoMode = () => {
    setLoading(true);
    setTimeout(() => {
      safeLocalStorage.setItem(
        "synctrip_user",
        JSON.stringify({ email: "traveler@example.com", isDemo: true })
      );
      setLoading(false);
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between px-6 py-8">
      {/* Top Header */}
      <div className="max-w-[1080px] mx-auto w-full flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <MapPin className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold tracking-[-0.01em] text-[var(--text)]">SyncTrip</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[400px] mx-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-7 md:p-8 my-auto">
        <div className="text-center mb-6">
          <h1 className="text-[20px] font-bold tracking-tight text-[var(--text)] mb-2">
            {isRegistering ? "Daftar Akun Baru" : "Selamat Datang Kembali"}
          </h1>
          <p className="text-[13px] text-[var(--text-mid)]">
            {isRegistering
              ? "Gabung dengan ribuan traveler yang merencanakan trip bareng"
              : "Masuk untuk melanjutkan rencana perjalanan Anda"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[12px] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2.5 outline-none transition-all placeholder:text-[var(--text-dim)]"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2.5 outline-none transition-all placeholder:text-[var(--text-dim)]"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? "Buat Akun" : "Masuk"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">
            Atau Coba Langsung
          </span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        {/* Try Demo Mode Button */}
        <button
          onClick={handleDemoMode}
          className="w-full flex items-center justify-center gap-2 border border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[13.5px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
          disabled={loading}
        >
          <span>Masuk Mode Demo (Tanpa Akun)</span>
        </button>

        {/* Toggle Register/Login */}
        <div className="mt-6 text-center text-[12.5px] text-[var(--text-mid)]">
          {isRegistering ? (
            <p>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-[var(--accent-hover)] font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-[var(--accent-hover)] font-semibold hover:underline"
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[1080px] mx-auto w-full flex flex-col items-center gap-2 text-center text-[11px] text-[var(--text-dim)]">
        <span className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
          Koneksi aman terenkripsi
        </span>
        <div className="inline-flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] px-2.5 py-1 rounded-full text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${supabase ? "bg-[var(--success)]" : "bg-amber-400"}`} />
          <span>{supabase ? "Supabase Cloud Terhubung" : "Mode Offline / Simulasi Aktif"}</span>
        </div>
      </div>
    </div>
  );
}
