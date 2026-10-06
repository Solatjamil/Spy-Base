import { Eye, Code2, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#04121a]" strokeWidth={2.5} />
            </div>
            <div className="font-bold text-lg">
              Spy<span className="text-cyan-400">Base</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)] max-w-md">
            SpyBase is a free and open intelligence platform for researchers,
            investigators, and security teams. Every feature is free forever —
            no paywalls, no pro-tier upsells, no artificial limits.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              className="btn btn-ghost"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 className="w-4 h-4" /> GitHub
            </a>
            <a
              className="btn btn-ghost"
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="w-4 h-4" /> Community
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white">Product</h4>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="/lookup" className="hover:text-white">Email lookup</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link href="/docs" className="hover:text-white">API docs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white">Company</h4>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><a href="mailto:hello@spybase.app" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <div>© {new Date().getFullYear()} SpyBase. All features free forever.</div>
          <div className="flex items-center gap-2">
            <span className="chip-green chip">● All systems operational</span>
            <span>Made for researchers · Use responsibly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
