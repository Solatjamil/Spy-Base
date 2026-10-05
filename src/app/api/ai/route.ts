import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SpyBase AI proxy
// Uses OPENROUTER_API_KEY and OPENROUTER_MODEL from Vercel env.
// Free models are supported: e.g. google/gemini-2.0-flash-exp:free,
// meta-llama/llama-3.2-3b-instruct:free, mistralai/mistral-7b-instruct:free,
// qwen/qwen-2-7b-instruct:free, etc.
//
// If no API key is configured, returns a friendly error so the UI explains it.

const DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free";

type Msg = { role: string; content: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: Msg[];
      context?: string;
    };

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "AI analyst isn't configured yet. Add OPENROUTER_API_KEY (and optionally OPENROUTER_MODEL) to your Vercel environment variables to enable AI-powered summaries, pivots and report drafting. Free models like google/gemini-2.0-flash-exp:free, meta-llama/llama-3.2-3b-instruct:free, and mistralai/mistral-7b-instruct:free all work without a paid plan.",
        },
        { status: 200 }
      );
    }
    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const system = `You are SpyBase AI Analyst, an assistant for an open-source intelligence (OSINT) platform called SpyBase. SpyBase is 100% free for every feature. You help investigators, researchers, and security teams interpret email intelligence results (linked accounts, data breaches, infostealer logs, connection graph, timelines). Provide concise, factual, actionable guidance. Never fabricate breach data. If you do not know something, say so.

Current investigation context: ${body.context || "No lookup performed yet."}`;

    const messages: Msg[] = [
      { role: "system", content: system },
      ...(body.messages || []),
    ];

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spybase.app/",
        "X-Title": "SpyBase",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 900,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { reply: `OpenRouter error (${resp.status}): ${text.slice(0, 500)}` },
        { status: 200 }
      );
    }
    const data = (await resp.json()) as any;
    const content: string =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      "(No content returned from model.)";
    return NextResponse.json({ reply: content, model });
  } catch (e: any) {
    return NextResponse.json(
      { reply: `Error: ${e?.message || "Unknown error"}` },
      { status: 200 }
    );
  }
}
