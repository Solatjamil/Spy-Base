"use client";
import {
  Search,
  Camera,
  ShieldAlert,
  Bug,
  Network,
  BellRing,
  Users,
  FileDown,
  ListChecks,
  Activity,
  Database,
  Timer,
  ArrowRight,
  Zap,
  Lock,
  Sparkles,
  CheckCircle2,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LogoTicker from "@/components/LogoTicker";
import HeroResult from "@/components/HeroResult";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) router.push(`/lookup?q=${encodeURIComponent(email)}`);
    else router.push("/lookup");
  };

  const stats = [
    { v: "40B+", l: "Data records", sub: "Breach & infostealer log records" },
    { v: "<3s", l: "Avg. lookup", sub: "Real-time enrichment, always" },
    { v: "100%", l: "Free forever", sub: "Every feature, every user, always" },
    { v: "0", l: "Paywalls", sub: "No pro tiers, no upsells, no limits" },
  ];

  const steps = [
    {
      icon: Search,
      title: "Input an email",
      desc: "Start with a single email. We run validation and prepare real-time lookups.",
    },
    {
      icon: Activity,
      title: "Find registrations",
      desc: "Instantly check which platforms have accounts tied to that email — usernames, photos, activity dates included.",
    },
    {
      icon: ShieldAlert,
      title: "Enrich with breaches",
      desc: "Surface breach hits with sources, dates and exposed data to assess exposure risk.",
    },
    {
      icon: Network,
      title: "Map the graph",
      desc: "Explore relationships between emails, usernames, and breaches on an interactive connection graph.",
    },
  ];

  const features = [
    {
      icon: ShieldAlert,
      title: "40B+ breach records",
      desc: "Cross-reference any email against one of the largest combined breach and infostealer log databases — tens of millions of new records indexed daily.",
      tag: "Complete access",
    },
    {
      icon: Bug,
      title: "Infostealer log intelligence",
      desc: "See compromised credentials, stolen cookies and sessions, machine snapshots, and full file contents from infected devices.",
      tag: "Full machine data",
    },
    {
      icon: BellRing,
      title: "Persistent monitoring",
      desc: "Set up monitors on emails, domains, and usernames. Get alerted the moment new breaches, logs, or registrations surface — webhooks included.",
      tag: "Unlimited monitors",
    },
    {
      icon: Network,
      title: "Connection graph",
      desc: "Map relationships between emails, accounts, usernames, and breaches on an interactive visual graph. Trace shared identifiers across investigations.",
      tag: "Unlimited pivots",
    },
    {
      icon: Users,
      title: "Team workspaces",
      desc: "Share lookup history, pool daily quotas and centralize billing. Every analyst works from the same source of truth.",
      tag: "Unlimited seats",
    },
    {
      icon: FileDown,
      title: "PDF & JSON exports",
      desc: "Generate branded PDF reports from any lookup for clients or compliance, or export raw data as JSON/CSV via the API.",
      tag: "Unlimited exports",
    },
    {
      icon: ListChecks,
      title: "Bulk lookup",
      desc: "Submit up to 10,000 emails at once. Get results asynchronously with webhook callbacks or download as a dataset.",
      tag: "Unlimited batches",
    },
    {
      icon: Zap,
      title: "Open API & webhooks",
      desc: "Integrate SpyBase into your SOC or product with a fully documented REST API, streaming SSE endpoints, and webhook alerts.",
      tag: "No rate-limit on self-host",
    },
  ];

  const useCases = [
    {
      title: "Threat investigation",
      desc: "Profile threat actors from a single email: linked accounts, breach history, and activity timelines.",
      icon: ShieldAlert,
    },
    {
      title: "ATO prevention",
      desc: "Query infostealer logs by your login URL and stop account takeovers before attackers replay stolen credentials.",
      icon: Lock,
    },
    {
      title: "Fraud & risk",
      desc: "Flag risky sign-ups at registration by cross-referencing new emails against historical breach and infostealer exposure.",
      icon: Scale,
    },
    {
      title: "Private investigation",
      desc: "Build a chronological digital footprint across platforms for OSINT, due diligence, or legal cases.",
      icon: Sparkles,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="chip mb-5">
              <Sparkles className="w-3 h-3" />
              100% free &mdash; every feature, forever
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] heading-glow">
              A better way to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500">
                collect intelligence
              </span>
            </h1>
            <p className="mt-5 text-lg text-[var(--muted)] max-w-xl">
              SpyBase turns a single email into a rich, actionable footprint.
              See linked accounts, data breaches, infostealer logs, and
              timelines — the intelligence platform trusted by security teams,
              investigators, and researchers worldwide. Now{" "}
              <span className="text-white font-medium">free for everyone</span>.
            </p>

            <form onSubmit={onSubmit} className="mt-7 flex gap-2 max-w-xl">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter an email address..."
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Lookup <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-3">
              <Link href="/lookup/face" className="btn btn-ghost">
                <Camera className="w-4 h-4" /> Or search by face / photo (stronger than Google Lens)
              </Link>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> See
                accounts registered with an email
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> See data
                breaches associated with an email
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Stop ATOs
                before fraudsters log in
              </li>
            </ul>
            <div className="mt-8 flex items-center gap-3 text-xs text-[var(--muted)]">
              <span>Trusted by professionals in</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Cybersecurity",
                  "Private Investigations",
                  "Corporate Risk",
                  "Law Enforcement",
                  "Financial Services",
                  "Fraud Teams",
                ].map((t) => (
                  <span key={t} className="chip-gray chip">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-cyan-500/10 blur-3xl rounded-full" />
            <div className="relative">
              <HeroResult />
            </div>
          </div>
        </div>
      </section>

      {/* Logo ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center text-xs uppercase tracking-[0.25em] text-[var(--muted)] mb-4">
          Detects accounts across 500+ platforms
        </div>
        <LogoTicker />
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.l} className="panel p-5 card-hover">
              <div className="flex items-center gap-2 text-[var(--muted)] text-xs uppercase tracking-widest">
                {s.l === "Free forever" ? (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                ) : s.l === "Paywalls" ? (
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                ) : s.l === "Data records" ? (
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Timer className="w-3.5 h-3.5 text-cyan-400" />
                )}
                {s.l}
              </div>
              <div className="mt-2 text-3xl font-bold text-white">{s.v}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="chip mb-4">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold heading-glow">
            From email to intelligence &mdash; in seconds
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            SpyBase turns a single email into a rich, actionable footprint.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="panel p-5 card-hover relative">
              <div className="mono text-xs text-cyan-400/60">0{i + 1}</div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mt-2">
                <s.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="text-sm text-[var(--muted)] mt-1.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="chip mb-4">Everything included</span>
          <h2 className="text-3xl md:text-4xl font-bold heading-glow">
            What sets SpyBase apart
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            Every feature that competitors charge hundreds of dollars for —
            included free.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="panel p-5 card-hover">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="chip-green chip text-[10px]">{f.tag}</span>
              </div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="text-sm text-[var(--muted)] mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="chip mb-4">Use cases</span>
          <h2 className="text-3xl md:text-4xl font-bold heading-glow">
            Built for investigators, researchers & teams
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            Modeled on proven OSINT workflows — rapid enrichment and timeline
            insights at any scale.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((u) => (
            <div key={u.title} className="panel p-5 card-hover">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <u.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="mt-3 font-semibold">{u.title}</h3>
              <p className="text-sm text-[var(--muted)] mt-1.5">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="panel p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold heading-glow">
                Start investigating — for free.
              </h2>
              <p className="mt-3 text-[var(--muted)] max-w-lg">
                No credit card. No limits. No paywalls. Sign up and get instant
                access to every feature. Bring your own OpenRouter key for
                AI-assisted analysis.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/auth" className="btn btn-primary">
                  Get started free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/docs" className="btn btn-ghost">
                  Read the API docs
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Unlimited lookups",
                "Unlimited monitors",
                "Infostealer logs",
                "Connection graph",
                "Team workspaces",
                "PDF / JSON exports",
                "Bulk lookup (10k)",
                "REST API + webhooks",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm rounded-lg border border-[var(--border)] bg-black/30 px-3 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
