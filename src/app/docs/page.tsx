"use client";
import {
  Key,
  Terminal,
  Rocket,
  Code2,
  Search,
  BellRing,
  Cpu,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-[220px_1fr] gap-10">
      <aside className="lg:sticky lg:top-20 self-start text-sm space-y-1">
        {[
          ["#intro", "Introduction"],
          ["#deploy", "Deploy to Vercel"],
          ["#env", "Environment"],
          ["#api", "REST API"],
          ["#ai", "AI (OpenRouter)"],
          ["#extending", "Bring your own data"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="block px-3 py-2 rounded-md text-[var(--muted)] hover:text-white hover:bg-white/5"
          >
            {label}
          </a>
        ))}
      </aside>
      <div className="prose prose-invert max-w-none space-y-14">
        <section id="intro">
          <h1 className="text-3xl md:text-4xl font-bold heading-glow flex items-center gap-2">
            <Code2 className="w-8 h-8 text-cyan-400" /> SpyBase Documentation
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            SpyBase is a free and open email-intelligence & OSINT platform.
            This documentation will help you deploy SpyBase to Vercel,
            configure AI with OpenRouter free models, and wire up your own
            data sources / APIs.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Link href="/lookup" className="btn btn-primary">Try the UI</Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              <Code2 className="w-4 h-4" /> View source
            </a>
          </div>
        </section>

        <section id="deploy">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" /> Deploy to Vercel
          </h2>
          <ol className="mt-3 space-y-3 list-decimal pl-5 text-[var(--muted)]">
            <li>Push the <span className="mono text-white">spybase/</span> folder to a GitHub repo.</li>
            <li>Import the repo in Vercel as a Next.js project.</li>
            <li>Set environment variables (see below).</li>
            <li>Deploy. That's it.</li>
          </ol>
          <p className="mt-3 text-[var(--muted)]">
            The UI ships fully functional with deterministic demo data so you
            can preview it immediately.
          </p>
        </section>

        <section id="env">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6 text-cyan-400" /> Environment variables
          </h2>
          <p className="text-[var(--muted)]">
            Add these in Vercel → Settings → Environment Variables.
          </p>
          <EnvTable
            rows={[
              ["OPENROUTER_API_KEY", "Required for AI analyst.", "sk-or-v1-..."],
              [
                "OPENROUTER_MODEL",
                "Optional. Defaults to a free Gemini model.",
                "google/gemini-2.0-flash-exp:free",
              ],
              ["NEXT_PUBLIC_APP_NAME", "Optional branding override.", "SpyBase"],
              ["BREACH_API_KEY", "Optional. For your own breach data provider.", ""],
              ["INFOSTEALER_API_KEY", "Optional. For your infostealer source.", ""],
              ["WEBHOOK_SECRET", "Optional. Verify outbound webhooks.", ""],
            ]}
          />
          <h3 className="mt-6 text-lg font-semibold">Recommended free models</h3>
          <ul className="mt-2 text-sm text-[var(--muted)] list-disc pl-5 space-y-1">
            <li><span className="mono text-white">google/gemini-2.0-flash-exp:free</span> &mdash; well-rounded, long context.</li>
            <li><span className="mono text-white">meta-llama/llama-3.2-3b-instruct:free</span> &mdash; fast, compact.</li>
            <li><span className="mono text-white">mistralai/mistral-7b-instruct:free</span> &mdash; strong analytical writing.</li>
            <li><span className="mono text-white">qwen/qwen-2-7b-instruct:free</span> &mdash; multilingual, good summaries.</li>
          </ul>
        </section>

        <section id="api">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" /> REST API
          </h2>
          <p className="text-[var(--muted)]">
            SpyBase exposes a simple HTTP API. There are no API keys required
            by default (you can add auth in <span className="mono">middleware.ts</span>).
          </p>
          <CodeBlock
            lang="bash"
            code={`curl "https://your-deployment.vercel.app/api/lookup?email=target@example.com"`}
          />
          <p className="text-[var(--muted)]">Response shape:</p>
          <CodeBlock
            lang="json"
            code={`{
  "email": "target@example.com",
  "deliverable": true,
  "disposable": false,
  "risk": "high",
  "first_seen": "2018-03-02",
  "last_seen": "2024-07-15",
  "sources": 11,
  "accounts": [{ "platform": "github", "username": "target42", "last_seen_days": 3 }],
  "breaches":  [{ "name": "Collection #1", "date": "2019-01-17", "data_classes": ["email","password"], "severity": "high" }],
  "infostealer_logs": [{ "family": "RedLine", "artifacts": ["passwords","cookies"], "first_seen": "2023-05-11" }]
}`}
          />
          <h3 className="text-lg font-semibold mt-6">Endpoints</h3>
          <ul className="mt-2 text-sm space-y-2 text-[var(--muted)]">
            <li><span className="mono text-white">GET /api/lookup?email=...</span> &mdash; Email intelligence lookup.</li>
            <li><span className="mono text-white">POST /api/ai</span> &mdash; AI chat proxy to OpenRouter (free models work).</li>
            <li><span className="mono text-white">POST /api/monitor</span> (stub) &mdash; Extend to implement continuous monitoring.</li>
            <li><span className="mono text-white">POST /api/bulk</span> (stub) &mdash; Bulk email submission.</li>
          </ul>
        </section>

        <section id="ai">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" /> AI analyst (OpenRouter)
          </h2>
          <p className="text-[var(--muted)]">
            The in-app AI analyst calls <span className="mono">/api/ai</span>,
            which forwards your request to OpenRouter using your key. This is
            designed to work with OpenRouter's free models &mdash; no paid plan
            needed. Just add your key in Vercel.
          </p>
          <CodeBlock
            lang="bash"
            code={`# Example: set env in Vercel CLI
vercel env add OPENROUTER_API_KEY
vercel env add OPENROUTER_MODEL google/gemini-2.0-flash-exp:free
vercel --prod`}
          />
        </section>

        <section id="extending">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" /> Bring your own data
          </h2>
          <p className="text-[var(--muted)]">
            The lookup endpoint returns deterministic mock data by default. To
            wire in real OSINT / breach / infostealer sources:
          </p>
          <ol className="list-decimal pl-5 text-[var(--muted)] space-y-2 mt-2">
            <li>Edit <span className="mono text-white">src/app/api/lookup/route.ts</span>.</li>
            <li>Call your upstream providers (e.g. HIBP, LeakCheck, your own DB) using server-side env keys.</li>
            <li>Shape the response to match the documented JSON format.</li>
            <li>For monitoring / bulk, edit the stub files under <span className="mono">src/app/api/</span>.</li>
          </ol>
          <div className="mt-6 panel p-4 flex items-start gap-3">
            <BellRing className="w-5 h-5 text-amber-400 mt-1" />
            <p className="text-sm text-[var(--muted)]">
              <span className="text-white font-semibold">Responsible use.</span>{" "}
              SpyBase is intended for authorized security research, threat
              intelligence, fraud prevention, and lawful investigations. Do
              not use it to stalk, harass, or obtain data without legal
              authorization.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function EnvTable({ rows }: { rows: string[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-black/40">
          <tr className="text-left text-[var(--muted)] text-xs uppercase tracking-wider">
            <th className="p-3">Variable</th>
            <th className="p-3">Description</th>
            <th className="p-3">Example</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-[var(--border)]">
              <td className="p-3 mono text-cyan-400">{r[0]}</td>
              <td className="p-3 text-[var(--muted)]">{r[1]}</td>
              <td className="p-3 mono text-xs">{r[2] || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-3 rounded-lg border border-[var(--border)] bg-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] text-xs text-[var(--muted)]">
        <span className="mono">{lang}</span>
        <button
          className="flex items-center gap-1 hover:text-white"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs mono overflow-x-auto text-[var(--text)]"><code>{code}</code></pre>
    </div>
  );
}
