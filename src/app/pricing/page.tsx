"use client";
import { CheckCircle2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

const allFeatures = [
  "Unlimited email lookups",
  "40B+ breach records",
  "Infostealer log intelligence (full)",
  "Linked account discovery (500+ platforms)",
  "Interactive connection graph",
  "Activity timeline",
  "Persistent monitoring (unlimited identifiers)",
  "Webhook alerts",
  "AI analyst (OpenRouter, bring your own key)",
  "Unlimited team seats & shared workspace",
  "Bulk lookup (up to 10,000 emails/batch)",
  "API access (no rate limits on self-host)",
  "PDF & JSON / CSV exports",
  "Public report links",
  "Audit logs",
  "White-label reports",
  "SSO / SAML (self-host)",
  "SIEM & SOC integration",
  "Custom frequency monitoring",
  "Dedicated community support",
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <span className="chip mb-4">
          <Sparkles className="w-3 h-3" /> No tiers, no nonsense
        </span>
        <h1 className="text-4xl md:text-5xl font-bold heading-glow">
          Every feature.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500">
            Free forever.
          </span>
        </h1>
        <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
          We believe intelligence tools shouldn't sit behind paywalls. SpyBase
          is and always will be free &mdash; every lookup, every export, every
          integration. Bring your own OpenRouter API key for AI assistance
          (free-tier models work great).
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth" className="btn btn-primary">
            Get started &mdash; it's free
          </Link>
          <Link href="/docs" className="btn btn-ghost">
            Self-host on Vercel
          </Link>
        </div>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-5">
        <div className="panel p-6 opacity-70 line-through">
          <div className="text-sm text-[var(--muted)]">Basic</div>
          <div className="mt-2 text-3xl font-bold">$12.99<span className="text-sm text-[var(--muted)] font-normal">/mo</span></div>
          <p className="text-xs text-[var(--muted)] mt-1">Limited lookups, no API, no logs.</p>
        </div>
        <div className="panel p-6 opacity-70 line-through relative">
          <div className="absolute -top-3 left-6 chip text-[10px]">Popular · Old pricing</div>
          <div className="text-sm text-[var(--muted)]">Pro</div>
          <div className="mt-2 text-3xl font-bold">$29.99<span className="text-sm text-[var(--muted)] font-normal">/mo</span></div>
          <p className="text-xs text-[var(--muted)] mt-1">Still walled off from full logs.</p>
        </div>
        <div className="panel p-6 relative border-cyan-400/50 shadow-[0_0_40px_-10px_rgba(34,211,238,0.4)]">
          <div className="absolute -top-3 left-6 chip-green chip">
            <Zap className="w-3 h-3" /> The only plan you need
          </div>
          <div className="text-sm text-cyan-400 font-semibold">SpyBase Free</div>
          <div className="mt-2 text-4xl font-bold heading-glow">$0</div>
          <p className="text-xs text-[var(--muted)] mt-1">Forever. No credit card required.</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> Everything from every tier, unlocked</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> Open-source frontend, BYO data/API</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> AI via your own OpenRouter key (free models supported)</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> Unlimited everything for you & your team</li>
          </ul>
          <Link href="/auth" className="btn btn-primary w-full mt-6">
            Sign up free
          </Link>
        </div>
      </div>

      <div className="mt-16 panel p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold">Everything included</h2>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {allFeatures.map((f) => (
            <div key={f} className="flex items-start gap-2 rounded-md px-3 py-2 bg-black/30 border border-[var(--border)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-[var(--muted)]">
        <p>
          If you'd like to support development, contributions are welcome on
          GitHub. We don't believe in holding public-safety intelligence
          behind subscriptions.
        </p>
      </div>
    </div>
  );
}
