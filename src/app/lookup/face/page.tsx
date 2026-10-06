"use client";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Search,
  ShieldAlert,
  Sparkles,
  Loader2,
  User as UserIcon,
  MapPin,
  TextCursorInput,
  Link2,
  AlertTriangle,
  Eye as EyeIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

type ReverseHit = {
  title: string;
  url: string;
  image?: string;
  snippet?: string;
  score?: number;
  exact?: boolean;
  source: string;
  tag?: boolean;
};

type VisionData = {
  faceAnnotations?: number;
  labels?: string[];
  logos?: string[];
  landmarks?: string[];
  text?: string;
};

type AiJson = {
  demographics?: any;
  scene?: any;
  image_metadata?: any;
  reverse_search_tips?: string[];
  identity_hypotheses?: any[];
  red_flags?: string[];
  investigator_summary?: string;
};

export default function FaceLookupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<ReverseHit[]>([]);
  const [sourcesHit, setSourcesHit] = useState<string[]>([]);
  const [sourcesMissing, setSourcesMissing] = useState<string[]>([]);
  const [vision, setVision] = useState<VisionData | null>(null);
  const [aiRaw, setAiRaw] = useState<string>("");
  const [aiJson, setAiJson] = useState<AiJson | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setHits([]);
    setSourcesHit([]);
    setSourcesMissing([]);
    setVision(null);
    setAiRaw("");
    setAiJson(null);
    setErrors([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onPick(f);
  };

  const runSearch = async () => {
    if (!file) return;
    setLoading(true);
    setErrors([]);
    setHits([]);
    setSourcesHit([]);
    setSourcesMissing([]);
    setAiRaw("");
    setAiJson(null);

    try {
      // 1) Reverse image / face search
      setStep("Running reverse-image search across providers…");
      const fd = new FormData();
      fd.append("image", file);
      const rFace = await fetch("/api/face", { method: "POST", body: fd });
      if (rFace.ok) {
        const d = await rFace.json();
        setHits(d.hits || []);
        setSourcesHit(d.sources_hit || []);
        setSourcesMissing(d.sources_missing || []);
        setErrors(d.errors || []);
        if (d._vision) setVision(d._vision);
      } else {
        setErrors([`Reverse search failed: ${rFace.status}`]);
      }

      // 2) Vision AI analysis via OpenRouter
      setStep("Running AI vision analysis…");
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const rAi = await fetch("/api/image-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64 }),
      });
      if (rAi.ok) {
        const d = await rAi.json();
        setAiRaw(d.reply || "");
        setAiJson(d.parsed || null);
      }
      setStep("");
    } catch (e: any) {
      setErrors([e?.message || "Search failed"]);
      setStep("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/lookup" className="hover:text-white">Lookup</Link>
        <span>/</span>
        <span className="text-white">Face / Image</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <Camera className="w-7 h-7 text-cyan-400" /> Face & Image OSINT
      </h1>
      <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
        Stronger than Google Lens for OSINT: reverse-search faces and images
        across every provider you configure, run AI vision analysis (OpenRouter),
        extract text/logos/landmarks, and generate an investigator-ready report.
        All providers optional — add keys in <Link href="/settings" className="text-cyan-400 hover:underline">Settings</Link>.
      </p>

      <div className="grid lg:grid-cols-[380px_1fr] gap-5 mt-6">
        <div className="space-y-4">
          <div
            ref={dragRef}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`panel p-5 border-dashed cursor-pointer transition ${dragOver ? "border-cyan-400" : ""}`}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || null)} />
            {preview ? (
              <div className="space-y-3">
                <img src={preview} alt="preview" className="w-full rounded-lg border border-[var(--border)] max-h-80 object-cover" />
                <div className="flex gap-2">
                  <button className="btn btn-ghost text-xs flex-1" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                    <ImageIcon className="w-3.5 h-3.5" /> Replace
                  </button>
                  <button
                    className="btn btn-primary text-xs flex-1"
                    onClick={(e) => { e.stopPropagation(); runSearch(); }}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    {loading ? " Analyzing…" : " Analyze"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="mt-3 font-semibold">Drop a face photo here</div>
                <div className="text-xs text-[var(--muted)] mt-1">or click to browse · JPG/PNG/WEBP up to 8MB</div>
              </div>
            )}
          </div>

          <div className="panel p-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Active providers
            </div>
            {sourcesHit.length === 0 && sourcesMissing.length === 0 ? (
              <div className="text-[var(--muted)]">Run a search to see which providers fired.</div>
            ) : (
              <div className="space-y-1">
                {sourcesHit.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-emerald-400">● {s}</div>
                ))}
                {sourcesMissing.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[var(--muted)]">
                    ○ {s} <span className="text-[var(--muted)]/60">(no key)</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-[var(--muted)]/80">
              Add API keys in <Link href="/settings" className="text-cyan-400 hover:underline">Settings</Link> for stronger results.
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {loading && (
            <div className="panel p-6 text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{step || "Processing…"}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {["Scanning for faces & landmarks", "Reverse-searching Google Lens / SerpAPI", "Running Cloud Vision WebDetection", "Extracting EXIF, text, logos", "Generating AI investigator report"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-glow" /> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="panel p-4 border-rose-400/30 bg-rose-500/5 text-sm">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <AlertTriangle className="w-4 h-4" /> Warnings
              </div>
              <ul className="mt-2 space-y-1 text-xs text-[var(--muted)] list-disc pl-5">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {!loading && !aiJson && hits.length === 0 && (
            <div className="panel p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
                <EyeIcon className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="mt-3 font-semibold">Upload an image to begin</h3>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
                Drop a photo of a person to find where it appears online, read
                any text/logos in the frame, identify landmarks, and get an
                AI-generated OSINT brief.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 justify-center text-xs">
                <span className="chip">Reverse face search</span>
                <span className="chip">Google Lens-style match</span>
                <span className="chip">EXIF / metadata</span>
                <span className="chip">OCR & logo detection</span>
                <span className="chip">AI investigator brief</span>
              </div>
            </div>
          )}

          {aiJson && (
            <div className="panel p-5">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" /> AI investigator brief
              </h3>
              {aiJson.investigator_summary && (
                <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{aiJson.investigator_summary}</p>
              )}
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                {aiJson.demographics && (
                  <InfoCard icon={UserIcon} title="Subject observations" items={aiJson.demographics} />
                )}
                {aiJson.scene && (
                  <InfoCard icon={MapPin} title="Scene analysis" items={aiJson.scene} />
                )}
                {aiJson.image_metadata && (
                  <InfoCard icon={ImageIcon} title="Image metadata" items={aiJson.image_metadata} />
                )}
                {vision && (
                  <div className="rounded-lg border border-[var(--border)] bg-black/30 p-3">
                    <div className="text-xs uppercase text-[var(--muted)] tracking-widest mb-2 flex items-center gap-1">
                      <EyeIcon className="w-3 h-3" /> Cloud Vision
                    </div>
                    <div className="text-xs space-y-1.5">
                      {vision.faceAnnotations ? <div><span className="text-white">Faces detected:</span> <span className="text-cyan-400">{vision.faceAnnotations}</span></div> : null}
                      {vision.labels?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {vision.labels.map((l) => <span key={l} className="chip-gray chip text-[10px]">{l}</span>)}
                        </div>
                      ) : null}
                      {vision.logos?.length ? <div><span className="text-white">Logos:</span> <span className="text-cyan-400">{vision.logos.join(", ")}</span></div> : null}
                      {vision.landmarks?.length ? <div><span className="text-white">Landmarks:</span> <span className="text-cyan-400">{vision.landmarks.join(", ")}</span></div> : null}
                      {vision.text ? (
                        <div className="rounded bg-black/40 p-2 mono text-[10px] whitespace-pre-wrap max-h-28 overflow-auto">
                          {vision.text.slice(0, 1000)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              {aiJson.red_flags && aiJson.red_flags.length > 0 && (
                <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/5 p-3">
                  <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                    <ShieldAlert className="w-4 h-4" /> Red flags / cautions
                  </div>
                  <ul className="mt-2 text-xs text-[var(--muted)] list-disc pl-5 space-y-0.5">
                    {aiJson.red_flags.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {aiJson.reverse_search_tips && aiJson.reverse_search_tips.length > 0 && (
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-black/30 p-3">
                  <div className="text-xs uppercase text-[var(--muted)] tracking-widest mb-2 flex items-center gap-1">
                    <Search className="w-3 h-3" /> Search strategy
                  </div>
                  <ul className="text-xs space-y-1 list-disc pl-5 text-[var(--muted)]">
                    {aiJson.reverse_search_tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
              {aiJson.identity_hypotheses && aiJson.identity_hypotheses.length > 0 && (
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-black/30 p-3">
                  <div className="text-xs uppercase text-[var(--muted)] tracking-widest mb-2 flex items-center gap-1">
                    <UserIcon className="w-3 h-3" /> Identity hypotheses
                  </div>
                  <ul className="text-xs space-y-2">
                    {aiJson.identity_hypotheses.map((h, i) => (
                      <li key={i} className="text-[var(--muted)]">
                        <div className="flex items-center gap-2">
                          <span className="chip chip-cyan text-[10px]" style={{ background: "rgba(34,211,238,0.08)", borderColor: "rgba(34,211,238,0.25)", color: "#22d3ee" }}>{h.confidence || 0}%</span>
                          <span>{h.reasoning}</span>
                        </div>
                        {h.suggested_platforms && (
                          <div className="flex flex-wrap gap-1 mt-1 pl-6">
                            {h.suggested_platforms.map((p: string) => <span key={p} className="chip-gray chip text-[10px]">{p}</span>)}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!aiJson.demographics && aiRaw && (
                <pre className="mt-4 text-xs mono whitespace-pre-wrap bg-black/40 p-3 rounded border border-[var(--border)] max-h-64 overflow-auto">{aiRaw}</pre>
              )}
            </div>
          )}

          {hits.length > 0 && (
            <div className="panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" /> Reverse-image matches
                  <span className="text-xs text-[var(--muted)] ml-2">({hits.length} results)</span>
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {hits.slice(0, 24).map((h, i) => (
                  <a
                    key={i}
                    href={h.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-3 rounded-lg border border-[var(--border)] bg-black/30 p-3 hover:border-cyan-400/40 transition"
                  >
                    {h.image ? (
                      <img src={h.image} alt="" className="w-16 h-16 rounded object-cover shrink-0 bg-[var(--panel-2)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-16 h-16 rounded bg-[var(--panel-2)] flex items-center justify-center shrink-0 text-[var(--muted)] text-xs">
                        {h.exact ? "EXACT" : "match"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`chip text-[10px] ${h.exact ? "chip-red" : h.score && h.score > 0.8 ? "chip-green" : "chip-yellow"}`}>
                          {h.exact ? "Exact" : `${Math.round((h.score || 0) * 100)}%`}
                        </span>
                        <span className="text-[var(--muted)]">{h.source}</span>
                      </div>
                      <div className="text-sm font-medium mt-1 truncate">{h.title || "(untitled)"}</div>
                      {h.snippet && <div className="text-[11px] text-[var(--muted)] truncate">{h.snippet}</div>}
                      <div className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" /> {h.url}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, items }: { icon: any; title: string; items: Record<string, any> }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-black/30 p-3">
      <div className="text-xs uppercase text-[var(--muted)] tracking-widest mb-2 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {title}
      </div>
      <div className="text-xs space-y-1">
        {Object.entries(items).map(([k, v]) => {
          if (Array.isArray(v)) {
            return (
              <div key={k} className="flex flex-wrap gap-1 items-start">
                <span className="text-[var(--muted)] shrink-0">{k.replace(/_/g, " ")}:</span>
                <div className="flex flex-wrap gap-1">
                  {v.map((x: any, i: number) => (
                    <span key={i} className="chip-gray chip text-[10px]">{String(x)}</span>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={k}>
              <span className="text-[var(--muted)]">{k.replace(/_/g, " ")}:</span>{" "}
              <span className="text-white">{String(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
