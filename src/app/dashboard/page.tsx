"use client";
import {
  Search,
  ShieldAlert,
  Bug,
  Users,
  BellRing,
  BarChart3,
  FileDown,
  KeyRound,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const trend = [
  { day: "Mon", lookups: 22, alerts: 3 },
  { day: "Tue", lookups: 38, alerts: 5 },
  { day: "Wed", lookups: 55, alerts: 8 },
  { day: "Thu", lookups: 47, alerts: 4 },
  { day: "Fri", lookups: 72, alerts: 12 },
  { day: "Sat", lookups: 40, alerts: 6 },
  { day: "Sun", lookups: 61, alerts: 9 },
];

const recent = [
  { email: "target@protonmail.com", time: "2m ago", breaches: 4, infostealer: 5, risk: "high" },
  { email: "john.doe@gmail.com", time: "12m ago", breaches: 2, infostealer: 0, risk: "low" },
  { email: "ops@acme-corp.io", time: "1h ago", breaches: 7, infostealer: 3, risk: "high" },
  { email: "alex.p@outlook.com", time: "3h ago", breaches: 3, infostealer: 1, risk: "medium" },
  { email: "researcher@pm.me", time: "yesterday", breaches: 1, infostealer: 0, risk: "low" },
];

const alerts = [
  { icon: Bug, color: "text-amber-400", title: "New infostealer log exposure", desc: "sarah.j@company.com · RedLine · 2h ago" },
  { icon: ShieldAlert, color: "text-rose-400", title: "New breach detected", desc: "*@acme-corp.io · 3 employees · 6h ago" },
  { icon: Users, color: "text-cyan-400", title: "New account registered", desc: "mike@proton.me · Telegram · 1d ago" },
  { icon: BellRing, color: "text-emerald-400", title: "Monitor backfilled", desc: "14 historical breaches matched for ceo@startup.com" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const onLookup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/lookup?q=${encodeURIComponent(email)}`);
  };

  const card = "panel p-5";
  const stat = (icon: any, label: string, value: string, accent: string) => (
    <div className={card + " card-hover"}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
          <icon.icon className={`w-5 h-5 ${icon.c}`} />
        </div>
        <span className="chip chip-green text-[10px]">Free</span>
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="text-xs text-[var(--muted)] mt-1">{label}</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Welcome back. All features remain unlocked.</p>
        </div>
        <form onSubmit={onLookup} className="flex gap-2">
          <input
            className="input w-72"
            placeholder="Quick lookup: email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary">
            <Search className="w-4 h-4" /> Lookup
          </button>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Search} v="∞" l="Lookups this month" c="text-cyan-400" />
        <Stat icon={BellRing} v="12" l="Active monitors" c="text-emerald-400" />
        <Stat icon={FileDown} v="∞" l="Exports" c="text-violet-400" />
        <Stat icon={KeyRound} v="ON" l="API access" c="text-amber-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold">Lookup activity</h3>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">Last 7 days &middot; no limits applied</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="chip text-[10px]">Lookups</span>
              <span className="chip chip-yellow text-[10px]">Alerts</span>
            </div>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c2230" vertical={false} />
                <XAxis dataKey="day" stroke="#8a92a6" fontSize={11} />
                <YAxis stroke="#8a92a6" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#0f131b",
                    border: "1px solid #1c2230",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="lookups" stroke="#22d3ee" fillOpacity={1} fill="url(#c1)" strokeWidth={2} />
                <Area type="monotone" dataKey="alerts" stroke="#fbbf24" fillOpacity={1} fill="url(#c2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <BellRing className="w-4 h-4 text-cyan-400" /> Live alerts
            </h3>
            <button className="text-xs text-cyan-400 hover:underline">View all</button>
          </div>
          <div className="mt-3 space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-black/30 p-3">
                <a.icon className={`w-4 h-4 ${a.color} mt-0.5`} />
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-[var(--muted)]">{a.desc}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost w-full text-xs">
              <Plus className="w-4 h-4" /> Add monitor
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent lookups
            </h3>
            <Link href="/lookup" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              New lookup <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--muted)]">
                <tr className="text-left">
                  <th className="py-2 pr-3 font-normal">Email</th>
                  <th className="py-2 px-3 font-normal">Breaches</th>
                  <th className="py-2 px-3 font-normal">Infostealer</th>
                  <th className="py-2 px-3 font-normal">Risk</th>
                  <th className="py-2 pl-3 font-normal text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.email} className="border-t border-[var(--border)] hover:bg-white/[0.02]">
                    <td className="py-2 pr-3 mono text-xs">
                      <Link href={`/lookup?q=${encodeURIComponent(r.email)}`} className="hover:text-cyan-400">
                        {r.email}
                      </Link>
                    </td>
                    <td className="py-2 px-3"><span className={r.breaches ? "text-rose-400" : "text-[var(--muted)]"}>{r.breaches}</span></td>
                    <td className="py-2 px-3"><span className={r.infostealer ? "text-amber-400" : "text-[var(--muted)]"}>{r.infostealer}</span></td>
                    <td className="py-2 px-3">
                      <span className={`chip text-[10px] ${r.risk === "high" ? "chip-red" : r.risk === "medium" ? "chip-yellow" : "chip-green"}`}>{r.risk}</span>
                    </td>
                    <td className="py-2 pl-3 text-right text-xs text-[var(--muted)]">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-semibold mb-3">Quick actions</h3>
          <div className="space-y-2">
            <Link href="/lookup" className="btn btn-ghost w-full justify-start">
              <Search className="w-4 h-4" /> New email lookup
            </Link>
            <button className="btn btn-ghost w-full justify-start">
              <Users className="w-4 h-4" /> Invite team member
            </button>
            <button className="btn btn-ghost w-full justify-start">
              <FileDown className="w-4 h-4" /> Bulk import CSV
            </button>
            <Link href="/docs" className="btn btn-ghost w-full justify-start">
              <KeyRound className="w-4 h-4" /> Get API key
            </Link>
          </div>
          <div className="mt-5 rounded-lg border border-cyan-400/20 bg-cyan-500/5 p-3 text-xs text-[var(--muted)]">
            <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Tip
            </div>
            Add your <span className="mono text-white">OPENROUTER_API_KEY</span> in Vercel to enable the AI analyst. Free models work great.
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, v, l, c }: any) {
  return (
    <div className="panel p-5 card-hover">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${c}`} />
        </div>
        <span className="chip chip-green text-[10px]">Unlimited</span>
      </div>
      <div className="mt-3 text-2xl font-bold">{v}</div>
      <div className="text-xs text-[var(--muted)] mt-1">{l}</div>
    </div>
  );
}
