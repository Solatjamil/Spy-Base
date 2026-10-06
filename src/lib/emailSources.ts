/**
 * Aggregate email intelligence from every configured provider.
 *
 * Every provider call is non-fatal: if a key is missing or a call fails, we
 * simply omit that source and continue. Add any subset of the env vars in
 * src/lib/config.ts — the UI will show badges for which sources fired.
 */
import { cfg, cfgBool, isDemo, hasAny } from "./config";

export type BreachHit = {
  source: string;
  name: string;
  date?: string;
  dataTypes: string[];
  severity?: "low" | "medium" | "high";
  description?: string;
};

export type InfostealerHit = {
  source: string;
  family?: string;
  artifacts: string[];
  importedAt?: string;
  url?: string;
};

export type AccountHit = {
  platform: string;
  url?: string;
  username?: string;
  firstSeen?: string;
  lastSeen?: string;
  source: string;
};

export type EmailReport = {
  email: string;
  deliverable?: boolean;
  disposable?: boolean;
  exists?: boolean;
  firstSeen?: string;
  lastSeen?: string;
  aliases?: string[];
  country?: string;
  sources_hit: string[];
  sources_missing: string[];
  gravatar?: {
    found: boolean;
    hash: string;
    profileUrl?: string;
    avatarUrl?: string;
    displayName?: string;
    about?: string;
  };
  accounts: AccountHit[];
  breaches: BreachHit[];
  infostealer: InfostealerHit[];
  reputation?: {
    score?: number;
    suspicious?: boolean;
    credentials_leaked?: boolean;
    data_breach?: boolean;
    summary?: string;
  };
  hunter?: any;
  intelx?: any;
  profiles_found?: { network: string; url: string; username?: string }[];
  raw?: Record<string, any>;
  demo?: boolean;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function buildEmailReport(email: string): Promise<EmailReport> {
  if (!EMAIL_RE.test(email)) {
    throw new Error("Invalid email address");
  }

  const demo = isDemo();

  const report: EmailReport = {
    email,
    sources_hit: [],
    sources_missing: [],
    accounts: [],
    breaches: [],
    infostealer: [],
    aliases: [],
  };

  if (demo) {
    return { ...fallbackMock(email), demo: true, sources_hit: ["demo"], sources_missing: [] };
  }

  // --- Gravatar (always free, no key) ---
  if (cfgBool("GRAVATAR_ENABLED") || cfg("GRAVATAR_ENABLED") !== "0") {
    try {
      const hash = await sha256(email.trim().toLowerCase());
      const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
      const profileUrl = `https://www.gravatar.com/${hash}`;
      // Peek profile via gravatar's JSON endpoint
      const profile = await safeFetch(`https://www.gravatar.com/${hash}.json`, {
        headers: { "User-Agent": "SpyBase/1.0" },
      });
      let found = false;
      let displayName: string | undefined;
      let about: string | undefined;
      if (profile.ok) {
        try {
          const j = await profile.json();
          const entry = j?.entry?.[0];
          if (entry) {
            found = true;
            displayName = entry.displayName || entry.preferredUsername;
            about = entry.aboutMe;
            if (entry.name?.givenName || entry.name?.familyName) {
              report.aliases?.push(
                [entry.name.givenName, entry.name.familyName].filter(Boolean).join(" ")
              );
            }
            (entry.accounts || []).forEach((a: any) => {
              if (a.shortname && a.url) {
                report.accounts.push({
                  platform: a.shortname,
                  url: a.url,
                  username: a.username,
                  source: "gravatar",
                });
              }
            });
            if (entry.profileUrl) report.aliases?.push(entry.profileUrl);
          }
        } catch {}
      }
      // Image probe as secondary confirm
      const img = await safeFetch(avatarUrl, { method: "HEAD" });
      if (img.ok) found = true;
      report.gravatar = { found, hash, profileUrl, avatarUrl: found ? avatarUrl : undefined, displayName, about };
      report.sources_hit.push("gravatar");
    } catch (e) {
      report.sources_missing.push("gravatar");
    }
  }

  // --- HaveIBeenPwned ---
  try {
    const headers: Record<string, string> = {
      "User-Agent": "SpyBase/1.0",
    };
    if (cfg("HIBP_API_KEY")) headers["hibp-api-key"] = cfg("HIBP_API_KEY")!;
    const useHibp = cfg("HIBP_API_KEY") || cfgBool("HIBP_NO_KEY");
    if (useHibp) {
      const res = await safeFetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(
          email
        )}?truncateResponse=false`,
        { headers }
      );
      if (res.ok) {
        const data: any[] = await res.json();
        for (const b of data) {
          report.breaches.push({
            source: "HIBP",
            name: b.Name,
            date: b.BreachDate?.slice(0, 10),
            dataTypes: b.DataClasses || [],
            severity: hibpSeverity(b.DataClasses || []),
            description: b.Description?.replace(/<[^>]+>/g, "").slice(0, 200),
          });
        }
        report.sources_hit.push("HIBP");
      } else if (res.status === 404) {
        report.sources_hit.push("HIBP"); // 404 = no breaches
      } else {
        report.sources_missing.push("HIBP");
      }
    } else {
      report.sources_missing.push("HIBP");
    }
  } catch {
    report.sources_missing.push("HIBP");
  }

  // --- LeakCheck ---
  if (cfg("LEAKCHECK_API_KEY")) {
    try {
      const keyType = cfg("LEAKCHECK_KEY_TYPE") || "key";
      const res = await safeFetch(
        `https://leakcheck.net/api?key=${encodeURIComponent(
          cfg("LEAKCHECK_API_KEY")!
        )}&type=${keyType}&check=${encodeURIComponent(email)}`
      );
      if (res.ok) {
        const j = await res.json();
        if (j.success && Array.isArray(j.result)) {
          for (const r of j.result) {
            if (r.source?.toLowerCase().includes("stealer") || r.source?.toLowerCase().includes("redline") || r.source?.toLowerCase().includes("raccoon") || r.source?.toLowerCase().includes("vidar")) {
              report.infostealer.push({
                source: "LeakCheck",
                family: guessFamily(r.source),
                artifacts: r.line?.split(":").length > 2 ? ["credentials"] : [],
                importedAt: r.uploaded || r.last_breach,
              });
            }
            report.breaches.push({
              source: "LeakCheck",
              name: r.source,
              date: r.uploaded?.slice(0, 10) || r.last_breach?.slice(0, 10),
              dataTypes: r.line ? inferFields(r.line) : ["credentials"],
              severity: "high",
            });
          }
          report.sources_hit.push("LeakCheck");
        } else {
          report.sources_missing.push("LeakCheck");
        }
      } else {
        report.sources_missing.push("LeakCheck");
      }
    } catch {
      report.sources_missing.push("LeakCheck");
    }
  } else {
    report.sources_missing.push("LeakCheck");
  }

  // --- Leak-Checks / LeaksAPI ---
  if (cfg("LEAKCHECKIO_API_KEY")) {
    try {
      const res = await safeFetch(
        `https://leakcheck.io/api/v2/query/${encodeURIComponent(email)}`,
        { headers: { "X-API-Key": cfg("LEAKCHECKIO_API_KEY")! } }
      );
      if (res.ok) {
        const j = await res.json();
        if (j.found && Array.isArray(j.result)) {
          for (const r of j.result) {
            report.breaches.push({
              source: "LeakChecks.io",
              name: r.source,
              date: r.last_breach,
              dataTypes: r.tags || inferFields(r.password ? ":" + r.password : ""),
              severity: "high",
            });
          }
          report.sources_hit.push("LeakChecks.io");
        } else {
          report.sources_missing.push("LeakChecks.io");
        }
      } else {
        report.sources_missing.push("LeakChecks.io");
      }
    } catch {
      report.sources_missing.push("LeakChecks.io");
    }
  } else {
    report.sources_missing.push("LeakChecks.io");
  }

  // --- Snusbase ---
  if (cfg("SNUSBASE_API_KEY")) {
    try {
      const res = await safeFetch("https://api.snusbase.com/data/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Auth: cfg("SNUSBASE_API_KEY")!,
        },
        body: JSON.stringify({
          terms: [email],
          types: ["email"],
          wildcard: false,
        }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.result) {
          for (const [dbname, rows] of Object.entries<any>(j.result)) {
            const isStealer = /stealer|log|redline|raccoon|vidar|titanz/i.test(dbname);
            for (const _r of Array.isArray(rows) ? rows : [rows]) {
              if (isStealer) {
                report.infostealer.push({
                  source: "Snusbase",
                  family: guessFamily(dbname),
                  artifacts: ["credentials", "cookies"],
                  importedAt: (rows as any[])?.[0]?.last_breach,
                });
              } else {
                report.breaches.push({
                  source: "Snusbase",
                  name: dbname,
                  dataTypes: ["email", "password", "username"],
                  severity: "high",
                });
              }
            }
          }
          report.sources_hit.push("Snusbase");
        } else {
          report.sources_missing.push("Snusbase");
        }
      } else {
        report.sources_missing.push("Snusbase");
      }
    } catch {
      report.sources_missing.push("Snusbase");
    }
  } else {
    report.sources_missing.push("Snusbase");
  }

  // --- IntelligenceX ---
  if (cfg("INTELX_API_KEY")) {
    try {
      const res = await safeFetch(
        `https://2.intelx.io/intelligent/search?term=${encodeURIComponent(
          email
        )}&maxresults=20&media=0&sort=2&terminate=[]`,
        { headers: { "x-key": cfg("INTELX_API_KEY")! } }
      );
      if (res.ok) {
        const j = await res.json();
        report.intelx = { id: j.id, records: j.records?.length };
        report.sources_hit.push("IntelligenceX");
      } else {
        report.sources_missing.push("IntelligenceX");
      }
    } catch {
      report.sources_missing.push("IntelligenceX");
    }
  } else {
    report.sources_missing.push("IntelligenceX");
  }

  // --- EmailRep ---
  if (true) {
    // EmailRep free tier works without key (100/day); paid key = unlimited
    try {
      const headers: Record<string, string> = { "User-Agent": "SpyBase/1.0" };
      if (cfg("EMAILREP_API_KEY")) headers["Key"] = cfg("EMAILREP_API_KEY")!;
      const res = await safeFetch(
        `https://emailrep.io/${encodeURIComponent(email)}`,
        { headers }
      );
      if (res.ok) {
        const j = await res.json();
        report.reputation = {
          score: j.reputation,
          suspicious: j.suspicious,
          credentials_leaked: j.credentials?.leaked,
          data_breach: j.data_breach,
          summary: j.summary,
        };
        if (j.details?.first_seen) report.firstSeen = j.details.first_seen;
        if (j.details?.last_seen) report.lastSeen = j.details.last_seen;
        if (j.details?.profiles) {
          report.profiles_found = (j.details.profiles as string[]).map((p) => ({
            network: p,
            url: socialUrl(p, email.split("@")[0]),
          }));
        }
        report.sources_hit.push("EmailRep");
      } else {
        report.sources_missing.push("EmailRep");
      }
    } catch {
      report.sources_missing.push("EmailRep");
    }
  }

  // --- Hunter.io verification + enrichment ---
  if (cfg("HUNTER_API_KEY")) {
    try {
      const res = await safeFetch(
        `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(
          email
        )}&api_key=${encodeURIComponent(cfg("HUNTER_API_KEY")!)}`
      );
      if (res.ok) {
        const j = await res.json();
        const d = j.data;
        if (d) {
          report.deliverable = d.status === "valid";
          report.disposable = d.disposable;
          report.hunter = d;
        }
        report.sources_hit.push("Hunter.io");
      } else {
        report.sources_missing.push("Hunter.io");
      }
    } catch {
      report.sources_missing.push("Hunter.io");
    }
  } else {
    report.sources_missing.push("Hunter.io");
  }

  // --- Deduplicate ---
  report.breaches = dedupeBy(report.breaches, (b) => `${b.source}:${b.name}`);
  report.infostealer = dedupeBy(report.infostealer, (i) => `${i.source}:${i.family}:${i.importedAt}`);
  report.accounts = dedupeBy(report.accounts, (a) => `${a.platform}:${a.username || a.url}`);

  // --- Fallback if nothing hit ---
  if (report.breaches.length === 0 && report.infostealer.length === 0 && report.accounts.length === 0 && !report.gravatar?.found) {
    // Seed with a very conservative set from EmailRep profile data when present
    if (report.profiles_found && report.profiles_found.length > 0) {
      report.accounts.push(
        ...report.profiles_found.map((p) => ({
          platform: p.network,
          url: p.url,
          source: "EmailRep",
        }))
      );
    }
  }

  // Compute basic signals
  if (!report.firstSeen) report.firstSeen = "Unknown";
  if (!report.lastSeen) report.lastSeen = "Unknown";
  return report;
}

