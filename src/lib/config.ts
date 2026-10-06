/**
 * SpyBase runtime configuration.
 *
 * All secrets come from Vercel environment variables. When a key is not set,
 * its source is gracefully skipped and the UI shows a badge indicating the
 * data source wasn't configured. Add any or all of these to Vercel → Settings
 * → Environment Variables.
 *
 * All keys are optional — the app works with any subset.
 */

export type ProviderKey =
  // Email / breach / OSINT
  | "OPENROUTER_API_KEY"
  | "OPENROUTER_MODEL"
  | "HIBP_API_KEY"                 // haveibeenpwned.com (paid API key)
  | "LEAKCHECK_API_KEY"           // leakcheck.net
  | "LEAKCHECK_KEY_TYPE"          // "key" (default) or "master"
  | "EMAILREP_API_KEY"            // emailrep.io
  | "HUNTER_API_KEY"              // hunter.io (enrichment / domain search)
  | "INTELX_API_KEY"              // intelx.io (leaks, darknet, pastes)
  | "SNUSBASE_API_KEY"            // snusbase.com (breach DB)
  | "LEAKCHECKIO_API_KEY"         // leak-check.io (LeaksAPI)
  | "WELEAKINFO_API_KEY"          // weleakinfo.to
  | "PSBDMP_API_KEY"              // psbdmp.cc (pastebin dumps)
  | "DOMAINTOOLS_API_USER"
  | "DOMAINTOOLS_API_KEY"
  | "WHOISXML_API_KEY"            // whoisxmlapi.com (reverse whois, email history)
  | "HIBP_NO_KEY"                 // set to "1" to use free HIBP endpoint (no key, rate-limited)
  | "PYPIG_API_KEY"               // proxycurl / people data
  | "EPLEO_API_KEY"               // epieos / epistalky (free + paid)
  | "SHERLOCK_DATA"               // path/url to sherlock data (self-hosted)
  | "GRAVATAR_ENABLED"            // "1" (default) — gravatar profile lookup
  | "ENRICH_FROM_SOCIAL"          // "1" (default) — call public social endpoint probes
  // Face / reverse-image OSINT
  | "FACECHECK_ID_TOKEN"          // facecheck.id bearer token (scraped API — use at own risk)
  | "PIMEYES_API_KEY"             // pimeyes.com premium API
  | "SEARCH4FACES_API_KEY"        // search4faces.com
  | "SOCIALCATFISH_API_KEY"       // socialcatfish.com reverse image
  | "BEENVERIFIED_API_KEY"        // beenverified / people-lookup
  | "GOOGLE_CLOUD_VISION_API_KEY" // Google Cloud Vision API (web detection, face, labels)
  | "GOOGLE_CSE_ID"               // Google Custom Search Engine ID (for reverse image search)
  | "GOOGLE_CSE_API_KEY"          // Google Custom Search JSON API key
  | "BING_SEARCH_API_KEY"         // Bing Image Search API
  | "YANDEX_VISION_API_KEY"       // Yandex Vision OCR
  | "PIM_EYES_CSRF"               // if using unofficial pimeyes
  | "SERPAPI_KEY"                 // SerpAPI reverse image search (Google Lens endpoint)
  | "TINEYE_API_KEY"              // TinEye reverse image API
  | "CLARIFAI_API_KEY"            // Clarifai celebrity/face model
  // Admin
  | "ADMIN_PASSWORD"              // owner-only access (simple gate until you wire auth)
  | "ADMIN_PASSWORD_SHA256"       // or store a sha256 hex (recommended over plaintext)
  | "SESSION_SECRET"              // random string for signed sessions
  | "NEXT_PUBLIC_APP_NAME"
  | "DEMO_MODE";                  // "1" = show mock data even when keys are configured (for screenshots)

export function cfg(key: ProviderKey): string | undefined {
  // Next.js exposes server env via process.env (only available server-side)
  return (process.env as any)[key];
}

