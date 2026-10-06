"use client";
import { Search, Eye, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const nav = [
    { href: "/", label: "Home" },
    { href: "/lookup", label: "Lookup" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/docs", label: "API Docs" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/60 backdrop-blur-md bg-[var(--bg)]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Eye className="w-5 h-5 text-[#04121a]" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-lg tracking-tight">
              Spy<span className="text-cyan-400">Base</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] -mt-0.5">
              Free · Forever
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-md text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/lookup"
            className="btn btn-ghost"
          >
            <Search className="w-4 h-4" />
            Start lookup
          </Link>
          <Link href="/auth" className="btn btn-primary">
            Sign in free
          </Link>
        </div>
        <button
          className="md:hidden p-2 rounded-md border border-[var(--border)]"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-3 space-y-1 bg-[var(--bg-2)]">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-[var(--muted)] hover:text-white hover:bg-white/5"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/auth"
            onClick={() => setOpen(false)}
            className="block btn btn-primary mt-2 w-full"
          >
            Sign in free
          </Link>
        </div>
      )}
    </header>
  );
}
