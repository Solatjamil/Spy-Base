"use client";
import { Key, Shield, Lock, LogOut, ExternalLink, CheckCircle2, XCircle, Copy, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type KeyStatus = {
  key: string;
  label: string;
  category: string;
  help: string;
  free?: boolean;
  link?: string;
  set: boolean;
  masked: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [keys, setKeys] = useState<KeyStatus[]>([]);
  const [appName, setAppName] = useState("SpyBase");
  const [demo, setDemo] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showHint, setShowHint] = useState(false);

  const load = () => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authed);
        setKeys(d.configured || []);
        setAppName(d.appName);
        setDemo(d.demo);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const r = await fetch("/api/me?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const d = await r.json();
    if (d.ok) {
      setPassword("");
      load();
    } else {
      setLoginError(d.error || "Incorrect password");
    }
  };

  const doLogout = async () => {
    await fetch("/api/me?action=logout", { method: "POST" });
    load();
  };

  const groups: Record<string, KeyStatus[]> = {};
  for (const k of keys) {
    (groups[k.category] ||= []).push(k);
  }

  if (authed === null) {
    return <div className="p-10 text-[var(--muted)]">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Owner access</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Enter the <span className="mono text-white">ADMIN_PASSWORD</span> (or
            SHA-256) you configured in Vercel to view configured secrets & API
            keys status.
          </p>
        </div>
        <form onSubmit={doLogin} className="panel p-6 mt-6 space-y-4">
          <div>
            <label className="text-xs text-[var(--muted)]">Password</label>
            <div className="relative mt-1">
              <input
                type={showHint ? "text" : "password"}
                className="input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if no password is set"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-[var(--muted)] hover:text-white"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {loginError && <div className="text-xs text-rose-400">{loginError}</div>}
          <button className="btn btn-primary w-full" type="submit">
            Unlock
          </button>
          <p className="text-[11px] text-[var(--muted)]">
            If no ADMIN_PASSWORD env var is set (default), leave the field blank
            and click Unlock.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Key className="w-7 h-7 text-cyan-400" /> Secrets & API keys
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage these keys in Vercel → Settings → Environment Variables.
            Masked values show which keys are live; no secrets are exposed to
            the browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip chip-green"><Shield className="w-3 h-3" /> Owner unlocked</span>
          <button className="btn btn-ghost text-xs" onClick={doLogout}>
            <LogOut className="w-3 h-3" /> Lock
          </button>
        </div>
      </div>

      <div className="panel p-5 mt-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <div className="text-xs text-[var(--muted)]">App name</div>
          <div className="text-lg font-semibold">{appName}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`chip ${demo ? "chip-yellow" : "chip-gray"} text-[11px]`}>
            Demo mode: {demo ? "ON" : "off"}
          </span>
          <span className="chip chip-green text-[11px]">
            {keys.filter((k) => k.set).length} / {keys.length} keys configured
          </span>
        </div>
      </div>

      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat} className="mt-8">
          <h2 className="text-sm uppercase tracking-widest text-[var(--muted)] mb-3">{cat}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {items.map((k) => (
              <div key={k.key} className={`panel p-4 ${k.set ? "border-emerald-400/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-sm font-semibold text-white break-all">{k.key}</span>
                      {k.free && <span className="chip chip-green text-[10px]">Free tier</span>}
                    </div>
                    <div className="text-sm text-[var(--muted)] mt-1">{k.help}</div>
                    {k.link && (
                      <a href={k.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-2">
                        Get key <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {k.set ? (
                      <>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Set
                        </div>
                        <div className="mono text-[11px] text-[var(--muted)] mt-1">{k.masked}</div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-[var(--muted)] text-xs">
                        <XCircle className="w-4 h-4" /> Missing
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="panel p-5 mt-8">
        <h3 className="font-semibold flex items-center gap-2">
          <Copy className="w-4 h-4 text-cyan-400" /> Quick Vercel setup
        </h3>
        <ol className="mt-3 text-sm text-[var(--muted)] list-decimal pl-5 space-y-2">
          <li>Go to Vercel → Your project → Settings → Environment Variables.</li>
          <li>Add any keys you want — every source is optional; missing ones are skipped gracefully.</li>
          <li>For AI image analysis, set <span className="mono text-white">OPENROUTER_API_KEY</span> (free models work).</li>
          <li>For strongest reverse face search, add <span className="mono text-white">SERPAPI_KEY</span> (SerpAPI Google Lens has a free tier of 100 searches/month).</li>
          <li>Set <span className="mono text-white">ADMIN_PASSWORD</span> so only you can open this settings page.</li>
          <li>Redeploy for the new env vars to take effect.</li>
        </ol>
      </div>
    </div>
  );
}
