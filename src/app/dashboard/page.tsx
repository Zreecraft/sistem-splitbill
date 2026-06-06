"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  Compass,
  ArrowRight,
  LogOut,
  X,
  User,
  Settings,
  CloudLightning,
  Trash2,
  Bell,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeLocalStorage } from "@/lib/storage";

// Safe initialization of Supabase client
let supabase: any = null;
try {
  supabase = createClient();
} catch (e) {
  // Graceful fallback when Env Variables are missing
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: string[];
  owner?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [hasCloud, setHasCloud] = useState(!!supabase);

  // Authenticate user & load trips with account isolation
  useEffect(() => {
    const savedUser = safeLocalStorage.getItem("synctrip_user");
    if (!savedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    const email = parsedUser.email || "";
    const username = email.split("@")[0] || "";

    // 1. Load and filter trips (show only owned or joined trips)
    const savedTrips = safeLocalStorage.getItem("synctrip_trips");
    if (savedTrips) {
      const allTrips = JSON.parse(savedTrips);
      const filtered = allTrips.filter((t: Trip) => {
        const isOwner = t.owner && t.owner.toLowerCase() === email.toLowerCase();
        const isMember = t.members && t.members.some(m => 
          m.toLowerCase() === email.toLowerCase() || 
          m.toLowerCase() === username.toLowerCase()
        );
        return isOwner || isMember;
      });
      setTrips(filtered);
    }

    // 2. Load invitations for current user
    const allInvites = JSON.parse(safeLocalStorage.getItem("synctrip_invitations") || "[]");
    const filteredInvites = allInvites.filter((inv: any) => 
      inv.status === "pending" && 
      (inv.to.toLowerCase() === email.toLowerCase() || inv.to.toLowerCase() === username.toLowerCase())
    );
    setInvitations(filteredInvites);
  }, [router]);

  const handleLogout = () => {
    safeLocalStorage.removeItem("synctrip_user");
    router.push("/auth");
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.name || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      setError("Silakan lengkapi semua data perjalanan");
      return;
    }

    const email = user?.email || "";
    const username = email.split("@")[0] || "Saya";

    const sanitizedDest = newTrip.destination.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const tripId = `${sanitizedDest}-${Date.now()}`;
    const createdTrip: Trip = {
      id: tripId,
      name: newTrip.name,
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      members: [username],
      owner: email,
    };

    // Save globally
    const savedTrips = safeLocalStorage.getItem("synctrip_trips");
    const allTrips = savedTrips ? JSON.parse(savedTrips) : [];
    const updatedAllTrips = [...allTrips, createdTrip];
    safeLocalStorage.setItem("synctrip_trips", JSON.stringify(updatedAllTrips));

    // Update state filtered trips
    const filtered = updatedAllTrips.filter((t: Trip) => {
      const isOwner = t.owner && t.owner.toLowerCase() === email.toLowerCase();
      const isMember = t.members && t.members.some(m => 
        m.toLowerCase() === email.toLowerCase() || 
        m.toLowerCase() === username.toLowerCase()
      );
      return isOwner || isMember;
    });
    setTrips(filtered);

    // Reset Form
    setNewTrip({ name: "", destination: "", startDate: "", endDate: "" });
    setShowModal(false);
    setError("");

    // Automatically navigate to the new trip detail page
    router.push(`/trip/${tripId}`);
  };

  const handleAcceptInvite = (inviteId: string, tripId: string) => {
    const email = user?.email || "";
    const username = email.split("@")[0] || "Saya";

    // 1. Mark invite as accepted
    const currentInvites = JSON.parse(safeLocalStorage.getItem("synctrip_invitations") || "[]");
    const updatedInvites = currentInvites.map((inv: any) => {
      if (inv.id === inviteId) return { ...inv, status: "accepted" };
      return inv;
    });
    safeLocalStorage.setItem("synctrip_invitations", JSON.stringify(updatedInvites));
    setInvitations(updatedInvites.filter((inv: any) => 
      inv.status === "pending" && 
      (inv.to.toLowerCase() === email.toLowerCase() || inv.to.toLowerCase() === username.toLowerCase())
    ));

    // 2. Add user to trip members list
    const savedTrips = safeLocalStorage.getItem("synctrip_trips");
    if (savedTrips) {
      const tripsList = JSON.parse(savedTrips);
      const tripIdx = tripsList.findIndex((t: any) => t.id === tripId);
      if (tripIdx !== -1) {
        if (!tripsList[tripIdx].members.some((m: string) => m.toLowerCase() === username.toLowerCase())) {
          tripsList[tripIdx].members.push(username);
        }
        safeLocalStorage.setItem("synctrip_trips", JSON.stringify(tripsList));

        // Update dashboard trips state
        const filtered = tripsList.filter((t: Trip) => {
          const isOwner = t.owner && t.owner.toLowerCase() === email.toLowerCase();
          const isMember = t.members && t.members.some(m => 
            m.toLowerCase() === email.toLowerCase() || 
            m.toLowerCase() === username.toLowerCase()
          );
          return isOwner || isMember;
        });
        setTrips(filtered);
      }
    }
  };

  const handleDeclineInvite = (inviteId: string) => {
    const email = user?.email || "";
    const username = email.split("@")[0] || "";

    const currentInvites = JSON.parse(safeLocalStorage.getItem("synctrip_invitations") || "[]");
    const updatedInvites = currentInvites.filter((inv: any) => inv.id !== inviteId);
    safeLocalStorage.setItem("synctrip_invitations", JSON.stringify(updatedInvites));
    setInvitations(updatedInvites.filter((inv: any) => 
      inv.status === "pending" && 
      (inv.to.toLowerCase() === email.toLowerCase() || inv.to.toLowerCase() === username.toLowerCase())
    ));
  };

  const handleDeleteTrip = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus rencana perjalanan ini?")) {
      const updatedTrips = trips.filter((t) => t.id !== id);
      setTrips(updatedTrips);
      safeLocalStorage.setItem("synctrip_trips", JSON.stringify(updatedTrips));
      safeLocalStorage.removeItem(`synctrip_itin_${id}`);
      safeLocalStorage.removeItem(`synctrip_exps_${id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <MapPin className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-[-0.01em] text-[var(--text)]">SyncTrip</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] text-[var(--text-mid)]">
              <User className="w-4 h-4 text-[var(--accent)]" />
              <span className="max-w-[120px] truncate font-medium">{user.email}</span>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-dim)] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Pengaturan</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-dim)] hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-[1080px] mx-auto px-6 py-10">
        {/* Welcome row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-[24px] font-extrabold tracking-tight">Rencana Perjalanan</h1>
              <div className="inline-flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[var(--text-mid)]">
                <span className={`w-1.5 h-1.5 rounded-full ${hasCloud ? "bg-[var(--success)]" : "bg-amber-400"}`} />
                <span>{hasCloud ? "Tersinkron ke Awan" : "Tersimpan di Browser"}</span>
              </div>
            </div>
            <p className="text-[13.5px] text-[var(--text-mid)]">
              Semua trip aktif, kolaborasi, dan anggaran Anda ada di sini.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Rencana Baru</span>
          </button>
        </div>

        {/* Invitation Center */}
        {invitations.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--accent-hover)] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-hover)] animate-bounce" />
              Undangan Perjalanan Masuk ({invitations.length})
            </h3>
            <div className="grid gap-3">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-xl border border-indigo-500/25 bg-[#6366f1]/5 shadow-[0_4px_20px_rgba(99,102,241,0.05)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-5 h-5 text-[var(--accent-hover)]" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-white">
                        Undangan Gabung Rencana Perjalanan
                      </p>
                      <p className="text-[12.5px] text-[var(--text-mid)] mt-0.5">
                        <strong className="text-[var(--accent-hover)]">{invite.from}</strong> mengundang Anda ke trip <strong className="text-white">"{invite.tripName}"</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleAcceptInvite(invite.id, invite.tripId)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terima</span>
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="flex items-center gap-1.5 bg-[var(--border)] hover:bg-[var(--border-hover)] text-white text-[12px] font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-[var(--border)]"
                    >
                      <X className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-card)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-4">
              <Compass className="w-6 h-6 text-[var(--accent-hover)]" />
            </div>
            <h3 className="text-[15px] font-bold mb-1.5">Belum ada rencana perjalanan</h3>
            <p className="text-[13px] text-[var(--text-mid)] mb-6 max-w-xs mx-auto">
              Buat trip pertama Anda dan mulai petualangan seru bersama teman-teman Anda.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Rencana Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => router.push(`/trip/${trip.id}`)}
                className="group flex flex-col justify-between p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-[var(--accent-hover)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
                      {trip.destination}
                    </span>
                    <div className="flex -space-x-1.5">
                      {trip.members.slice(0, 3).map((member, i) => (
                        <div
                          key={member}
                          className={`w-6 h-6 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[9px] font-bold text-white ${
                            ["bg-indigo-500", "bg-sky-500", "bg-amber-500", "bg-rose-500"][i % 4]
                          }`}
                        >
                          {member[0].toUpperCase()}
                        </div>
                      ))}
                      {trip.members.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-elevated)] flex items-center justify-center text-[9px] font-bold text-[var(--text-mid)]">
                          +{trip.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-[15px] font-bold text-white group-hover:text-[var(--accent-hover)] transition-colors mb-2">
                    {trip.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-mid)] mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      -{" "}
                      {new Date(trip.endDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-4">
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-dim)]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{trip.members.length} anggota</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={(e) => handleDeleteTrip(e, trip.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Hapus Rencana"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--accent-hover)] group-hover:translate-x-0.5 transition-transform">
                      Buka Rencana <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal Container */}
          <div className="relative w-full max-w-[440px] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold">Buat Perjalanan Baru</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[12px] text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                  Nama Perjalanan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Liburan Keluarga Bali"
                  value={newTrip.name}
                  onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                  Destinasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Labuan Bajo, Indonesia"
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
              >
                <span>Mulai Merencanakan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
