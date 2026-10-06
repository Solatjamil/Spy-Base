"use client";
import { Eye, Shield, Heart, Users, Lock, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
          <Eye className="w-6 h-6 text-[#04121a]" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-bold heading-glow">About SpyBase</h1>
      </div>
      <p className="text-[var(--muted)] text-lg leading-relaxed">
        SpyBase is a free and open intelligence platform built for
        researchers, investigators, and security teams who can't afford the
        five-hundred-dollar-a-month OSINT subscriptions. We believe better
        digital-safety tools should be available to everyone &mdash; not just
        well-funded SOCs.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mt-10">
        {[
          {
            icon: Shield,
            title: "Built for defenders",
            desc: "From ATO prevention to phishing triage, SpyBase is designed to make defense faster than offense.",
          },
          {
            icon: Heart,
            title: "Free, forever",
            desc: "No paywalls, no pro tiers, no credit-card walls. Every feature ships unlocked for every user.",
          },
          {
            icon: Lock,
            title: "Privacy first",
            desc: "Self-host on Vercel in minutes. Your keys, your data, your infrastructure. Nothing phoning home.",
          },
          {
            icon: Users,
            title: "Community driven",
            desc: "Open development, open integrations. Contribute connectors, share detection rules, and shape the roadmap.",
          },
          {
            icon: Globe,
            title: "Global data",
            desc: "Designed to combine breach databases, infostealer indexes, account-presence signals, and your private sources.",
          },
          {
            icon: Eye,
            title: "Transparent",
            desc: "Audit every request. OpenRouter AI is proxied through your own key &mdash; no hidden AI costs.",
          },
        ].map((v) => (
          <div key={v.title} className="panel p-5 card-hover">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <v.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="mt-3 font-semibold">{v.title}</h3>
            <p className="text-sm text-[var(--muted)] mt-1.5">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="panel p-8 mt-12">
        <h2 className="text-2xl font-bold">Responsible use policy</h2>
        <p className="mt-3 text-[var(--muted)]">
          SpyBase is intended for authorized security research, threat
          intelligence, fraud prevention, and lawful investigations. Users are
          responsible for complying with all applicable laws and regulations
          in their jurisdiction. We don't sell data and we don't help anyone
          break into accounts or surveil individuals without legal authority.
        </p>
      </div>
    </div>
  );
}
