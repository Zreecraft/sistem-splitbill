"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  ArrowLeft,
  Receipt,
  CheckCircle2,
  Trash2,
  Share2,
  ChevronRight,
  Plane,
  Home as HomeIcon,
  UtensilsCrossed,
  Waves,
  Sunset,
  Clock,
  Sparkles,
  Printer,
  Bell,
  Check,
  Percent,
  Pencil,
} from "lucide-react";
import { safeLocalStorage } from "@/lib/storage";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Member {
  name: string;
  avatarColor: string;
}

interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  title: string;
  category: "flight" | "lodging" | "food" | "beach" | "sunset" | "other";
  who: string;
  estimatedBudget: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitWith: string[]; // List of names
  category: "accommodation" | "food" | "transport" | "tickets" | "shopping" | "other";
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

const categoryLabels: Record<string, string> = {
  accommodation: "🏨 Akomodasi",
  food: "🍔 Makanan",
  transport: "✈️ Transport",
  tickets: "🎟️ Rekreasi",
  shopping: "🛍️ Belanja",
  other: "📦 Lainnya",
};

const categoryColors: Record<string, string> = {
  accommodation: "#818cf8", // indigo-400
  food: "#fbbf24", // amber-400
  transport: "#38bdf8", // sky-400
  tickets: "#f43f5e", // rose-400
  shopping: "#ec4899", // pink-500
  other: "#94a3b8", // slate-400
};

