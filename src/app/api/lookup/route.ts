import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * SpyBase Public Lookup API
 * GET /api/lookup?email=...
 *
 * This endpoint is unlocked and free. In production, wire it to your own
 * intel sources / breach databases / infostealer indexes. It currently
 * returns a deterministic mock payload so the UI and integrations work
 * out of the box.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Provide a valid email query param: ?email=you@example.com" },
      { status: 400 }
    );
  }

  // Deterministic mock data (see lookup page for generator logic summary)
  const h = hash(email);
  const rng = (n: number) => Math.abs(Math.sin(h * (n + 1)) * 999119) % 1;
  const platforms = ["google","github","linkedin","dropbox","microsoft","apple","facebook","instagram","x","spotify","tiktok","adobe","notion","slack","discord","reddit","paypal","amazon","netflix","ebay"];
  const breaches = ["Collection #1","LinkedIn 2021","Dropbox 2012","Canva 2019","Adobe 2013","MyFitnessPal 2018"];
  const families = ["RedLine","Raccoon","Vidar","Titan"];

  const accounts = platforms
    .slice(0, 6 + Math.floor(rng(1) * 6))
    .map((p, i) => ({
      platform: p,
      username: email.split("@")[0] + Math.floor(rng(i + 2) * 99),
      last_seen_days: Math.floor(rng(i + 5) * 300) + 1,
    }));
  const breachList = breaches
    .slice(0, 2 + Math.floor(rng(2) * 3))
    .map((b, i) => ({
      name: b,
      date: `${2012 + Math.floor(rng(i + 3) * 11)}-0${Math.floor(rng(i + 7) * 9) + 1}-${Math.floor(rng(i + 11) * 27) + 1}`,
      data_classes: ["email","password","name"],
      severity: rng(i + 9) > 0.5 ? "high" : "medium",
    }));
  const logs = Array.from({ length: 1 + Math.floor(rng(5) * 3) }).map((_, i) => ({
    family: families[Math.floor(rng(i + 7) * families.length)],
    artifacts: ["passwords","cookies","autofill"],
    first_seen: `2023-0${Math.floor(rng(i + 3) * 9) + 1}-11`,
  }));

  return NextResponse.json({
    email,
    deliverable: rng(99) > 0.1,
    disposable: /(mailinator|temp|guerrilla|10min)/i.test(email),
    risk: breachList.length > 3 || logs.length > 2 ? "high" : breachList.length > 1 ? "medium" : "low",
    first_seen: `20${15 + Math.floor(rng(3) * 7)}-0${Math.floor(rng(2) * 9) + 1}-${Math.floor(rng(4) * 27) + 1}`,
    last_seen: `2024-0${Math.floor(rng(7) * 9) + 1}-${Math.floor(rng(8) * 27) + 1}`,
    sources: Math.floor(rng(13) * 8) + 3,
    accounts,
    breaches: breachList,
    infostealer_logs: logs,
    _note:
      "This is a deterministic mock response. Connect real data sources by editing src/app/api/lookup/route.ts.",
  });
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h / 100000;
}