/* --- utils --- */

async function safeFetch(url: string, init?: RequestInit, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return res;
  } catch {
    return new Response(null, { status: 0 });
  } finally {
    clearTimeout(t);
  }
}

function hibpSeverity(dc: string[]): "low" | "medium" | "high" {
  const s = dc.map((x) => x.toLowerCase()).join(",");
  if (/password/.test(s)) return "high";
  if (/email|phone|name|ip/.test(s)) return "medium";
  return "low";
}

function inferFields(line: string): string[] {
  const out: string[] = ["email"];
  if (line.includes(":")) out.push("password");
  if (/[a-f0-9]{32}/i.test(line)) out.push("hash");
  if (/username/i.test(line)) out.push("username");
  return out;
}

function guessFamily(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("redline")) return "RedLine";
  if (s.includes("raccoon")) return "Raccoon";
  if (s.includes("vidar")) return "Vidar";
  if (s.includes("titan")) return "Titan";
  if (s.includes("azorult")) return "AZORult";
  if (s.includes("mystic")) return "Mystic";
  return "Unknown";
}

function socialUrl(network: string, username: string): string {
  const n = network.toLowerCase();
  const map: Record<string, string> = {
    github: "https://github.com/",
    twitter: "https://twitter.com/",
    x: "https://x.com/",
    linkedin: "https://www.linkedin.com/in/",
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    reddit: "https://reddit.com/user/",
    spotify: "https://open.spotify.com/user/",
    pinterest: "https://pinterest.com/",
    tiktok: "https://www.tiktok.com/@",
    youtube: "https://youtube.com/@",
    strava: "https://www.strava.com/athletes/",
  };
  return (map[n] || "#") + username;
}

