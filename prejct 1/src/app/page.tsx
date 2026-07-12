import Link from "next/link";
import { listUserTrips } from "@/lib/tripService";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import TripCard from "@/app/TripCard";
import { safeLocalStorage } from "@/lib/storage";

import {
  ArrowRight,
  MapPin,
  Users,
  CreditCard,
  CalendarRange,
  Bell,
  Bookmark,
  CheckCircle2,
  Star,
  Plane,
  UtensilsCrossed,
  Home as HomeIcon,
  Waves,
  Sunset,
} from "lucide-react";

export default async function Page() {
  // Attempt to get Supabase client and user session
  let user = null;
  try {
    const supabase = await createServerSupabase();
    const { data: { user: supUser } = {} } = await supabase.auth.getUser();
    if (supUser) user = supUser;
  } catch (e) {
    // Supabase not available; fallback to local storage demo user
    const stored = safeLocalStorage.getItem("synctrip_user");
    if (stored) {
      try { user = JSON.parse(stored); } catch {}
    }
  }

  // Fetch trips if user is present
  let trips = [];
  if (user) {
    const userId = (user as any).id ?? (user as any).email;
    try {
      trips = await listUserTrips(userId);
    } catch (e) {
      const storedTrips = safeLocalStorage.getItem("synctrip_trips");
      if (storedTrips) {
        try {
          const all = JSON.parse(storedTrips);
          trips = all.filter((t: any) => t.owner?.toLowerCase() === (user as any).email?.toLowerCase() || t.members?.some((m: string) => m.toLowerCase() === (user as any).email?.toLowerCase()));
        } catch {}
      }
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* User Trips Section - Only shown when user has active trips */}
        {user && trips.length > 0 && (
          <section className="py-20 md:py-28 px-6 border-t border-[var(--border)]" id="my-trips">
            <div className="max-w-[1080px] mx-auto mb-12">
              <h2 className="text-[26px] sm:text-[32px] font-bold mb-6 text-center">Trip Anda</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Buat Trip Baru
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

/* ────────────────────────────────────
   NAVBAR
   ──────────────────────────────────── */
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <MapPin className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold tracking-[-0.01em]">SyncTrip</span>
        </Link>

        {/* Nav links — only desktop */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] text-[var(--text-mid)]">
          <a href="#features" className="hover:text-white transition-colors">Fitur</a>
          <a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a>
          <a href="#testimoni" className="hover:text-white transition-colors">Testimoni</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/auth" className="hidden sm:inline-block text-[13px] text-[var(--text-mid)] hover:text-white transition-colors px-3 py-1.5 rounded-lg">
            Masuk
          </Link>
          <Link
            href="/dashboard"
            className="text-[13px] font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Daftar Gratis
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ────────────────────────────────────
   HERO
   ──────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-[100px] pb-10 md:pt-[140px] md:pb-16 px-6">
      <div className="max-w-[1080px] mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
        {/* Left — copy */}
        <div>
          <p className="inline-flex items-center gap-2 text-[12px] font-medium text-[var(--accent-hover)] bg-[var(--accent-subtle)] px-3 py-1 rounded-full mb-6">
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--success)]" />
            Gratis untuk selamanya
          </p>

          <h1 className="text-[32px] sm:text-[40px] lg:text-[46px] font-extrabold leading-[1.12] tracking-[-0.03em] mb-5">
            Rencanakan Liburan Bareng Teman, di Satu Tempat.
          </h1>

          <p className="text-[16px] leading-[1.75] text-[var(--text-mid)] max-w-md mb-8">
            Atur jadwal perjalanan dan bagi-bagi biaya tanpa ribet.
            Semua orang bisa lihat dan edit secara bersamaan — langsung dari browser.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#cara-kerja"
              className="text-[14px] text-[var(--text-mid)] hover:text-white border border-[var(--border)] hover:border-[var(--border-hover)] px-5 py-2.5 rounded-lg transition-colors"
            >
              Lihat Cara Kerja
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap gap-5 mt-7 text-[12px] text-[var(--text-dim)]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
              Tanpa kartu kredit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
              Setup kurang dari 1 menit
            </span>
          </div>
        </div>

        {/* Right — app preview card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Plane className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[14px] font-semibold">Trip Bali 2026</p>
                <p className="text-[11px] text-[var(--text-dim)]">12 – 16 Juni</p>
              </div>
            </div>
            {/* Member avatars */}
            <div className="flex -space-x-1.5">
              {["A","S","B","R"].map((l, i) => (
                <div
                  key={l}
                  className={`w-7 h-7 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-white ${
                    ["bg-indigo-500","bg-sky-500","bg-amber-500","bg-rose-500"][i]
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Day tabs */}
          <div className="px-5 pt-4 flex gap-1.5">
            {["Hari 1","Hari 2","Hari 3","Hari 4","Hari 5"].map((d, i) => (
              <div
                key={d}
                className={`px-3 py-1 rounded-md text-[12px] font-medium ${
                  i === 0
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-dim)] hover:text-[var(--text-mid)]"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Itinerary list */}
          <div className="p-5 space-y-1.5">
            {[
              { icon: Plane, label: "Tiba di Bandara Ngurah Rai", time: "08:00", color: "text-sky-400 bg-sky-400/10" },
              { icon: HomeIcon, label: "Check-in Villa Seminyak", time: "10:30", color: "text-emerald-400 bg-emerald-400/10" },
              { icon: UtensilsCrossed, label: "Makan Siang — Warung Nasi Ayam", time: "12:00", color: "text-amber-400 bg-amber-400/10" },
              { icon: Waves, label: "Pantai Kuta", time: "15:00", color: "text-cyan-400 bg-cyan-400/10" },
              { icon: Sunset, label: "Dinner Sunset di Jimbaran", time: "19:00", color: "text-orange-400 bg-orange-400/10" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color.split(" ")[1]}`}>
                    <Icon className={`w-4 h-4 ${item.color.split(" ")[0]}`} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{item.label}</p>
                  </div>
                  <span className="text-[11px] text-[var(--text-dim)] font-mono shrink-0">{item.time}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom bar */}
          <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
              <CreditCard className="w-3.5 h-3.5" />
              Pengeluaran Hari 1
            </div>
            <span className="text-[13px] font-semibold">Rp 5.570.000</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   FEATURES — 6 cards, icons, simple copy
   ──────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: "Ajak Siapa Saja",
    desc: "Kirim link undangan, teman langsung bisa ikut tanpa perlu buat akun.",
    iconClass: "text-indigo-400",
    bgClass: "bg-indigo-400/10",
  },
  {
    icon: CalendarRange,
    title: "Jadwal Hari per Hari",
    desc: "Susun rencana tiap hari. Tinggal geser untuk ubah urutan kegiatan.",
    iconClass: "text-sky-400",
    bgClass: "bg-sky-400/10",
  },
  {
    icon: CreditCard,
    title: "Bagi Biaya Otomatis",
    desc: "Catat siapa bayar apa. Sistem hitung sendiri siapa yang harus ganti.",
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-400/10",
  },
  {
    icon: Bell,
    title: "Notifikasi Perubahan",
    desc: "Langsung tahu kalau ada teman yang ubah atau tambah rencana baru.",
    iconClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
  },
  {
    icon: Bookmark,
    title: "Simpan Tempat Menarik",
    desc: "Bookmark hotel, restoran, atau wisata favorit langsung ke dalam trip.",
    iconClass: "text-rose-400",
    bgClass: "bg-rose-400/10",
  },
  {
    icon: MapPin,
    title: "Semua di Satu Tempat",
    desc: "Tidak perlu pindah-pindah aplikasi. Jadwal, biaya, dan catatan ada di sini.",
    iconClass: "text-violet-400",
    bgClass: "bg-violet-400/10",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 md:py-28 px-6">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center max-w-lg mx-auto mb-14">
          <h2 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] mb-3">
            Semua yang dibutuhkan untuk trip yang lancar
          </h2>
          <p className="text-[15px] text-[var(--text-mid)]">
            Satu aplikasi untuk mengatur semuanya — dari jadwal sampai biaya.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${f.bgClass} flex items-center justify-center mb-4`}>
                  <Icon className={`w-[18px] h-[18px] ${f.iconClass}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-[14px] font-semibold mb-1.5">{f.title}</h3>
                <p className="text-[13px] leading-[1.6] text-[var(--text-mid)]">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   HOW IT WORKS — 3 steps, numbered
   ──────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: 1,
      icon: MapPin,
      title: "Buat Trip Baru",
      desc: "Beri nama, pilih tanggal, selesai. Hanya butuh beberapa detik.",
    },
    {
      num: 2,
      icon: Users,
      title: "Undang Teman",
      desc: "Bagikan link ke teman yang mau ikut. Mereka langsung bisa masuk.",
    },
    {
      num: 3,
      icon: CalendarRange,
      title: "Rencanakan Bersama",
      desc: "Tambahkan tempat, atur jadwal, dan catat pengeluaran bersama-sama.",
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 md:py-28 px-6 border-t border-[var(--border)]">
      <div className="max-w-[860px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] mb-3">
            Mudah dipakai, cuma 3 langkah
          </h2>
          <p className="text-[15px] text-[var(--text-mid)]">
            Tidak perlu belajar lama. Langsung pakai, langsung paham.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative text-center">
                {/* Step number */}
                <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-[18px] font-bold mb-5">
                  {s.num}
                </div>
                <h3 className="text-[15px] font-semibold mb-2">{s.title}</h3>
                <p className="text-[13px] leading-[1.65] text-[var(--text-mid)]">{s.desc}</p>

                {/* Connector line — only between steps on desktop */}
                {s.num < 3 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-[var(--border)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   TESTIMONIALS
   ──────────────────────────────────── */
function Testimonials() {
  const reviews = [
    {
      name: "Dinda Pratiwi",
      role: "Sering trip bareng komunitas",
      text: "Dulu urus bagi-bagi uang sehabis trip itu paling males. Sekarang semua keliatan jelas siapa yang harus transfer berapa.",
      color: "bg-rose-500",
    },
    {
      name: "Raka Aditya",
      role: "Suka traveling bareng teman",
      text: "Enaknya bisa edit jadwal bareng-bareng langsung tanpa harus kirim-kiriman screenshot di WhatsApp.",
      color: "bg-sky-500",
    },
    {
      name: "Maya Sari",
      role: "Sering organize trip keluarga",
      text: "Tampilannya gampang dipahami. Ibu saya yang tidak biasa pakai aplikasi pun bisa langsung ngerti.",
      color: "bg-emerald-500",
    },
  ];

  return (
    <section id="testimoni" className="py-20 md:py-28 px-6 border-t border-[var(--border)]">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] mb-3">
            Yang lain sudah mencoba
          </h2>
          <p className="text-[15px] text-[var(--text-mid)]">
            Pendapat dari mereka yang sudah pakai SyncTrip.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[13.5px] leading-[1.7] text-[var(--text-mid)] mb-5">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                <div className={`w-8 h-8 rounded-full ${r.color} flex items-center justify-center text-[11px] font-bold text-white`}>
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-semibold">{r.name}</p>
                  <p className="text-[11px] text-[var(--text-dim)]">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   CTA
   ──────────────────────────────────── */
function CTA() {
  return (
    <section className="py-20 md:py-28 px-6 border-t border-[var(--border)]">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-6 h-6 text-[var(--accent-hover)]" strokeWidth={1.8} />
        </div>

        <h2 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] mb-3">
          Siap rencanakan trip berikutnya?
        </h2>
        <p className="text-[15px] text-[var(--text-mid)] mb-4">
          Daftar gratis, ajak teman, dan mulai atur perjalanan seru kalian.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-[12px] text-[var(--text-dim)] mb-7">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> Gratis selamanya
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> Tanpa kartu kredit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> Langsung bisa pakai
          </span>
        </div>

        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[15px] font-semibold px-7 py-3 rounded-lg transition-colors"
        >
          Mulai Gratis Sekarang
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   FOOTER
   ──────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-7 px-6">
      <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--accent)] flex items-center justify-center">
            <MapPin className="w-[10px] h-[10px] text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[12px] font-semibold text-[var(--text-dim)]">SyncTrip</span>
        </div>
        <div className="flex gap-5 text-[12px] text-[var(--text-dim)]">
          <a href="#" className="hover:text-[var(--text-mid)] transition-colors">Bantuan</a>
          <a href="#" className="hover:text-[var(--text-mid)] transition-colors">Privasi</a>
          <a href="#" className="hover:text-[var(--text-mid)] transition-colors">Ketentuan</a>
        </div>
        <p className="text-[11px] text-[var(--text-dim)]">&copy; {new Date().getFullYear()} SyncTrip</p>
      </div>
    </footer>
  );
}
