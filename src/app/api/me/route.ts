import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { cfg, ENV_DOCS } from "@/lib/config";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "spybase_session";

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function isAuthed(): Promise<boolean> {
  const pass = cfg("ADMIN_PASSWORD");
  const passHash = cfg("ADMIN_PASSWORD_SHA256");
  if (!pass && !passHash) return true; // no lock set = open (owner-only tool)
  const c = (await cookies()).get(COOKIE)?.value || "";
  if (!c) return false;
  try {
    const [exp, sig] = c.split(".");
    if (!exp || !sig) return false;
    if (parseInt(exp, 10) < Date.now()) return false;
    const secret = cfg("SESSION_SECRET") || "spybase-dev-secret-change-me";
    const expected = createHash("sha256").update(exp + ":" + secret).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("auth") === "check") {
    return NextResponse.json({ authed: await isAuthed() });
  }
  // Status of each key (masked value — never returns raw secret)
  const configured = ENV_DOCS.map((e) => {
    const v = cfg(e.key);
    let mask: string | null = null;
    if (v) {
      if (v.length <= 6) mask = v[0] + "***";
      else mask = v.slice(0, 4) + "…" + v.slice(-4);
    }
    return {
      key: e.key,
      label: e.label,
      category: e.category,
      help: e.help,
      free: !!e.free,
      link: e.link,
      set: !!v,
      masked: mask,
    };
  });
  return NextResponse.json({
    authed: await isAuthed(),
    configured,
    appName: cfg("NEXT_PUBLIC_APP_NAME") || "SpyBase",
    demo: cfg("DEMO_MODE") === "1",
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "login") {
    const { password } = (await req.json()) as { password?: string };
    const pass = cfg("ADMIN_PASSWORD");
    const passHash = cfg("ADMIN_PASSWORD_SHA256");
    if (!pass && !passHash) {
      return NextResponse.json({ ok: true });
    }
    let ok = false;
    if (pass && password === pass) ok = true;
    if (!ok && passHash && sha256(password || "") === passHash) ok = true;
    if (ok) {
      const secret = cfg("SESSION_SECRET") || "spybase-dev-secret-change-me";
      const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
      const sig = createHash("sha256").update(exp + ":" + secret).digest("hex");
      const c = await cookies();
      c.set(COOKIE, `${exp}.${sig}`, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }
  if (action === "logout") {
    (await cookies()).delete(COOKIE);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
