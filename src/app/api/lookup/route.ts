import { NextResponse } from "next/server";
import { buildEmailReport } from "@/lib/emailSources";
import { isDemo } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/lookup?email=...
 *
 * Aggregates results from every configured provider (HIBP, LeakCheck, Snusbase,
 * IntelX, EmailRep, Hunter, Gravatar, etc.). When no keys are configured or
 * DEMO_MODE=1, returns deterministic sample data.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Provide a valid email: ?email=you@example.com" },
      { status: 400 }
    );
  }
  try {
    const report = await buildEmailReport(email);
    return NextResponse.json({ ...report, demo: report.demo || isDemo() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Lookup failed" }, { status: 500 });
  }
}
