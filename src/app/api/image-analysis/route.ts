import { NextResponse } from "next/server";
import { cfg } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/image-analysis
 * Body: { imageBase64: "data:image/jpeg;base64,...", prompt?: string }
 *
 * Sends the image to an OpenRouter vision-capable model for analysis.
 * Configure OPENROUTER_MODEL to a vision model (defaults to
 * google/gemini-2.0-flash-exp:free which supports images).
 */
export async function POST(req: Request) {
  try {
    const apiKey = cfg("OPENROUTER_API_KEY");
    if (!apiKey) {
      return NextResponse.json({
        reply:
          "AI vision isn't configured. Add OPENROUTER_API_KEY to Vercel env (any free vision-capable model on OpenRouter works, e.g. google/gemini-2.0-flash-exp:free).",
      });
    }
    const { imageBase64, prompt } = (await req.json()) as { imageBase64?: string; prompt?: string };
    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      return NextResponse.json({ error: "Expected base64 data URL for field 'imageBase64'" }, { status: 400 });
    }
    const model = cfg("OPENROUTER_MODEL") || "google/gemini-2.0-flash-exp:free";
    const visionPrompt =
      prompt ||
      `You are an expert OSINT investigator. Analyze this image for face/visual-identity reconnaissance. 
Return STRICT JSON only (no prose, no markdown fences) with this shape:
{
  "demographics": { "perceived_gender": "", "perceived_age_range": "", "perceived_ethnicity": "", "hair": "", "eyewear": "", "facial_hair": "", "distinctive_features": [] },
  "scene": { "setting": "", "lighting": "", "likely_indoor_or_outdoor": "", "objects_in_frame": [], "clothing": [], "text_visible": [], "language_guess": "" },
  "image_metadata": { "likely_quality": "", "possible_device_hint": "", "is_screenshot": false, "is_ai_generated_guess": false },
  "reverse_search_tips": [ "..." ],
  "identity_hypotheses": [ { "confidence": 0-100, "reasoning": "...", "suggested_platforms": [] } ],
  "red_flags": [ "..." ],
  "investigator_summary": "..."
}
If the image contains no person/face, say so clearly. Do not attempt to identify a specific real person from the face alone — only provide observations and search strategy.`;

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
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: visionPrompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1800,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ reply: `OpenRouter error (${resp.status}): ${text.slice(0, 800)}` });
    }
    const data = await resp.json();
    const reply: string = data?.choices?.[0]?.message?.content || "(empty)";
    let parsed: any = null;
    try {
      const cleaned = reply
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {}
    return NextResponse.json({ reply, parsed, model });
  } catch (e: any) {
    return NextResponse.json({ reply: `Error: ${e?.message || "unknown"}` });
  }
}
