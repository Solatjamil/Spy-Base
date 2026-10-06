import { NextResponse } from "next/server";
import { cfg } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/face
 * Body: form-data with field "image" (file) OR JSON { imageUrl: "..." }
 *
 * Runs reverse-image / face search across any configured providers:
 *   - SerpAPI (Google Lens endpoint) — strongest general web match
 *   - Google Cloud Vision WebDetection (pages with matching images, visually similar, web entities, faces)
 *   - Bing Image Search
 *   - TinEye
 *   - Google Custom Search (reverse)
 *   - Search4Faces
 *
 * Results are merged into a single ranked list.
 */
export async function POST(req: Request) {
  let imageBuffer: Buffer | null = null;
  let contentType = "image/jpeg";
  let imageUrl: string | null = null;

  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const fd = await req.formData();
    const file = fd.get("image");
    if (file instanceof Blob) {
      const ab = await file.arrayBuffer();
      imageBuffer = Buffer.from(ab);
      contentType = (file as any).type || "image/jpeg";
    }
  } else {
    try {
      const j = await req.json();
      if (j.imageBase64) {
        const m = j.imageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          contentType = m[1];
          imageBuffer = Buffer.from(m[2], "base64");
        }
      } else if (j.imageUrl) {
        imageUrl = j.imageUrl;
      }
    } catch {}
  }

  const results: any[] = [];
  const sources_hit: string[] = [];
  const sources_missing: string[] = [];
  const errors: string[] = [];

  const addHit = (source: string, hits: any[]) => {
    for (const h of hits) {
      results.push({ ...h, source });
    }
  };

  /* ---------- SerpAPI Google Lens reverse-image ---------- */
  if (cfg("SERPAPI_KEY")) {
    try {
      let u: string;
      if (imageUrl) {
        u = `https://serpapi.com/search?engine=google_lens&url=${encodeURIComponent(
          imageUrl
        )}&api_key=${encodeURIComponent(cfg("SERPAPI_KEY")!)}`;
      } else if (imageBuffer) {
        // Upload to SerpAPI via form (they accept multipart)
        const fd = new FormData();
        fd.append("api_key", cfg("SERPAPI_KEY")!);
        fd.append("engine", "google_lens");
        fd.append("image", new Blob([imageBuffer], { type: contentType }), "upload.jpg");
        const r = await fetch("https://serpapi.com/search", { method: "POST", body: fd });
        if (r.ok) {
          const j = await r.json();
          const visual = j.visual_matches || [];
          sources_hit.push("SerpAPI Google Lens");
          addHit(
            "SerpAPI Google Lens",
            visual.map((v: any) => ({
              title: v.title,
              url: v.link,
              image: v.thumbnail,
              snippet: v.source,
              score: 0.88,
              exact: false,
            }))
          );
          continue;
        } else {
          errors.push("SerpAPI: " + (await r.text()).slice(0, 300));
          sources_missing.push("SerpAPI Google Lens");
        }
        continue;
      } else {
        sources_missing.push("SerpAPI Google Lens");
        continue;
      }
      const r = await fetch(u);
      if (r.ok) {
        const j = await r.json();
        const visual = j.visual_matches || [];
        sources_hit.push("SerpAPI Google Lens");
        addHit(
          "SerpAPI Google Lens",
          visual.map((v: any) => ({
            title: v.title,
            url: v.link,
            image: v.thumbnail,
            snippet: v.source,
            score: 0.88,
          }))
        );
      } else {
        errors.push("SerpAPI: " + (await r.text()).slice(0, 300));
        sources_missing.push("SerpAPI Google Lens");
      }
    } catch (e: any) {
      errors.push("SerpAPI: " + e.message);
      sources_missing.push("SerpAPI Google Lens");
    }
  } else {
    sources_missing.push("SerpAPI Google Lens");
  }

  /* ---------- Google Cloud Vision WebDetection ---------- */
  if (cfg("GOOGLE_CLOUD_VISION_API_KEY") && imageBuffer) {
    try {
      const r = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(
          cfg("GOOGLE_CLOUD_VISION_API_KEY")!
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: imageBuffer.toString("base64") },
                features: [
                  { type: "WEB_DETECTION", maxResults: 20 },
                  { type: "FACE_DETECTION", maxResults: 5 },
                  { type: "LABEL_DETECTION", maxResults: 15 },
                  { type: "TEXT_DETECTION" },
                  { type: "LOGO_DETECTION" },
                  { type: "LANDMARK_DETECTION" },
                ],
              },
            ],
          }),
        }
      );
      if (r.ok) {
        const j = await r.json();
        const resp = j.responses?.[0] || {};
        const web = resp.webDetection || {};
        const hits: any[] = [];
        for (const m of web.fullMatchingImages || []) hits.push({ title: "Exact match", url: m.url, score: 1.0, exact: true });
        for (const m of web.partialMatchingImages || []) hits.push({ title: "Partial match", url: m.url, score: 0.8, exact: false });
        for (const p of web.pagesWithMatchingImages || []) hits.push({ title: p.pageTitle || "Matching page", url: p.url, score: 0.75 });
        for (const e of web.webEntities || []) {
          if ((e.description || "").length > 1) hits.push({ title: e.description, url: e.entityId, score: (e.score || 0) / 3, tag: true });
        }
        sources_hit.push("Google Cloud Vision");
        addHit("Google Cloud Vision", hits);
        // Attach face/label data
        (results as any)._vision = {
          faceAnnotations: resp.faceAnnotations?.length || 0,
          labels: (resp.labelAnnotations || []).map((l: any) => l.description),
          logos: (resp.logoAnnotations || []).map((l: any) => l.description),
          landmarks: (resp.landmarkAnnotations || []).map((l: any) => l.description),
          text: resp.textAnnotations?.[0]?.description,
        };
      } else {
        errors.push("GCV: " + (await r.text()).slice(0, 300));
        sources_missing.push("Google Cloud Vision");
      }
    } catch (e: any) {
      errors.push("GCV: " + e.message);
      sources_missing.push("Google Cloud Vision");
    }
  } else if (cfg("GOOGLE_CLOUD_VISION_API_KEY")) {
    sources_missing.push("Google Cloud Vision (no image buffer)");
  } else {
    sources_missing.push("Google Cloud Vision");
  }

  /* ---------- Bing Image Search ---------- */
  if (cfg("BING_SEARCH_API_KEY") && imageBuffer) {
    try {
      const r = await fetch("https://api.bing.microsoft.com/v7.0/images/visualsearch", {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": cfg("BING_SEARCH_API_KEY")!,
          "Content-Type": contentType,
        },
        body: imageBuffer,
      });
      if (r.ok) {
        const j = await r.json();
        const tags = j.tags || [];
        const hits: any[] = [];
        for (const t of tags) {
          for (const act of t.actions || []) {
            for (const d of act.data?.value || []) {
              hits.push({ title: d.name, url: d.hostPageUrl, image: d.thumbnailUrl, snippet: d.hostPageDisplayUrl, score: 0.7 });
            }
          }
        }
        sources_hit.push("Bing Visual Search");
        addHit("Bing Visual Search", hits);
      } else {
        errors.push("Bing: " + (await r.text()).slice(0, 300));
        sources_missing.push("Bing Visual Search");
      }
    } catch (e: any) {
      errors.push("Bing: " + e.message);
      sources_missing.push("Bing Visual Search");
    }
  } else {
    sources_missing.push("Bing Visual Search");
  }

  /* ---------- TinEye ---------- */
  if (cfg("TINEYE_API_KEY") && imageBuffer) {
    try {
      const fd = new FormData();
      fd.append("api_key", cfg("TINEYE_API_KEY")!);
      fd.append("image", new Blob([imageBuffer], { type: contentType }), "upload.jpg");
      const r = await fetch("https://api.tineye.com/rest/search/", { method: "POST", body: fd });
      if (r.ok) {
        const j = await r.json();
        const matches = j.results?.matches || [];
        sources_hit.push("TinEye");
        addHit(
          "TinEye",
          matches.map((m: any) => ({
            title: m.domain,
            url: m.image_url,
            image: m.image_url,
            score: m.score ?? 0.6,
            exact: false,
            backlinks: m.backlinks,
          }))
        );
      } else {
        errors.push("TinEye: " + (await r.text()).slice(0, 300));
        sources_missing.push("TinEye");
      }
    } catch (e: any) {
      errors.push("TinEye: " + e.message);
      sources_missing.push("TinEye");
    }
  } else {
    sources_missing.push("TinEye");
  }

  /* ---------- Search4Faces (face-only) ---------- */
  if (cfg("SEARCH4FACES_API_KEY") && imageBuffer) {
    try {
      const fd = new FormData();
      fd.append("avatar", new Blob([imageBuffer], { type: contentType }), "upload.jpg");
      const r = await fetch("https://search4faces.com/api/search/v1", {
        method: "POST",
        headers: { "x-api-key": cfg("SEARCH4FACES_API_KEY")! },
        body: fd,
      });
      if (r.ok) {
        const j = await r.json();
        sources_hit.push("Search4Faces");
        // Shape varies; normalize if possible
        addHit(
          "Search4Faces",
          (j.results || j.data || []).map((m: any) => ({
            title: m.profile || m.name || "Profile match",
            url: m.url || m.link,
            image: m.photo,
            score: m.score / 100 || 0.5,
          }))
        );
      } else {
        errors.push("S4F: " + (await r.text()).slice(0, 300));
        sources_missing.push("Search4Faces");
      }
    } catch (e: any) {
      errors.push("S4F: " + e.message);
      sources_missing.push("Search4Faces");
    }
  } else {
    sources_missing.push("Search4Faces");
  }

  return NextResponse.json({
    hits: results.filter((r) => r && (r.url || r.title)),
    sources_hit,
    sources_missing,
    errors,
    _vision: (results as any)._vision,
    total: results.length,
  });
}