function dedupeBy<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require("crypto");
  return nodeCrypto.createHash("sha256").update(message).digest("hex");
}

/* --- mock fallback (DEMO_MODE or no sources) --- */
function fallbackMock(email: string): EmailReport {
  const hash = [...email].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (n: number) => Math.abs(Math.sin(hash * (n + 1)) * 9991) % 1;
  const platforms = ["GitHub","Google","LinkedIn","Dropbox","Microsoft","Spotify","Notion","Slack","Reddit","Discord"];
  const accounts = platforms.slice(0, 5 + Math.floor(r(1) * 5)).map((p, i) => ({
    platform: p,
    url: socialUrl(p.toLowerCase(), email.split("@")[0]),
    username: email.split("@")[0] + Math.floor(r(i + 3) * 99),
    source: "demo",
  }));
  const breachNames = ["Collection #1","LinkedIn 2021","Dropbox 2012","Canva 2019","Adobe 2013"];
  const breaches = breachNames.slice(0, 2 + Math.floor(r(2) * 3)).map((n, i) => ({
    source: "demo",
    name: n,
    date: `${2012 + Math.floor(r(i + 3) * 11)}-0${Math.floor(r(i + 7) * 9) + 1}-${Math.floor(r(i + 11) * 27) + 1}`,
    dataTypes: ["email","password","name"],
    severity: "high" as const,
    description: "Sample breach record (no real API keys configured).",
  }));
  return {
    email,
    deliverable: true,
    disposable: /(mailinator|temp|guerrilla|10min)/i.test(email),
    firstSeen: `20${15 + Math.floor(r(3) * 6)}-0${Math.floor(r(2) * 9) + 1}-${Math.floor(r(4) * 27) + 1}`,
    lastSeen: `2024-0${Math.floor(r(7) * 9) + 1}-${Math.floor(r(8) * 27) + 1}`,
    accounts,
    breaches,
    infostealer: [],
    sources_hit: ["demo"],
    sources_missing: ["HIBP","LeakCheck","Snusbase","IntelligenceX","Hunter.io","EmailRep"],
    reputation: {
      score: 70,
      suspicious: false,
      credentials_leaked: breaches.length > 0,
      data_breach: breaches.length > 0,
      summary: "Demo data — add API keys in Vercel environment variables to enable real lookups.",
    },
  };
}