export default function TripDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const tripId = decodeURIComponent(resolvedParams.id);

  const [tripName, setTripName] = useState("Trip Baru");
  const [destination, setDestination] = useState("Destinasi");
  const [dates, setDates] = useState("Tanggal");
  const [daysCount, setDaysCount] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [activeTab, setActiveTab] = useState<"itinerary" | "expenses" | "collaborators">("itinerary");

  // Core interactive states — empty by default, loaded from storage
  const [members, setMembers] = useState<Member[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Form states
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [newItem, setNewItem] = useState({
    time: "",
    title: "",
    category: "other" as ItineraryItem["category"],
    who: "Semua",
    estimatedBudget: "",
  });

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitWith: [] as string[],
    category: "other" as Expense["category"],
  });

  const [newMemberName, setNewMemberName] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; title: string } | null>(null);
  const [tripNotFound, setTripNotFound] = useState(false);

  // Auto-hide toast
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, show: false } : null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const simulateFriendAction = () => {
    const friendNames = ["Sari", "Budi", "Rudi"];
    const friendName = friendNames[Math.floor(Math.random() * friendNames.length)];
    const actionType = Math.floor(Math.random() * 3); // 0 = add expense, 1 = add itinerary, 2 = join trip

    if (actionType === 0) {
      // Add Expense
      const items = [
        { desc: "Makan Malam Seafood Jimbaran", amount: 950000, cat: "food" as const },
        { desc: "Sewa Motor Honda PCX", amount: 250000, cat: "transport" as const },
        { desc: "Tiket Masuk Pura Uluwatu", amount: 150000, cat: "tickets" as const },
        { desc: "Beli Oleh-oleh Krisna", amount: 350000, cat: "shopping" as const },
      ];
      const selectedItem = items[Math.floor(Math.random() * items.length)];
      const newExpItem: Expense = {
        id: `e-sim-${Date.now()}`,
        description: selectedItem.desc,
        amount: selectedItem.amount,
        paidBy: friendName,
        splitWith: members.map(m => m.name),
        category: selectedItem.cat,
      };
      const updatedExps = [...expenses, newExpItem];
      saveExpenses(updatedExps);
      setToast({
        show: true,
        title: "Kolaborasi Real-Time",
        message: `${friendName} baru saja menambahkan pengeluaran: "${selectedItem.desc}" sebesar Rp ${selectedItem.amount.toLocaleString("id-ID")}`,
      });
    } else if (actionType === 1) {
      // Add Itinerary
      const itins = [
        { title: "Nonton Tari Kecak Uluwatu", time: "18:00", cat: "sunset" as const, budget: 100000 },
        { title: "Makan Pagi Nasi Kedewatan", time: "07:30", cat: "food" as const, budget: 75000 },
        { title: "Snorkeling di Nusa Penida", time: "09:00", cat: "beach" as const, budget: 350000 },
        { title: "Santai di Beach Club Seminyak", time: "16:00", cat: "sunset" as const, budget: 200000 },
      ];
      const selectedItin = itins[Math.floor(Math.random() * itins.length)];
      const newItinItem: ItineraryItem = {
        id: `i-sim-${Date.now()}`,
        day: currentDay,
        time: selectedItin.time,
        title: selectedItin.title,
        category: selectedItin.cat,
        who: friendName,
        estimatedBudget: selectedItin.budget,
      };
      const updatedItin = [...itinerary, newItinItem].sort((a, b) => a.time.localeCompare(b.time));
      saveItinerary(updatedItin);
      setToast({
        show: true,
        title: "Kolaborasi Real-Time",
        message: `${friendName} baru saja menambahkan rencana kegiatan Hari ${currentDay}: "${selectedItin.title}" pukul ${selectedItin.time}`,
      });
    } else {
      // Add member
      const newNames = ["Dewi", "Fajar", "Gita", "Hendra"];
      const unusedNames = newNames.filter(name => !members.some(m => m.name === name));
      if (unusedNames.length > 0) {
        const nameToInvite = unusedNames[Math.floor(Math.random() * unusedNames.length)];
        const colors = ["bg-indigo-500", "bg-sky-500", "bg-amber-500", "bg-rose-500", "bg-teal-500", "bg-emerald-500"];
        const newM: Member = {
          name: nameToInvite,
          avatarColor: colors[members.length % colors.length],
        };
        const updatedM = [...members, newM];
        setMembers(updatedM);
        
        // Save to localStorage trip object
        const savedTrips = safeLocalStorage.getItem("synctrip_trips");
        if (savedTrips) {
          try {
            const tripsList = JSON.parse(savedTrips);
            const activeTripIdx = tripsList.findIndex((t: any) => t.id === tripId);
            if (activeTripIdx !== -1) {
              tripsList[activeTripIdx].members = updatedM.map(m => m.name);
              safeLocalStorage.setItem("synctrip_trips", JSON.stringify(tripsList));
            }
          } catch (e) {
            console.error("Failed to parse trips during simulated action:", e);
          }
        }
        setToast({
          show: true,
          title: "Anggota Baru Bergabung",
          message: `${nameToInvite} baru saja masuk ke trip via link undangan!`,
        });
      } else {
        setToast({
          show: true,
          title: "Sistem Sinkron",
          message: `Semua data kolaborasi berhasil disinkronkan secara instan!`,
        });
      }
    }
  };

  // Load trip data from storage
  useEffect(() => {
    // Authenticate user
    const savedUser = safeLocalStorage.getItem("synctrip_user");
    if (!savedUser) {
      router.push("/auth");
      return;
    }

    // Find this specific trip
    const savedTrips = safeLocalStorage.getItem("synctrip_trips");
    if (savedTrips) {
      try {
        const tripsList = JSON.parse(savedTrips);
        const activeTrip = tripsList.find((t: any) => t.id === tripId);
        if (activeTrip) {
          setTripName(activeTrip.name);
          setDestination(activeTrip.destination);
          const start = new Date(activeTrip.startDate);
          const end = new Date(activeTrip.endDate);
          setDates(
            `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
          );

          // Calculate days count
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setDaysCount(diffDays || 1);

          // Load members from trip data
          if (activeTrip.members && activeTrip.members.length > 0) {
            const colors = ["bg-indigo-500", "bg-sky-500", "bg-amber-500", "bg-rose-500", "bg-teal-500", "bg-emerald-500"];
            const formattedMembers = activeTrip.members.map((name: string, idx: number) => ({
              name,
              avatarColor: colors[idx % colors.length],
            }));
            setMembers(formattedMembers);
            // Also sync paidBy default to first member
            setNewExpense(prev => ({
              ...prev,
              paidBy: activeTrip.members[0],
              splitWith: activeTrip.members,
            }));
          }
        } else {
          // Trip not found — redirect back to dashboard
          setTripNotFound(true);
        }
      } catch (e) {
        console.error("Failed to parse trips in useEffect:", e);
        setTripNotFound(true);
      }
    } else {
      // No trips at all — redirect back
      setTripNotFound(true);
    }

    // Load custom itinerary/expenses for this trip ID
    const savedItin = safeLocalStorage.getItem(`synctrip_itin_${tripId}`);
    if (savedItin) {
      try {
        setItinerary(JSON.parse(savedItin));
      } catch (e) {
        console.error("Failed to parse itinerary:", e);
      }
    }

    const savedExps = safeLocalStorage.getItem(`synctrip_exps_${tripId}`);
    if (savedExps) {
      try {
        setExpenses(JSON.parse(savedExps));
      } catch (e) {
        console.error("Failed to parse expenses:", e);
      }
    }
  }, [tripId, router]);

  // Persists helper
  const saveItinerary = (newItinList: ItineraryItem[]) => {
    setItinerary(newItinList);
    safeLocalStorage.setItem(`synctrip_itin_${tripId}`, JSON.stringify(newItinList));
  };

  const saveExpenses = (newExpsList: Expense[]) => {
    setExpenses(newExpsList);
    safeLocalStorage.setItem(`synctrip_exps_${tripId}`, JSON.stringify(newExpsList));
  };

  // Add handlers
  const handleAddItineraryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.time || !newItem.title) return;

    const item: ItineraryItem = {
      id: Date.now().toString(),
      day: currentDay,
      time: newItem.time,
      title: newItem.title,
      category: newItem.category,
      who: newItem.who,
      estimatedBudget: parseFloat(newItem.estimatedBudget) || 0,
    };

    const updated = [...itinerary, item].sort((a, b) => a.time.localeCompare(b.time));
    saveItinerary(updated);
    setNewItem({ time: "", title: "", category: "other", who: "Semua", estimatedBudget: "" });
    setShowItineraryModal(false);
  };

  const handleDeleteItineraryItem = (id: string) => {
    const updated = itinerary.filter((item) => item.id !== id);
    saveItinerary(updated);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitWith: newExpense.splitWith,
      category: newExpense.category,
    };

    const updated = [...expenses, expense];
    saveExpenses(updated);
    setNewExpense({
      description: "",
      amount: "",
      paidBy: members[0]?.name || "Saya",
      splitWith: members.map(m => m.name),
      category: "other",
    });
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    saveExpenses(updated);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const name = newMemberName.trim();
    if (members.some(m => m.name.toLowerCase() === name.toLowerCase())) return;

    const colors = ["bg-indigo-500", "bg-sky-500", "bg-amber-500", "bg-rose-500", "bg-teal-500", "bg-emerald-500"];
    const newMember: Member = {
      name,
      avatarColor: colors[members.length % colors.length],
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    setNewMemberName("");

    // Update members in main trip object as well
    const savedTrips = safeLocalStorage.getItem("synctrip_trips");
    if (savedTrips) {
      try {
        const tripsList = JSON.parse(savedTrips);
        const activeTripIdx = tripsList.findIndex((t: any) => t.id === tripId);
        if (activeTripIdx !== -1) {
          tripsList[activeTripIdx].members = updatedMembers.map(m => m.name);
          safeLocalStorage.setItem("synctrip_trips", JSON.stringify(tripsList));
        }
      } catch (e) {
        console.error("Failed to parse trips during member addition:", e);
      }
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper icons
  const getCategoryIcon = (category: ItineraryItem["category"]) => {
    switch (category) {
      case "flight":
        return <Plane className="w-4 h-4 text-sky-400" strokeWidth={1.8} />;
      case "lodging":
        return <HomeIcon className="w-4 h-4 text-emerald-400" strokeWidth={1.8} />;
      case "food":
        return <UtensilsCrossed className="w-4 h-4 text-amber-400" strokeWidth={1.8} />;
      case "beach":
        return <Waves className="w-4 h-4 text-cyan-400" strokeWidth={1.8} />;
      case "sunset":
        return <Sunset className="w-4 h-4 text-orange-400" strokeWidth={1.8} />;
      default:
        return <Clock className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />;
    }
  };

  const getCategoryColor = (category: ItineraryItem["category"]) => {
    switch (category) {
      case "flight": return "bg-sky-400/10 text-sky-400";
      case "lodging": return "bg-emerald-400/10 text-emerald-400";
      case "food": return "bg-amber-400/10 text-amber-400";
      case "beach": return "bg-cyan-400/10 text-cyan-400";
      case "sunset": return "bg-orange-400/10 text-orange-400";
      default: return "bg-indigo-400/10 text-indigo-400";
    }
  };

  // calculate debts using auto-balancing
  const calculateSettlement = (): Debt[] => {
    const balances: Record<string, number> = {};
    members.forEach((m) => (balances[m.name] = 0));

    expenses.forEach((exp) => {
      const share = exp.amount / exp.splitWith.length;
      // PaidBy gets the full credit
      if (balances[exp.paidBy] !== undefined) {
        balances[exp.paidBy] += exp.amount;
      }
      // Each person in split gets debited their share
      exp.splitWith.forEach((name) => {
        if (balances[name] !== undefined) {
          balances[name] -= share;
        }
      });
    });

    // Separate debtors and creditors
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, bal]) => {
      if (bal < -0.01) {
        debtors.push({ name, amount: -bal });
      } else if (bal > 0.01) {
        creditors.push({ name, amount: bal });
      }
    });

    const settlements: Debt[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const minAmt = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(minAmt),
      });

      debtor.amount -= minAmt;
      creditor.amount -= minAmt;

      if (debtor.amount < 0.01) dIdx++;
      if (creditor.amount < 0.01) cIdx++;
    }

    return settlements;
  };

  const settlements = calculateSettlement();
  const totalTripCost = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Recharts Pie Chart Data (Breakdown by Category)
  const pieDataMap: Record<string, number> = {};
  expenses.forEach(exp => {
    const cat = exp.category || "other";
    pieDataMap[cat] = (pieDataMap[cat] || 0) + exp.amount;
  });
  const pieData = Object.entries(pieDataMap).map(([name, value]) => ({
    name: categoryLabels[name] || name,
    value,
    color: categoryColors[name] || "#6366f1",
  }));

  // Recharts Bar Chart Data (Payment contribution per member)
  const barDataMap: Record<string, number> = {};
  members.forEach(m => (barDataMap[m.name] = 0));
  expenses.forEach(exp => {
    if (barDataMap[exp.paidBy] !== undefined) {
      barDataMap[exp.paidBy] += exp.amount;
    }
  });
  const barData = Object.entries(barDataMap).map(([name, amount]) => ({
    name,
    "Total Bayar": amount,
  }));

  // If trip not found, redirect to dashboard
  if (tripNotFound) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-[13px] text-[var(--text-mid)] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={simulateFriendAction}
              className="flex items-center gap-1.5 text-[12.5px] border border-indigo-500/30 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 px-3 py-1.5 rounded-lg text-[var(--accent-hover)] hover:text-white transition-colors cursor-pointer"
              title="Simulasikan pembaruan real-time dari teman"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden md:inline">Simulasi Aksi Teman</span>
              <span className="inline md:hidden">Simulasi</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-[12.5px] border border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)] px-3 py-1.5 rounded-lg text-white hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              title="Cetak Rencana Perjalanan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 text-[12.5px] border border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)] px-3 py-1.5 rounded-lg text-white hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Tautan Disalin!" : "Undang Teman"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1080px] mx-auto px-6 py-8">
        {/* Trip Header Card */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[var(--accent-hover)]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-hover)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded">
                {destination}
              </span>
              <h1 className="text-[20px] font-extrabold tracking-tight mt-1.5 text-white">{tripName}</h1>
              <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-mid)] mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dates}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">Total Biaya Bersama</p>
              <p className="text-[18px] font-extrabold text-white mt-1">
                Rp {totalTripCost.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex -space-x-1.5">
              {members.map((m) => (
                <div
                  key={m.name}
                  className={`w-7 h-7 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-white ${m.avatarColor}`}
                  title={m.name}
                >
                  {m.name[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] mb-8">
          {[
            { id: "itinerary", label: "Rencana Perjalanan" },
            { id: "expenses", label: "Bagi Biaya & Anggaran" },
            { id: "collaborators", label: "Anggota Trip" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-[13.5px] font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[var(--accent)] text-white"
                  : "border-transparent text-[var(--text-mid)] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "itinerary" && (
          <div className="grid lg:grid-cols-[200px_1fr] gap-8">
            {/* Days Selection Sidebar */}
            <div className="space-y-1.5">
              {[...Array(daysCount)].map((_, idx) => {
                const d = idx + 1;
                return (
                  <button
                    key={d}
                    onClick={() => setCurrentDay(d)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                      currentDay === d
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-card)] text-[var(--text-mid)] hover:text-white border border-[var(--border)]"
                    }`}
                  >
                    Hari {d}
                  </button>
                );
              })}
            </div>

            {/* Day Itinerary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold">Rencana Hari Ke-{currentDay}</h2>
                <button
                  onClick={() => setShowItineraryModal(true)}
                  className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Aktivitas</span>
                </button>
              </div>

              {/* Daily Budget Summary */}
              {(() => {
                const dayItems = itinerary.filter((item) => item.day === currentDay);
                const dayBudget = dayItems.reduce((sum, item) => sum + (item.estimatedBudget || 0), 0);
                if (dayItems.length > 0) {
                  return (
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                      <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-mid)]">
                        <Receipt className="w-4 h-4 text-indigo-400" />
                        <span>Estimasi Budget Hari {currentDay}</span>
                      </div>
                      <span className="text-[14px] font-bold text-indigo-400">Rp {dayBudget.toLocaleString("id-ID")}</span>
                    </div>
                  );
                }
                return null;
              })()}

              {itinerary.filter((item) => item.day === currentDay).length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-card)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-5 h-5 text-[var(--accent-hover)]" />
                  </div>
                  <p className="text-[13px] font-semibold text-white mb-1">Belum ada rencana untuk hari ini</p>
                  <p className="text-[12px] text-[var(--text-dim)] max-w-[250px] mx-auto">Klik "Tambah Aktivitas" untuk mulai merencanakan tujuan dan estimasi biaya.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {itinerary
                    .filter((item) => item.day === currentDay)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13.5px] font-bold text-white truncate">{item.title}</h4>
                          <p className="text-[11.5px] text-[var(--text-dim)] mt-0.5">
                            Pukul {item.time} · {item.who}
                          </p>
                        </div>
                        {(item.estimatedBudget || 0) > 0 && (
                          <span className="text-[12.5px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg shrink-0">
                            Rp {item.estimatedBudget.toLocaleString("id-ID")}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteItineraryItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-rose-400 transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="space-y-8">
            {/* Top row: Summary stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">Total Biaya</p>
                <p className="text-[18px] font-extrabold text-white mt-1">Rp {totalTripCost.toLocaleString("id-ID")}</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">Total Transaksi</p>
                <p className="text-[18px] font-extrabold text-white mt-1">{expenses.length}</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">Rata-rata / Anggota</p>
                <p className="text-[18px] font-extrabold text-white mt-1">Rp {Math.round(totalTripCost / (members.length || 1)).toLocaleString("id-ID")}</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">Status Tagihan</p>
                <p className={`text-[15px] font-extrabold mt-1.5 ${settlements.length === 0 ? "text-[var(--success)]" : "text-amber-400"}`}>
                  {settlements.length === 0 ? "Seimbang" : `${settlements.length} Perlu Transfer`}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_340px] gap-8">
              {/* Left Column: Expense List & Diagrams */}
              <div className="space-y-8">
                {/* List Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[16px] font-bold">Rincian Pengeluaran</h2>
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pengeluaran</span>
                    </button>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-card)]">
                      <p className="text-[13px] text-[var(--text-mid)]">Belum ada pengeluaran terdaftar.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {expenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="group flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-bold text-white truncate max-w-[150px] sm:max-w-none">{exp.description}</h4>
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                  exp.category === "accommodation" ? "bg-indigo-400/10 text-indigo-400 border border-indigo-400/20" :
                                  exp.category === "food" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                                  exp.category === "transport" ? "bg-sky-400/10 text-sky-400 border border-sky-400/20" :
                                  exp.category === "tickets" ? "bg-rose-400/10 text-rose-400 border border-rose-400/20" :
                                  exp.category === "shopping" ? "bg-pink-500/10 text-pink-500 border border-pink-500/20" :
                                  "bg-slate-400/10 text-slate-400 border border-slate-400/20"
                                }`}>
                                  {categoryLabels[exp.category || "other"]}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-[var(--text-dim)] mt-0.5">
                                Dibayar oleh <span className="font-semibold text-white">{exp.paidBy}</span> · Dibagi ke {exp.splitWith?.length || 0} anggota
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[14px] font-bold text-white">
                              Rp {exp.amount.toLocaleString("id-ID")}
                            </span>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-rose-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recharts Graphical Visualizations */}
                {expenses.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pie Chart Breakdown */}
                    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
                      <h3 className="text-[13px] font-bold text-white mb-4">Kategori Pengeluaran</h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`}
                              contentStyle={{ backgroundColor: "#181c25", borderColor: "#252a36", borderRadius: "8px", color: "#fff" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Custom Legend */}
                      <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-[var(--text-mid)]">
                        {pieData.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="truncate">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bar Chart Breakdown */}
                    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
                      <h3 className="text-[13px] font-bold text-white mb-4">Kontribusi Anggota</h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#5d6272" fontSize={11} tickLine={false} />
                            <YAxis stroke="#5d6272" fontSize={10} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                            <Tooltip
                              formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`}
                              contentStyle={{ backgroundColor: "#181c25", borderColor: "#252a36", borderRadius: "8px", color: "#fff" }}
                            />
                            <Bar dataKey="Total Bayar" fill="#6366f1" radius={[4, 4, 0, 0]}>
                              {barData.map((entry, index) => {
                                const member = members.find(m => m.name === entry.name);
                                const colors: Record<string, string> = {
                                  "bg-indigo-500": "#6366f1",
                                  "bg-sky-500": "#38bdf8",
                                  "bg-amber-500": "#fbbf24",
                                  "bg-rose-500": "#f43f5e",
                                };
                                const fillHex = member ? (colors[member.avatarColor] || "#6366f1") : "#6366f1";
                                return <Cell key={`cell-${index}`} fill={fillHex} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Smart Settlements */}
              <div className="space-y-6">
                <h2 className="text-[16px] font-bold">Rencana Pelunasan</h2>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] space-y-4">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-hover)]" />
                    Petunjuk Transfer
                  </h3>

                  {settlements.length === 0 ? (
                    <div className="flex items-center gap-2.5 text-[13px] text-[var(--success)] bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Semua tagihan sudah seimbang!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {settlements.map((set, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                          <div className="flex justify-between items-center text-[12.5px]">
                            <span className="font-bold text-rose-400">{set.from}</span>
                            <span className="text-[11px] text-[var(--text-dim)]">transfer ke</span>
                            <span className="font-bold text-[var(--success)]">{set.to}</span>
                          </div>
                          <div className="flex justify-between items-center text-[13.5px] pt-1.5 border-t border-[var(--border)] font-mono font-bold text-white">
                            <span>Jumlah</span>
                            <span>Rp {set.amount.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "collaborators" && (
          <div className="max-w-[640px] mx-auto space-y-6">
            <h2 className="text-[16px] font-bold">Anggota Perjalanan</h2>

            {/* Invite Form */}
            <form onSubmit={handleAddMember} className="flex gap-2.5">
              <input
                type="text"
                placeholder="Masukkan nama teman baru..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-4 py-2.5 outline-none transition-all"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Undang</span>
              </button>
            </form>

            {/* Members List */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden divide-y divide-[var(--border)]">
              {members.map((m) => (
                <div key={m.name} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${m.avatarColor} flex items-center justify-center text-[11px] font-bold text-white`}>
                      {m.name[0].toUpperCase()}
                    </div>
                    <span className="text-[13.5px] font-bold text-white">{m.name}</span>
                  </div>
                  <span className="text-[11.5px] text-[var(--success)] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Itinerary Add Modal */}
      {showItineraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowItineraryModal(false)} />
          <div className="relative w-full max-w-[400px] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <h3 className="text-[16px] font-bold mb-4">Tambah Rencana Aktivitas</h3>
            <form onSubmit={handleAddItineraryItem} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Kategori</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                >
                  <option value="other">Lainnya</option>
                  <option value="flight">Penerbangan / Transport</option>
                  <option value="lodging">Hotel / Penginapan</option>
                  <option value="food">Kuliner / Makanan</option>
                  <option value="beach">Pantai / Rekreasi</option>
                  <option value="sunset">Sunset / Kegiatan Sore</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Nama Aktivitas</label>
                <input
                  type="text"
                  placeholder="Contoh: Makan malam di seafood Jimbaran"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Waktu</label>
                  <input
                    type="time"
                    value={newItem.time}
                    onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={newItem.estimatedBudget}
                    onChange={(e) => setNewItem({ ...newItem, estimatedBudget: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Penanggung Jawab</label>
                <select
                  value={newItem.who}
                  onChange={(e) => setNewItem({ ...newItem, who: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                >
                  <option value="Semua">Semua Anggota</option>
                  {members.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
              >
                Simpan Aktivitas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Expense Add Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
          <div className="relative w-full max-w-[400px] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <h3 className="text-[16px] font-bold mb-4">Tambah Catatan Pengeluaran</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Deskripsi Pengeluaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Grab car bandara ke hotel"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Jumlah Biaya (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 150000"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Kategori</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                >
                  <option value="accommodation">🏨 Akomodasi</option>
                  <option value="food">🍔 Makanan / Kuliner</option>
                  <option value="transport">✈️ Transportasi / Bensin</option>
                  <option value="tickets">🎟️ Rekreasi / Tiket Masuk</option>
                  <option value="shopping">🛍️ Belanja / Oleh-oleh</option>
                  <option value="other">📦 Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Dibayar Oleh</label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] text-[13.5px] rounded-lg px-3 py-2 outline-none text-white"
                >
                  {members.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-mid)] mb-1.5">Dibagi Rata Ke</label>
                <div className="space-y-1.5 bg-[var(--bg)] border border-[var(--border)] p-3 rounded-lg max-h-[120px] overflow-y-auto">
                  {members.map(m => (
                    <label key={m.name} className="flex items-center gap-2 text-[13px] text-white">
                      <input
                        type="checkbox"
                        checked={newExpense.splitWith.includes(m.name)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...newExpense.splitWith, m.name]
                            : newExpense.splitWith.filter(name => name !== m.name);
                          setNewExpense({ ...newExpense, splitWith: updated });
                        }}
                        className="rounded accent-[var(--accent)]"
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13.5px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
              >
                Simpan Pengeluaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Collaboration Simulation Toast */}
      {toast?.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[var(--bg-card)] border border-indigo-500/30 p-4 rounded-xl shadow-[0_20px_50px_rgba(99,102,241,0.15)] max-w-[360px] animate-[fadeIn_0.2s_ease-out]">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center text-[var(--accent-hover)] shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
              <span>{toast.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            </h4>
            <p className="text-[11.5px] text-[var(--text-mid)] mt-1 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(prev => prev ? { ...prev, show: false } : null)}
            className="text-[var(--text-dim)] hover:text-white transition-colors text-[10px] uppercase font-bold shrink-0 ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
