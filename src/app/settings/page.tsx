"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ArrowLeft,
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  Save,
  CheckCircle2,
  Shield,
  Palette,
  Bell,
  ChevronRight,
} from "lucide-react";
import { safeLocalStorage } from "@/lib/storage";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; isDemo?: boolean } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "preferences">("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = safeLocalStorage.getItem("synctrip_user");
    if (!savedUser) {
      router.push("/auth");
      return;
    }
    const parsed = JSON.parse(savedUser);
    setUser(parsed);
    setDisplayName(parsed.displayName || parsed.email.split("@")[0]);
  }, [router]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Nama tampilan tidak boleh kosong");
      return;
    }

    // Save to localStorage
    const updatedUser = { ...user, displayName: displayName.trim() };
    safeLocalStorage.setItem("synctrip_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setError("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Silakan isi semua kolom password");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    // Simulated — reset fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLogout = () => {
    safeLocalStorage.removeItem("synctrip_user");
    router.push("/auth");
  };

  if (!user) return null;

  const sidebarItems = [
    { id: "profile", label: "Profil Saya", icon: User, desc: "Nama & informasi akun" },
    { id: "security", label: "Keamanan", icon: Shield, desc: "Password & autentikasi" },
    { id: "preferences", label: "Preferensi", icon: Palette, desc: "Tampilan & notifikasi" },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-[13px] text-[var(--text-mid)] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="w-px h-5 bg-[var(--border)]" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <MapPin className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-bold tracking-[-0.01em] text-[var(--text)]">SyncTrip</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-dim)] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1080px] mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[24px] font-extrabold tracking-tight mb-1">Pengaturan Akun</h1>
          <p className="text-[13.5px] text-[var(--text-mid)]">
            Kelola profil, keamanan, dan preferensi Anda.
          </p>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--success)] text-[13px] font-medium animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Perubahan berhasil disimpan!</span>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-medium animate-[fadeIn_0.3s_ease-out]">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setError(""); }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 group ${
                    activeSection === item.id
                      ? "bg-[var(--accent-subtle)] border border-indigo-500/20"
                      : "hover:bg-[var(--bg-card)] border border-transparent"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    activeSection === item.id
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-elevated)] text-[var(--text-mid)] group-hover:text-white"
                  }`}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13.5px] font-semibold ${
                      activeSection === item.id ? "text-white" : "text-[var(--text-mid)] group-hover:text-white"
                    }`}>{item.label}</p>
                    <p className="text-[11px] text-[var(--text-dim)] truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${
                    activeSection === item.id ? "text-[var(--accent-hover)]" : "text-[var(--text-dim)]"
                  }`} />
                </button>
              );
            })}

            {/* Danger Zone at bottom */}
            <div className="pt-4 mt-4 border-t border-[var(--border)]">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer flex items-center gap-3 text-rose-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[13px] font-semibold">Keluar dari Akun</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div>
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                {/* Avatar Header */}
                <div className="px-6 py-6 border-b border-[var(--border)] bg-gradient-to-r from-indigo-500/5 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-[24px] font-bold text-white shadow-lg shadow-indigo-500/20">
                      {displayName[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-white">{displayName}</h2>
                      <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-mid)] mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{user.email}</span>
                      </div>
                      {user.isDemo && (
                        <span className="inline-block mt-2 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Mode Demo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3.5 py-2.5 outline-none transition-all text-white placeholder:text-[var(--text-dim)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                      Alamat Email
                    </label>
                    <div className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5">
                      <Mail className="w-4 h-4 text-[var(--text-dim)]" />
                      <span className="text-[13.5px] text-[var(--text-dim)]">{user.email}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-dim)] mt-1.5">
                      Email tidak dapat diubah saat ini.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-400/10 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-white">Ubah Kata Sandi</h3>
                        <p className="text-[11.5px] text-[var(--text-dim)]">Perbarui password Anda secara berkala</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3.5 py-2.5 outline-none transition-all text-white placeholder:text-[var(--text-dim)]"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 karakter"
                          className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3.5 py-2.5 outline-none transition-all text-white placeholder:text-[var(--text-dim)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                          Konfirmasi Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru"
                          className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3.5 py-2.5 outline-none transition-all text-white placeholder:text-[var(--text-dim)]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Perbarui Password</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-rose-500/20">
                    <h3 className="text-[14px] font-bold text-rose-400">Zona Berbahaya</h3>
                    <p className="text-[11.5px] text-[var(--text-dim)]">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                  <div className="p-6">
                    <p className="text-[13px] text-[var(--text-mid)] mb-4 leading-relaxed">
                      Menghapus akun akan menghilangkan semua data perjalanan, riwayat pengeluaran,
                      dan kolaborasi Anda secara permanen.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan.")) {
                          safeLocalStorage.clear();
                          router.push("/");
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Akun Saya</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                {/* Appearance */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-400/10 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-violet-400" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-white">Tampilan</h3>
                        <p className="text-[11.5px] text-[var(--text-dim)]">Sesuaikan tampilan aplikasi</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Theme selection */}
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-3">
                        Tema Aplikasi
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "dark", label: "Gelap", colors: "bg-[#101218] border-[var(--accent)]" },
                          { id: "light", label: "Terang", colors: "bg-gray-100 border-transparent opacity-40" },
                          { id: "auto", label: "Sistem", colors: "bg-gradient-to-r from-[#101218] to-gray-100 border-transparent opacity-40" },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                              theme.id === "dark"
                                ? "border-[var(--accent)] bg-[var(--bg-elevated)]"
                                : "border-[var(--border)] bg-[var(--bg)] opacity-50 cursor-not-allowed"
                            }`}
                            disabled={theme.id !== "dark"}
                          >
                            <div className={`w-full h-8 rounded-lg mb-2 ${theme.colors}`} />
                            <span className={`text-[12px] font-medium ${
                              theme.id === "dark" ? "text-white" : "text-[var(--text-dim)]"
                            }`}>{theme.label}</span>
                            {theme.id === "dark" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-hover)] mx-auto mt-1" />
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] mt-2">
                        Tema terang dan otomatis akan tersedia di pembaruan mendatang.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-amber-400" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-white">Notifikasi</h3>
                        <p className="text-[11.5px] text-[var(--text-dim)]">Atur kapan Anda menerima notifikasi</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {[
                      { label: "Perubahan itinerary", desc: "Saat anggota menambah atau mengubah rencana", defaultOn: true },
                      { label: "Pengeluaran baru", desc: "Saat ada catatan pengeluaran baru ditambahkan", defaultOn: true },
                      { label: "Anggota baru", desc: "Saat ada orang bergabung ke trip Anda", defaultOn: true },
                      { label: "Pengingat trip", desc: "Pengingat H-1 sebelum trip dimulai", defaultOn: false },
                    ].map((notif) => (
                      <div
                        key={notif.label}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-white">{notif.label}</p>
                          <p className="text-[11.5px] text-[var(--text-dim)]">{notif.desc}</p>
                        </div>
                        {/* Toggle switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={notif.defaultOn}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    ))}

                    <p className="text-[11px] text-[var(--text-dim)] pt-2 border-t border-[var(--border)]">
                      Fitur notifikasi push akan tersedia setelah integrasi backend selesai.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
