"use client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo auth: simply route to dashboard. Replace with NextAuth/Auth.js/Clerk/etc.
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
          <Eye className="w-6 h-6 text-[#04121a]" strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {mode === "signup" ? "Create your free account" : "Welcome back"}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Every feature, free forever. No credit card required.
        </p>
      </div>

      <form onSubmit={submit} className="panel p-6 mt-8 space-y-4">
        <div>
          <label className="text-xs text-[var(--muted)]">Email</label>
          <input
            type="email"
            required
            className="input mt-1"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)]">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input mt-1"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          {mode === "signup" ? "Create account free" : "Sign in"}
        </button>
        <div className="text-center text-xs text-[var(--muted)]">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-cyan-400 hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Sign up free"}
          </button>
        </div>
      </form>

      <div className="text-center mt-4 text-xs text-[var(--muted)]">
        By continuing you agree to the responsible use policy.{" "}
        <Link href="/docs" className="text-cyan-400 hover:underline">Read the docs</Link>.
      </div>
    </div>
  );
}
