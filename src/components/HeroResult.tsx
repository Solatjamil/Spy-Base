"use client";
import {
  ShieldAlert,
  Bug,
  Clock,
  CheckCircle2,
  ExternalLink,
  Mail,
} from "lucide-react";

export default function HeroResult() {
  const accounts = [
    { name: "GitHub", color: 200 },
    { name: "Google", color: 210 },
    { name: "LinkedIn", color: 220 },
    { name: "Dropbox", color: 0 },
    { name: "Notion", color: 280 },
    { name: "Spotify", color: 140 },
    { name: "X", color: 50 },
    { name: "Adobe", color: 10 },
  ];
  const breaches = [
    { name: "Collection #1", data: "Email, Password", date: "2019-01-17", sev: "High" },
    { name: "LinkedIn 2021", data: "Email, Name, Phone", date: "2021-06-22", sev: "Med" },
    { name: "Dropbox 2012", data: "Email, Hash", date: "2012-07-01", sev: "Med" },
    { name: "Canva 2019", data: "Email, Password, Name", date: "2019-05-24", sev: "Low" },
  ];
  return (
    <div className="panel p-5 floaty relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Email
            </div>
            <div className="mono text-sm">target<span className="text-[var(--muted)]">@</span>protonmail.com</div>
          </div>
        </div>
        <span className="chip chip-green">
          <CheckCircle2 className="w-3 h-3" />
          Resolved
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
        <div className="rounded-lg border border-[var(--border)] bg-black/30 p-3">
          <div className="text-[var(--muted)]">First seen</div>
          <div className="text-white font-semibold mt-1">Nov 12, 2020</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-black/30 p-3">
          <div className="text-[var(--muted)]">Last seen</div>
          <div className="text-white font-semibold mt-1">Jan 1, 2024</div>
        </div>
      </div>
      {/* breaches */}
      <div className="mt-4 rounded-lg border border-[var(--border)] bg-black/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium">Data Breaches</span>
          </div>
          <span className="text-xs text-[var(--muted)]">4 breaches · 3 sources</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {breaches.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    b.sev === "High"
                      ? "w-1.5 h-1.5 rounded-full bg-rose-400"
                      : b.sev === "Med"
                      ? "w-1.5 h-1.5 rounded-full bg-amber-400"
                      : "w-1.5 h-1.5 rounded-full bg-emerald-400"
                  }
                />
                <span className="text-white/90">{b.name}</span>
                <span className="text-[var(--muted)]">· {b.data}</span>
              </div>
              <span className="text-[var(--muted)] mono">{b.date}</span>
            </div>
          ))}
        </div>
        <button className="mt-2 w-full text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 py-1.5 border border-dashed border-cyan-400/20 rounded-md">
          View data breaches <ExternalLink className="w-3 h-3" />
        </button>
      </div>
      {/* infostealer */}
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-black/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Infostealer Logs</span>
          </div>
          <span className="text-xs text-[var(--muted)]">5 results</span>
        </div>
        <div className="text-[11px] text-[var(--muted)] mt-1">
          <span className="chip chip-yellow !py-0.5 !px-1.5 text-[10px]">
            Infostealer detected
          </span>{" "}
          May include cookies, sessions, and autofill data.
        </div>
        <button className="mt-2 w-full text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 py-1.5 border border-dashed border-cyan-400/20 rounded-md">
          View infostealer logs <ExternalLink className="w-3 h-3" />
        </button>
      </div>
      {/* accounts */}
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-black/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">Linked Accounts</span>
          </div>
          <span className="text-xs text-[var(--muted)]">8 platforms</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {accounts.map((a) => (
            <div
              key={a.name}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--panel-2)]"
            >
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  background: `hsl(${a.color},70%,45%)`,
                }}
              >
                {a.name[0]}
              </span>
              {a.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
