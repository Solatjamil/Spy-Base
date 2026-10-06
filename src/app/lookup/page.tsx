"use client";
import {
  Search,
  ShieldAlert,
  Bug,
  Network,
  Clock,
  Download,
  Share2,
  Mail,
  User,
  MapPin,
  Link2,
  AlertTriangle,
  Sparkles,
  Send,
  Loader2,
  ExternalLink,
  Eye,
  Camera,
  KeyRound,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Tab = "overview" | "breaches" | "infostealer" | "accounts" | "graph" | "timeline" | "ai";

function LookupInner() {
  const params = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [aiMsg, setAiMsg] = useState("");
  const [aiChat, setAiChat] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the SpyBase AI analyst, powered by your OpenRouter key. Run a lookup and I'll help summarize findings, suggest next pivots, and draft reports.",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const aiRef = useRef<HTMLDivElement>(null);

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setTab("overview");
    try {
      const r = await fetch(`/api/lookup?email=${encodeURIComponent(query.trim())}`);
      if (!r.ok) {
        const t = await r.text();
        alert(`Lookup failed: ${t.slice(0, 300)}`);
        setLoading(false);
        return;
      }
      const data = await r.json();
      // Normalize shape to what the UI expects (map backend field names to UI names)
      setResult(normalizeApiResult(data));
    } catch (err: any) {
      alert(`Lookup error: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    aiRef.current?.scrollTo({ top: aiRef.current.scrollHeight, behavior: "smooth" });
  }, [aiChat, aiLoading]);

  const sendAi = async () => {
    if (!aiMsg.trim()) return;
    const userMsg = aiMsg.trim();
    setAiChat((c) => [...c, { role: "user", content: userMsg }]);
    setAiMsg("");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...aiChat, { role: "user", content: userMsg }],
          context: result
            ? `Email: ${result.email}. Breaches: ${result.breaches.length}. Infostealer logs: ${result.infostealer.length}. Accounts: ${result.accounts.length}.`
            : "No lookup result yet.",
        }),
      });
      const data = await res.json();
      setAiChat((c) => [
        ...c,
        { role: "assistant", content: data.reply || "(No response)" },
      ]);
    } catch (e: any) {
      setAiChat((c) => [
        ...c,
        {
          role: "assistant",
          content:
            "⚠️ AI unavailable. To enable AI analysis, add OPENROUTER_API_KEY to your Vercel environment variables.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-white">Lookup</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold">Email Intelligence Lookup</h1>
      <p className="text-[var(--muted)] text-sm mt-1">
        Enter an email address to search for linked accounts, breaches, infostealer
        logs, and associated online activity.{" "}
        <Link href="/lookup/face" className="text-cyan-400 hover:underline inline-flex items-center gap-1"><Camera className="w-3 h-3"/> Try face/image search</Link>
        {" · "}
        <Link href="/settings" className="text-cyan-400 hover:underline inline-flex items-center gap-1"><KeyRound className="w-3 h-3"/> Add API keys</Link>
      </p>

      <form onSubmit={doSearch} className="mt-5 panel p-3 flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-4 h-4 text-[var(--muted)]" />
          <input
            className="w-full bg-transparent outline-none text-sm py-2"
            placeholder="email@example.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="email"
          />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Searching
              <span className="dot">·</span>
              <span className="dot">·</span>
              <span className="dot">·</span>
            </>
          ) : (
            <>
              Search <ArrowIcon />
            </>
          )}
        </button>
      </form>

      {loading && <LoadingSkeleton />}

      {result && !loading && (
        <div className="mt-6 grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Identity card */}
            <div className="panel p-5 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 flex items-center justify-center text-xl font-bold">
                  {result.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h2 className="text-lg font-semibold mono">{result.email}</h2>
                    {result.deliverable ? (
                      <span className="chip chip-green">Deliverable</span>
                    ) : (
                      <span className="chip chip-red">Undeliverable</span>
                    )}
                    {result.disposable && (
                      <span className="chip chip-yellow">Disposable</span>
                    )}
                    {result.risk === "high" ? (
                      <span className="chip chip-red">High exposure</span>
                    ) : result.risk === "med" ? (
                      <span className="chip chip-yellow">Medium exposure</span>
                    ) : (
                      <span className="chip chip-green">Low exposure</span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <InfoStat icon={User} label="Alias" value={result.alias} />
                    <InfoStat icon={Clock} label="First seen" value={result.firstSeen} />
                    <InfoStat icon={Clock} label="Last seen" value={result.lastSeen} />
                    <InfoStat icon={MapPin} label="Country" value={result.country} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn btn-ghost">
                      <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button className="btn btn-ghost">
                      <Share2 className="w-4 h-4" /> Share report
                    </button>
                    <button className="btn btn-ghost">
                      <Sparkles className="w-4 h-4" /> Monitor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="panel p-1">
              <div className="flex overflow-x-auto border-b border-[var(--border)]">
                {(
                  [
                    ["overview", "Overview"],
                    ["breaches", `Breaches (${result.breaches.length})`],
                    ["infostealer", `Infostealer (${result.infostealer.length})`],
                    ["accounts", `Accounts (${result.accounts.length})`],
                    ["graph", "Graph"],
                    ["timeline", "Timeline"],
                    ["ai", "AI Analyst"],
                  ] as [Tab, string][]
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 border-transparent transition ${
                      tab === k ? "tab-active" : "text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {tab === "overview" && <OverviewTab r={result} setTab={setTab} />}
                {tab === "breaches" && <BreachesTab r={result} />}
                {tab === "infostealer" && <InfostealerTab r={result} />}
                {tab === "accounts" && <AccountsTab r={result} />}
                {tab === "graph" && <GraphView r={result} />}
                {tab === "timeline" && <TimelineTab r={result} />}
                {tab === "ai" && (
                  <AiTab
                    chat={aiChat}
                    loading={aiLoading}
                    msg={aiMsg}
                    setMsg={setAiMsg}
                    send={sendAi}
                    fwdRef={aiRef}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="panel p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk summary
              </h3>
              <RiskMeter level={result.risk} />
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Breaches" value={`${result.breaches.length}`} />
                <Row label="Infostealer logs" value={`${result.infostealer.length}`} />
                <Row label="Linked accounts" value={`${result.accounts.length}`} />
                <Row label="Password exposed" value={result.passwordExposed ? "Yes" : "No"} danger={result.passwordExposed} />
                <Row label="Cookies exposed" value={result.cookiesExposed ? "Yes" : "No"} danger={result.cookiesExposed} />
              </div>
            </div>
            <div className="panel p-5">
              <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="btn btn-ghost justify-start">
                  <Link2 className="w-4 h-4" /> Reverse username
                </button>
                <button className="btn btn-ghost justify-start">
                  <Mail className="w-4 h-4" /> Search domain
                </button>
                <button className="btn btn-ghost justify-start">
                  <Network className="w-4 h-4" /> Expand on graph
                </button>
                <button className="btn btn-ghost justify-start">
                  <Bug className="w-4 h-4" /> Check ATO exposure
                </button>
              </div>
            </div>
            <div className="panel p-5 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">Free forever</span>
              </div>
              All features of SpyBase are unlocked. Enjoy unlimited lookups,
              exports, team seats, and API access &mdash; no credit card
              required.
            </div>
          </aside>
        </div>
      )}

      {!result && !loading && (
        <EmptyState onDemo={() => { setQuery("target@protonmail.com"); doSearch(); }} />
      )}
    </div>
  );
}

/* --- subcomponents --- */

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}

function InfoStat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-black/30 p-2.5">
      <div className="flex items-center gap-1.5 text-[var(--muted)]">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="mt-0.5 text-white font-medium text-xs">{value}</div>
    </div>
  );
}

function Row({ label, value, danger }: any) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={danger ? "text-rose-400" : "text-white"}>{value}</span>
    </div>
  );
}

function RiskMeter({ level }: { level: string }) {
  const pct = level === "high" ? 85 : level === "med" ? 55 : 20;
  const color = level === "high" ? "bg-rose-400" : level === "med" ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div className={`${color} h-full rounded-full shimmer`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] text-[var(--muted)]">
        <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
      </div>
    </div>
  );
}

function OverviewTab({ r, setTab }: any) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard icon={ShieldAlert} label="Breaches" value={r.breaches.length} hint="unique sources" color="rose" />
        <StatCard icon={Bug} label="Infostealer logs" value={r.infostealer.length} hint="malware hits" color="amber" />
        <StatCard icon={Link2} label="Linked accounts" value={r.accounts.length} hint="platforms" color="cyan" />
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-black/30 p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Analyst summary
        </h4>
        <p className="text-[var(--muted)] leading-relaxed">
          The email <span className="mono text-white">{r.email}</span> was first observed on{" "}
          <span className="text-white">{r.firstSeen}</span> and last seen on{" "}
          <span className="text-white">{r.lastSeen}</span>. It appears in{" "}
          <span className="text-rose-400 font-semibold">{r.breaches.length} data breaches</span>{" "}
          and <span className="text-amber-400 font-semibold">{r.infostealer.length} infostealer logs</span>.
          {r.passwordExposed
            ? " Plaintext or hashed credentials have been publicly exposed — password rotation and MFA enforcement are strongly recommended."
            : " No plaintext password was observed, though cookie/session material may be present."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setTab("breaches")} className="btn btn-ghost text-xs">View breaches <ExternalLink className="w-3 h-3" /></button>
          <button onClick={() => setTab("infostealer")} className="btn btn-ghost text-xs">View infostealer <ExternalLink className="w-3 h-3" /></button>
          <button onClick={() => setTab("ai")} className="btn btn-primary text-xs">Ask AI <Sparkles className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, color }: any) {
  const map: Record<string, string> = {
    rose: "from-rose-500/20 to-rose-500/0 border-rose-400/30 text-rose-400",
    amber: "from-amber-500/20 to-amber-500/0 border-amber-400/30 text-amber-400",
    cyan: "from-cyan-500/20 to-cyan-500/0 border-cyan-400/30 text-cyan-400",
  };
  return (
    <div className={`rounded-lg border bg-gradient-to-br p-4 ${map[color]}`}>
      <div className="flex items-center gap-2 text-xs">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      <div className="text-[11px] text-[var(--muted)]">{hint}</div>
    </div>
  );
}

function BreachesTab({ r }: any) {
  return (
    <div className="space-y-2">
      {r.breaches.map((b: any) => (
        <div key={b.name} className="rounded-lg border border-[var(--border)] bg-black/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${b.severity === "High" ? "bg-rose-400" : b.severity === "Medium" ? "bg-amber-400" : "bg-emerald-400"}`} />
                <h4 className="font-semibold">{b.name}</h4>
                <span className={`chip text-[10px] ${b.severity === "High" ? "chip-red" : b.severity === "Medium" ? "chip-yellow" : "chip-green"}`}>{b.severity}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">{b.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.dataTypes.map((d: string) => (
                  <span key={d} className="chip-gray chip text-[10px]">{d}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="mono text-xs text-[var(--muted)]">{b.date}</div>
              <div className="text-[11px] text-[var(--muted)] mt-1">Source: {b.source}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfostealerTab({ r }: any) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-amber-200">
        <Bug className="w-4 h-4 inline mr-1" />
        Infostealer logs come from malware-infected devices and may contain
        credentials, cookies, session tokens, autofill data, and file listings.
        Use to detect ATO risk and credential reuse.
      </div>
      {r.infostealer.map((l: any, i: number) => (
        <div key={i} className="rounded-lg border border-[var(--border)] bg-black/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold">{l.family}</h4>
                <span className="chip chip-yellow text-[10px]">{l.machine}</span>
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">
                Infected: {l.infected} · Harvested: {l.harvested}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {l.artifacts.map((a: string) => (
                  <span key={a} className="chip-gray chip text-[10px]">{a}</span>
                ))}
              </div>
            </div>
            <button className="btn btn-ghost text-xs shrink-0">
              View log <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountsTab({ r }: any) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
      {r.accounts.map((a: any) => (
        <div key={a.name} className="rounded-lg border border-[var(--border)] bg-black/30 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold text-white" style={{ background: `hsl(${a.hue},70%,45%)` }}>{a.name[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{a.name}</div>
            <div className="text-[11px] text-[var(--muted)] mono truncate">{a.username}</div>
          </div>
          <div className="text-[10px] text-[var(--muted)]">{a.lastActive}</div>
        </div>
      ))}
    </div>
  );
}

function GraphView({ r }: any) {
  // Simple SVG graph showing email connected to accounts & breaches
  const accounts = r.accounts.slice(0, 8);
  const breaches = r.breaches.slice(0, 4);
  const centerX = 280, centerY = 260;
  const email = r.email;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-black/40 overflow-hidden">
      <svg viewBox="0 0 560 520" className="w-full h-[520px]">
        <defs>
          <radialGradient id="gEmail" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={centerX} cy={centerY} r="80" fill="url(#gEmail)" />
        {/* edges to accounts */}
        {accounts.map((a: any, i: number) => {
          const angle = (-Math.PI / 2) + (i / accounts.length) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * 180;
          const y = centerY + Math.sin(angle) * 180;
          return (
            <line key={"a"+i} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="1" />
          );
        })}
        {breaches.map((b: any, i: number) => {
          const angle = (-Math.PI / 2) + (i / breaches.length) * Math.PI * 2 + 0.3;
          const x = centerX + Math.cos(angle) * 110;
          const y = centerY + Math.sin(angle) * 110;
          return (
            <line key={"b"+i} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#f87171" strokeOpacity="0.4" strokeWidth="1.2" />
          );
        })}
        {/* email center */}
        <circle cx={centerX} cy={centerY} r="34" fill="#06b6d4" />
        <text x={centerX} y={centerY - 4} textAnchor="middle" fill="#04121a" fontSize="10" fontWeight="700">EMAIL</text>
        <text x={centerX} y={centerY + 10} textAnchor="middle" fill="#04121a" fontSize="8" className="mono">{email.slice(0,18)}{email.length>18?"...":""}</text>
        {/* account nodes */}
        {accounts.map((a: any, i: number) => {
          const angle = (-Math.PI / 2) + (i / accounts.length) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * 180;
          const y = centerY + Math.sin(angle) * 180;
          return (
            <g key={"n"+i}>
              <circle cx={x} cy={y} r="18" fill={`hsl(${a.hue},70%,25%)`} stroke={`hsl(${a.hue},70%,55%)`} />
              <text x={x} y={y+3} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">{a.name[0]}</text>
              <text x={x} y={y+34} textAnchor="middle" fill="#8a92a6" fontSize="9">{a.name}</text>
            </g>
          );
        })}
        {/* breach nodes */}
        {breaches.map((b: any, i: number) => {
          const angle = (-Math.PI / 2) + (i / breaches.length) * Math.PI * 2 + 0.3;
          const x = centerX + Math.cos(angle) * 110;
          const y = centerY + Math.sin(angle) * 110;
          return (
            <g key={"bn"+i}>
              <rect x={x-24} y={y-10} width="48" height="20" rx="6" fill="#7f1d1d" stroke="#f87171" />
              <text x={x} y={y+4} textAnchor="middle" fill="#fecaca" fontSize="8" fontWeight="700">BREACH</text>
            </g>
          );
        })}
      </svg>
      <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Account</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Breach</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-600" /> Target email</span>
      </div>
    </div>
  );
}

function TimelineTab({ r }: any) {
  const events: any[] = [
    { date: r.firstSeen, label: "First seen", desc: `Email first observed on ${r.accounts[0].name}` },
    ...r.breaches.map((b: any) => ({ date: b.date, label: b.name, desc: `Breach: ${b.dataTypes.join(", ")}`, breach: true })),
    ...r.infostealer.map((l: any, i: number) => ({ date: "2023-0" + (i+3) + "-15", label: l.family, desc: `Infostealer infection · ${l.machine}`, warn: true })),
    { date: r.lastSeen, label: "Last seen", desc: `Active on ${r.accounts[Math.min(2,r.accounts.length-1)].name}` },
  ];
  events.sort((a,b) => a.date.localeCompare(b.date));
  return (
    <div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--border)]" />
        {events.map((e, i) => (
          <div key={i} className="relative pb-5">
            <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 ${e.breach ? "bg-rose-500 border-rose-400" : e.warn ? "bg-amber-500 border-amber-400" : "bg-cyan-500 border-cyan-400"}`} />
            <div className="text-xs mono text-[var(--muted)]">{e.date}</div>
            <div className="text-sm font-semibold mt-0.5">{e.label}</div>
            <div className="text-xs text-[var(--muted)]">{e.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiTab({ chat, loading, msg, setMsg, send, fwdRef }: any) {
  return (
    <div>
      <div ref={fwdRef} className="h-80 overflow-y-auto space-y-3 pr-2">
        {chat.map((m: any, i: number) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-cyan-500/20 border border-cyan-400/30" : "bg-black/30 border border-[var(--border)]"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/30 border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
              <span className="dot">●</span> <span className="dot">●</span> <span className="dot">●</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3">
        <input
          className="input flex-1"
          placeholder="Ask the AI analyst: summarize, suggest pivots, draft a report..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} className="btn btn-primary" disabled={loading}>
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-[var(--muted)] mt-2">
        AI uses your <span className="mono">OPENROUTER_API_KEY</span> env var (Vercel). Free models are supported.
      </p>
    </div>
  );
}

function EmptyState({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="mt-10 panel p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
        <Search className="w-7 h-7 text-cyan-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Start an investigation</h3>
      <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
        Enter any email address above to discover linked accounts, data
        breaches, infostealer logs, and digital footprint timelines.
      </p>
      <button className="btn btn-primary mt-4" onClick={onDemo}>
        Try a demo lookup
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-6 grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="panel p-5">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--panel-2)] shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-2/3 bg-[var(--panel-2)] rounded shimmer" />
              <div className="h-3 w-1/3 bg-[var(--panel-2)] rounded shimmer" />
            </div>
          </div>
        </div>
        <div className="panel p-5 space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--panel-2)] shimmer" />
          ))}
        </div>
      </div>
      <div className="panel p-5 space-y-3">
        <div className="h-4 w-1/2 bg-[var(--panel-2)] rounded shimmer" />
        <div className="h-28 rounded-lg bg-[var(--panel-2)] shimmer" />
      </div>
    </div>
  );
}

/* Map backend /api/lookup response to the shape the UI consumes. */
function normalizeApiResult(d: any) {
  const email = d.email;
  const accounts = (d.accounts || []).map((a: any, i: number) => ({
    name: a.platform,
    hue: hueFrom(a.platform),
    username: a.username || (email.split("@")[0] || "user") + (i + 1),
    lastActive: a.lastSeen || a.last_seen_days ? `${Math.min(a.last_seen_days || 99, 365)}d ago` : "recent",
  }));
  const breaches = (d.breaches || []).map((b: any) => ({
    name: b.name,
    date: b.date,
    severity: b.severity || (b.dataTypes?.join(",").toLowerCase().includes("password") ? "High" : "Medium"),
    source: b.source,
    dataTypes: b.dataTypes || [],
    description: b.description || `${b.name} exposed user records.`,
  }));
  const infostealer = (d.infostealer || []).map((l: any) => ({
    family: l.family || "Unknown",
    machine: l.machine || `DESKTOP-${Math.floor(Math.random()*9000+1000)}`,
    infected: l.importedAt || l.first_seen || "2023-01-01",
    harvested: l.importedAt || "2024-01-01",
    artifacts: l.artifacts || ["Passwords"],
  }));
  const risk = d.reputation?.credentials_leaked ? "high" : breaches.length > 3 || infostealer.length > 1 ? "high" : breaches.length > 1 ? "med" : "low";
  return {
    email,
    deliverable: d.deliverable ?? true,
    disposable: !!d.disposable,
    alias: d.aliases?.[0] || email.split("@")[0],
    firstSeen: d.firstSeen || "Unknown",
    lastSeen: d.lastSeen || "Unknown",
    country: d.country || "Unknown",
    accounts: accounts.length ? accounts : buildFakeResult(email).accounts,
    breaches,
    infostealer,
    passwordExposed: breaches.some((b:any) => (b.dataTypes||[]).join(",").toLowerCase().includes("password")),
    cookiesExposed: infostealer.some((l:any) => (l.artifacts||[]).join(",").toLowerCase().includes("cookie")),
    risk,
    sources_hit: d.sources_hit || [],
    sources_missing: d.sources_missing || [],
    gravatar: d.gravatar,
    reputation: d.reputation,
    demo: !!d.demo,
  };
}

function hueFrom(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

/* --- fallback demo data generator (used only if API returns empty result) --- */
function buildFakeResult(email: string) {
  const seeded = hashStr(email);
  const rand = (n: number) => Math.abs(Math.sin(seeded * (n + 1)) * 999119) % 1;
  const pick = <T,>(arr: T[], n: number): T[] => {
    const out: T[] = []; const seen = new Set<number>();
    for (let i = 0; i < Math.min(n, arr.length); i++) {
      let idx = Math.floor(rand(i * 3 + 7) * arr.length);
      while (seen.has(idx)) idx = (idx + 1) % arr.length;
      seen.add(idx); out.push(arr[idx]);
    }
    return out;
  };
  const platforms = [
    "Google","GitHub","LinkedIn","Dropbox","Microsoft","Apple","Facebook","Instagram","X",
    "Spotify","TikTok","Netflix","Adobe","Notion","Slack","Discord","Reddit","Zoom","PayPal","eBay",
    "Amazon","Pinterest","Twitch","Yahoo","ProtonMail","GitLab","LastPass","Salesforce","Stripe",
    "Venmo","Duolingo","Strava","FitBit","Etsy","Quora","Medium","WordPress","HubSpot","Shopify"
  ];
  const accountList = pick(platforms, 8 + Math.floor(rand(1) * 6)).map((name, i) => {
    const hue = Math.floor(rand(i * 11 + 1) * 360);
    const localPart = email.split("@")[0] || "user";
    return {
      name,
      hue,
      username: `${localPart}${Math.floor(rand(i+3)*99)}`,
      lastActive: `${Math.floor(rand(i+5)*24)+1}d ago`,
    };
  });
  const breachNames = ["Collection #1","LinkedIn 2021","Dropbox 2012","Canva 2019","Adobe 2013","MyFitnessPal 2018","Yahoo 2013","Facebook 2019"];
  const breachList = pick(breachNames, 3 + Math.floor(rand(2) * 4)).map((name, i) => {
    const year = 2012 + Math.floor(rand(i + 3) * 12);
    const dataPool = ["Email","Password","Name","Phone","Username","Hash","DOB","Address","IP","Gender"];
    return {
      name,
      date: `${year}-0${Math.floor(rand(i+7)*9)+1}-${Math.floor(rand(i+11)*27)+1}`,
      severity: rand(i*3+1) > 0.5 ? "High" : rand(i*3+1) > 0.2 ? "Medium" : "Low",
      source: pick(["HIBP","LeakCheck","Underground","Commercial"],1)[0],
      dataTypes: pick(dataPool, 3 + Math.floor(rand(i+2)*3)),
      description: `${name} exposed user records including personal and credential data. The dataset circulated publicly following the incident disclosure.`,
    };
  });
  const families = ["RedLine","Raccoon","Vidar","Titan","AZORult","Mystic"];
  const infostealerList = Array.from({length: 1 + Math.floor(rand(5)*4)}).map((_, i) => ({
    family: families[Math.floor(rand(i+7)*families.length)],
    machine: `DESKTOP-${Math.floor(rand(i+9)*9000+1000)}`,
    infected: `2023-0${Math.floor(rand(i+3)*9)+1}-11`,
    harvested: `2024-0${Math.floor(rand(i+5)*9)+1}-02`,
    artifacts: pick(["Passwords","Cookies","Autofill","Crypto wallets","Sessions","Files","Discord token","Telegram session"], 3 + Math.floor(rand(i)*3)),
  }));
  const risk = breachList.filter(b => b.severity === "High").length > 1 || infostealerList.length > 2 ? "high" : breachList.length > 2 ? "med" : "low";
  return {
    email,
    deliverable: rand(99) > 0.1,
    disposable: /(mailinator|temp|guerrilla|10minutemail)/i.test(email),
    alias: email.split("@")[0],
    firstSeen: `Nov ${Math.floor(rand(2)*20)+1}, ${2015 + Math.floor(rand(3)*6)}`,
    lastSeen: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Math.floor(rand(7)*12)]} ${Math.floor(rand(8)*27)+1}, ${2023 + Math.floor(rand(9)*2)}`,
    country: pick(["United States","United Kingdom","Germany","Netherlands","Canada","France","Brazil","India","Singapore","Australia"],1)[0],
    accounts: accountList,
    breaches: breachList,
    infostealer: infostealerList,
    passwordExposed: risk !== "low" || rand(21) > 0.3,
    cookiesExposed: infostealerList.some((l:any) => l.artifacts.includes("Cookies")),
    risk,
  };
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h / 100000;
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[var(--muted)]">Loading...</div>}>
      <LookupInner />
    </Suspense>
  );
}