export function cfgBool(key: ProviderKey): boolean {
  const v = (cfg(key) || "").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isDemo(): boolean {
  return cfgBool("DEMO_MODE");
}

export function hasAny(key: ProviderKey): boolean {
  return !!cfg(key);
}

/** Describes each env var for the /settings panel. */
export const ENV_DOCS: {
  key: ProviderKey;
  label: string;
  category: "Email / Breach OSINT" | "Face / Reverse-Image" | "AI" | "Admin" | "App";
  help: string;
  free?: boolean;
  link?: string;
}[] = [
  { key: "NEXT_PUBLIC_APP_NAME", label: "App name", category: "App", help: "Branding override (default: SpyBase).", free: true },
  { key: "DEMO_MODE", label: "Demo mode", category: "App", help: "Set to 1 to force mock/sample data (useful for screenshots, demos).", free: true },

  { key: "OPENROUTER_API_KEY", label: "OpenRouter API key", category: "AI", help: "Enables the AI analyst chat + image vision for the Face Lookup tab. Free-tier models (google/gemini-2.0-flash-exp:free, meta-llama/llama-3.2-3b-instruct:free) work great.", free: true, link: "https://openrouter.ai/keys" },
  { key: "OPENROUTER_MODEL", label: "OpenRouter model", category: "AI", help: "Model id (defaults to google/gemini-2.0-flash-exp:free). Use vision-capable model (gemini, gpt-4o, qwen-vl, etc.) for face/image analysis.", free: true },

  { key: "HIBP_NO_KEY", label: "Use free HaveIBeenPwned", category: "Email / Breach OSINT", help: "Set to 1 to use the public HIBP breach endpoint without a key (rate-limited, no paste support).", free: true },
  { key: "HIBP_API_KEY", label: "HIBP paid API key", category: "Email / Breach OSINT", help: "haveibeenpwned.com API key (paid plan) for full breach + paste data.", link: "https://haveibeenpwned.com/API/Key" },
  { key: "LEAKCHECK_API_KEY", label: "LeakCheck API key", category: "Email / Breach OSINT", help: "leakcheck.net — breach data and quick lookups.", link: "https://leakcheck.net" },
  { key: "LEAKCHECK_KEY_TYPE", label: "LeakCheck key type", category: "Email / Breach OSINT", help: "'key' (default) or 'master'.", free: true },
  { key: "LEAKCHECKIO_API_KEY", label: "Leak-Checks (LeaksAPI) key", category: "Email / Breach OSINT", help: "leak-check.io / LeaksAPI — 1800+ leaked DBs + infostealer logs.", link: "https://leakcheck.io" },
  { key: "SNUSBASE_API_KEY", label: "Snusbase API key", category: "Email / Breach OSINT", help: "snusbase.com — breach database with strong infostealer coverage.", link: "https://snusbase.com" },
  { key: "WELEAKINFO_API_KEY", label: "WeLeakInfo API key", category: "Email / Breach OSINT", help: "weleakinfo.to — large credential database.", link: "https://weleakinfo.to" },
  { key: "INTELX_API_KEY", label: "IntelligenceX API key", category: "Email / Breach OSINT", help: "intelx.io — leaks, darknet, pastebins, historical web.", free: true, link: "https://intelx.io" },
  { key: "PSBDMP_API_KEY", label: "psbdmp.cc API key", category: "Email / Breach OSINT", help: "Pastebin dump index (free public API, no key required for basic)." },
  { key: "EMAILREP_API_KEY", label: "EmailRep API key", category: "Email / Breach OSINT", help: "emailrep.io — reputation, first seen, social profiles, data exposure. Free tier available.", free: true, link: "https://emailrep.io/key" },
  { key: "HUNTER_API_KEY", label: "Hunter.io API key", category: "Email / Breach OSINT", help: "hunter.io — domain search, email verification, enrichment.", link: "https://hunter.io" },
  { key: "WHOISXML_API_KEY", label: "WhoisXML API key", category: "Email / Breach OSINT", help: "whoisxmlapi.com — reverse WHOIS, contact records, email discovery.", free: true, link: "https://user.whoisxmlapi.com" },
  { key: "PYPIG_API_KEY", label: "Proxycurl (LinkedIn) key", category: "Email / Breach OSINT", help: "nubela/proxycurl — LinkedIn person lookup from email.", link: "https://nubela.co/proxycurl" },
  { key: "EPLEO_API_KEY", label: "Epieos key", category: "Email / Breach OSINT", help: "epieos.com — free/paid OSINT (email → Google account, LinkedIn, etc.).", free: true, link: "https://epieos.com" },
  { key: "GRAVATAR_ENABLED", label: "Enable Gravatar", category: "Email / Breach OSINT", help: "Set to 0 to disable Gravatar profile lookup (enabled by default).", free: true },
  { key: "ENRICH_FROM_SOCIAL", label: "Enable public social probes", category: "Email / Breach OSINT", help: "Set to 0 to disable public account-presence probes (enabled by default).", free: true },

  { key: "SERPAPI_KEY", label: "SerpAPI key", category: "Face / Reverse-Image", help: "Google Lens / reverse-image search via SerpAPI. Strongest free reverse-image provider for general web lookups.", free: true, link: "https://serpapi.com" },
  { key: "GOOGLE_CSE_API_KEY", label: "Google Custom Search API key", category: "Face / Reverse-Image", help: "For reverse-image search via Google CSE (alternative to SerpAPI).", free: true, link: "https://console.cloud.google.com" },
  { key: "GOOGLE_CSE_ID", label: "Google CSE engine ID", category: "Face / Reverse-Image", help: "Pair with Google Custom Search API key.", free: true },
  { key: "BING_SEARCH_API_KEY", label: "Bing Image Search API key", category: "Face / Reverse-Image", help: "Microsoft Bing reverse image search.", free: true, link: "https://www.microsoft.com/en-us/bing/apis/bing-image-search-api" },
  { key: "TINEYE_API_KEY", label: "TinEye API key", category: "Face / Reverse-Image", help: "tineye.com — exact match reverse image search.", link: "https://tineye.com/api" },
  { key: "GOOGLE_CLOUD_VISION_API_KEY", label: "Google Cloud Vision API key", category: "Face / Reverse-Image", help: "Detects faces, labels, landmarks, logos, web entities, OCR, and similar images via Vision API WebDetection.", free: true, link: "https://console.cloud.google.com" },
  { key: "CLARIFAI_API_KEY", label: "Clarifai API key", category: "Face / Reverse-Image", help: "Celebrity / face recognition model.", free: true, link: "https://www.clarifai.com" },
  { key: "YANDEX_VISION_API_KEY", label: "Yandex Vision OCR key", category: "Face / Reverse-Image", help: "Russian OCR + face detection (useful for CIS sources).", free: true },
  { key: "SEARCH4FACES_API_KEY", label: "Search4Faces API key", category: "Face / Reverse-Image", help: "search4faces.com — reverse face search across VK/TikTok/clubhouse avatars.", free: true, link: "https://search4faces.com" },
  { key: "FACECHECK_ID_TOKEN", label: "FaceCheck.id token", category: "Face / Reverse-Image", help: "facecheck.id reverse face search (captcha/CSRF token from your session — unofficial).", link: "https://facecheck.id" },
  { key: "PIMEYES_API_KEY", label: "PimEyes API key", category: "Face / Reverse-Image", help: "pimeyes.com premium reverse face search." },
  { key: "SOCIALCATFISH_API_KEY", label: "SocialCatfish API key", category: "Face / Reverse-Image", help: "socialcatfish.com people search + reverse image.", },
  { key: "BEENVERIFIED_API_KEY", label: "BeenVerified API key", category: "Face / Reverse-Image", help: "BeenVerified person lookup." },

  { key: "ADMIN_PASSWORD", label: "Admin password (plaintext)", category: "Admin", help: "Simple password gate for owner-only access. Set this or the SHA256 below.", free: true },
  { key: "ADMIN_PASSWORD_SHA256", label: "Admin password SHA-256", category: "Admin", help: "Hex-encoded SHA-256 hash of your password (safer than plaintext).", free: true },
  { key: "SESSION_SECRET", label: "Session secret", category: "Admin", help: "Random long string used to sign session cookies.", free: true },
];
